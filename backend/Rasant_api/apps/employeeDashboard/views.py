
import datetime
import calendar
from rest_framework.decorators import permission_classes
from accounts.models import Role
from django.http import HttpResponse
from dateutil.relativedelta import relativedelta
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.db.models import Q
from datetime import date, timedelta
from django.conf import settings
from collections import defaultdict
from decimal import Decimal
from django.db import transaction
from .serializers import calculate_next_effective_date, EmploymentStatusSerializer, EmployeeStatusUpdateSerializer
from django.utils import timezone
import re
from django.contrib.auth.hashers import make_password
from accounts.email_service import (
    send_employee_welcome,
    send_onboarding_complete,
    send_employee_status_changed,
    send_job_published,
    send_increments_due_digest,
    send_branded_email,
    send_candidate_reply_email,
)
from accounts.models import EmailSettings
from django.conf import settings as django_settings
from .utils import calculate_status, calculate_late_and_overtime

User = get_user_model()

from .models import (
    Employee, CVSubmission, JobOpening, JobStatus,
    IncrementType, IncrementPolicy, CycleTiming, ApplicationMode, EmployeePolicyAssignment,
    SalaryIncrementHistory, SalaryDeductionHistory, Attendance, PayrollSettings, EmploymentStatus,
)
from .serializers import (
    EmployeeSerializer, EmployeeListSerializer, UpdateEmployeeSerializer,
    CVSubmissionSerializer, JobOpeningSerializer, JobTypeSerializer, JobStatusSerializer,
    IncrementTypeSerializer, CycleTimingSerializer, ApplicationModeSerializer,
    IncrementPolicySerializer, EmployeePolicyAssignmentSerializer, EmployeeAttendanceSerializer, AttendanceBulkRowSerializer,
    AttendanceHistorySerializer, PayrollSettingsSerializer
)


# ---------- Helper function for employee number generation ----------
def generate_employee_number():
    now = datetime.datetime.now()
    prefix = f"RS-{now.strftime('%m%y')}-"
    last = Employee.objects.filter(
        employee_number__startswith=prefix
    ).order_by('employee_number').last()
    if last:
        last_seq = int(last.employee_number.split('-')[-1])
        new_seq = last_seq + 1
    else:
        new_seq = 1
    return f"{prefix}{new_seq:02d}"


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
@permission_classes([IsAuthenticated])
def add_employee(request):
    """Create employee + linked User (employee role) and ensure sidebar modules."""
    from accounts.employee_access import ensure_employee_modules, ensure_user_is_employee

    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    file_fields = (
        "cnic_scan",
        "emergency_cnic_scan",
        "matric_certificate",
        "fsc_certificate",
        "university_degree",
        "other_course",
    )
    # Build a plain dict — never QueryDict.copy() with uploads (cannot pickle temp files).
    data = {}
    for key in request.data.keys():
        if key in file_fields:
            continue
        value = request.data.get(key)
        if hasattr(value, "read"):
            continue
        data[key] = value
    source = request.data.get('source', 'admin_quick')
    data['source'] = source

    for blank_key in ("cnic", "emergency_cnic", "gender"):
        if blank_key in data and data.get(blank_key) in ("", None):
            data[blank_key] = None
    if "joined_date" in data and data.get("joined_date") in ("", None):
        data.pop("joined_date", None)

    if "is_active" in data:
        raw_active = data.get("is_active")
        if isinstance(raw_active, str):
            data["is_active"] = raw_active.strip().lower() in ("1", "true", "yes", "on")

    serializer = EmployeeSerializer(data=data,context={'source': source})
    if not serializer.is_valid():
        return Response(
            {"error": "Validation failed.", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    validated = serializer.validated_data
    employee_role, _ = Role.objects.get_or_create(name="employee")
    ensure_employee_modules()

    email = validated["email"]
    name = (validated.get("name") or "").strip() or email.split("@")[0]
    base_username = re.sub(r"[^a-zA-Z0-9.@+-]", "", email.split("@")[0])[:40] or "employee"
    username = base_username
    suffix = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{suffix}"
        suffix += 1

    name_parts = name.split(" ", 1)
    first_name = name_parts[0] if name_parts else ""
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    file_payload = {}
    for field_name in file_fields:
        uploaded_file = request.FILES.get(field_name)
        if uploaded_file:
            if uploaded_file.size > MAX_FILE_SIZE:
                return Response(
                    {
                        "error": (
                            f"The file '{field_name}' exceeds the "
                            f"{MAX_FILE_SIZE // (1024 * 1024)} MB size limit."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            file_payload[field_name] = {
                "data": uploaded_file.read(),
                "name": uploaded_file.name,
                "mimetype": uploaded_file.content_type,
            }

    try:
        with transaction.atomic():
            user_account = User(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                is_staff=False,
                is_active=True,
                role=employee_role,
            )
            user_account.set_unusable_password()
            user_account.save()

            employee = Employee(**validated)
            employee.name = name
            employee.current_salary = employee.salary
            employee.password = None
            employee.user = user_account

            for field_name, meta in file_payload.items():
                setattr(employee, f"{field_name}_data", meta["data"])
                setattr(employee, f"{field_name}_name", meta["name"])
                setattr(employee, f"{field_name}_mimetype", meta["mimetype"])

            saved = False
            for _ in range(5):
                employee.employee_number = generate_employee_number()
                try:
                    employee.save()
                    saved = True
                    break
                except IntegrityError:
                    continue

            if not saved:
                raise IntegrityError("Could not generate a unique employee number.")

            ensure_user_is_employee(user_account)

            from accounts.password_tokens import create_setup_token, SETUP_TTL_HOURS
            setup_token = create_setup_token(user_account)

    except IntegrityError as exc:
        return Response(
            {"error": str(exc) or "Could not create employee due to a conflict."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as exc:
        return Response(
            {"error": f"Failed to create employee: {exc}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        if employee.joined_date:
            calculate_and_save_deduction(
                employee=employee,
                tax_percent=employee.tax,
                insurance_amount=employee.insurance_amount,
                deduction_month=date.today().replace(day=1),
            )
    except Exception as ded_err:
        print(f"Deduction calculation failed after employee create: {ded_err}")

    frontend = getattr(django_settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")
    setup_url = f"{frontend}/create-password/{setup_token.token}"
    email_sent = False
    try:
        from accounts.password_tokens import SETUP_TTL_HOURS
        email_sent = bool(send_employee_welcome(employee, setup_url, ttl_hours=SETUP_TTL_HOURS))
    except Exception as mail_err:
        print(f"Welcome email failed after employee create: {mail_err}")

    return Response(
        {
            "success": True,
            "message": "Employee added successfully. A create-password link was emailed.",
            "employee_number": employee.employee_number,
            "name": employee.name,
            "email_sent": email_sent,
            "status": employee.status.name if employee.status_id else None,
            "status_id": employee.status_id,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_employees(request):
    employees = (
        Employee.objects.select_related("status")
        .all()
        .order_by("-created_at")
        .prefetch_related("deduction_history")
    )
    for emp in employees:
        try:
            renew_insurance_cycle(emp)
        except Exception as renew_err:
            print(f"Insurance renew failed for {emp.id}: {renew_err}")
    serializer = EmployeeListSerializer(employees, many=True)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_employee(request, pk):
    """Update employee fields; keep linked User on employee role and sync password."""
    from accounts.employee_access import ensure_employee_modules, ensure_user_is_employee

    try:
        employee = Employee.objects.get(pk=pk)
    except Employee.DoesNotExist:
        return Response({"error": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

    old_tax = employee.tax
    old_insurance_amount = employee.insurance_amount
    old_salary = employee.salary
    old_status_name = employee.status.name if employee.status_id else ""

    raw = request.data
    file_field_names = {
        "cnic_scan",
        "emergency_cnic_scan",
        "matric_certificate",
        "fsc_certificate",
        "university_degree",
        "other_course",
    }
    data = {
        key: value
        for key, value in raw.items()
        if key not in file_field_names and not hasattr(value, "read")
    }

    for key in (
            "cnic",
            "emergency_cnic",
            "gender",
            "present_address",
            "permanent_address",
            "emergency_name",
            "emergency_relation",
            "emergency_phone",
            "emergency_address",
            "bank_name",
            "branch_name",
            "branch_code",
            "account_number",
    ):
        if key in data and data[key] == "":
            data[key] = None

    for key in ("salary", "tax", "insurance_amount", "joined_date"):
        if key in data and data[key] in ("", None):
            data.pop(key)

    data.pop("confirmPassword", None)
    data.pop("employee_number", None)
    data.pop("full_name", None)

    new_password = data.pop("password", None)
    if new_password == "":
        new_password = None

    serializer = UpdateEmployeeSerializer(
        employee,
        data=data,
        partial=True,
        context={"request": request},
    )
    if not serializer.is_valid():
        return Response(
            {"error": "Validation failed.", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    updated_employee = serializer.save()
    updated_employee.current_salary = updated_employee.salary
    updated_employee.save(update_fields=["current_salary"])

    # Sync is_active, name, email, and date_joined to User table
    if updated_employee.user:
        user_updated = False
        # Sync is_active
        if updated_employee.user.is_active != updated_employee.is_active:
            updated_employee.user.is_active = updated_employee.is_active
            user_updated = True
        # Sync email
        if updated_employee.user.email != updated_employee.email:
            updated_employee.user.email = updated_employee.email
            user_updated = True
        # Sync username from employee name
        if updated_employee.name and updated_employee.user.username != updated_employee.name:
            updated_employee.user.username = updated_employee.name
            user_updated = True
        # Sync date_joined from joined_date
        if updated_employee.joined_date and updated_employee.user.date_joined != updated_employee.joined_date:
            updated_employee.user.date_joined = updated_employee.joined_date
            user_updated = True

        if user_updated:
            updated_employee.user.save()

    ensure_employee_modules()
    linked_user = updated_employee.user
    if linked_user is None and updated_employee.email:
        linked_user = User.objects.filter(email__iexact=updated_employee.email).first()
        if linked_user:
            updated_employee.user = linked_user
            updated_employee.save(update_fields=["user"])

    if linked_user is None and new_password:
        employee_role, _ = Role.objects.get_or_create(name="employee")
        name_parts = (updated_employee.name or "").strip().split(" ", 1)
        base_username = re.sub(
            r"[^a-zA-Z0-9.@+-]",
            "",
            (updated_employee.email or "employee").split("@")[0],
        )[:40] or "employee"
        username = base_username
        suffix = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{suffix}"
            suffix += 1
        linked_user = User(
            username=username,
            email=updated_employee.email,
            first_name=name_parts[0] if name_parts else "",
            last_name=name_parts[1] if len(name_parts) > 1 else "",
            is_staff=False,
            is_active=updated_employee.is_active,
            date_joined=updated_employee.joined_date or timezone.now(),
            role=employee_role,
        )
        linked_user.set_password(new_password)
        linked_user.save()
        updated_employee.user = linked_user
        updated_employee.save(update_fields=["user"])

    if linked_user:
        ensure_user_is_employee(linked_user)

    if new_password:
        hashed_password = make_password(new_password)
        updated_employee.password = hashed_password
        updated_employee.save(update_fields=["password"])
        if linked_user:
            linked_user.set_password(new_password)
            linked_user.save()

    try:
        salary_changed = updated_employee.salary != old_salary
        tax_changed = updated_employee.tax != old_tax
        insurance_changed = updated_employee.insurance_amount != old_insurance_amount
        if salary_changed or tax_changed or insurance_changed:
            calculate_and_save_deduction(
                employee=updated_employee,
                tax_percent=updated_employee.tax or 0,
                insurance_amount=updated_employee.insurance_amount or 0,
                deduction_month=date.today().replace(day=1),
            )
    except Exception as e:
        print(f"Deduction calculation failed: {e}")

    try:
        new_status_name = updated_employee.status.name if updated_employee.status_id else ""
        if old_status_name != new_status_name:
            send_employee_status_changed(updated_employee, old_status_name, new_status_name)
            try:
                from accounts.notifications import notify_users
                if updated_employee.user_id:
                    notify_users(
                        updated_employee.user,
                        type='status',
                        title='Employment status updated',
                        body=f'Your status changed from {old_status_name} to {new_status_name}.',
                        link='/employee/overview',
                        actor=request.user,
                        payload={
                            'old_status': old_status_name,
                            'new_status': new_status_name,
                        },
                    )
            except Exception as notify_err:
                print(f'Status notification failed: {notify_err}')
    except Exception as mail_err:
        print(f"Status change email failed: {mail_err}")

    return Response(
        {
            "success": True,
            "message": "Employee updated successfully.",
            "employee_number": updated_employee.employee_number,
            "name": updated_employee.name,
            "id": updated_employee.id,
            "email": updated_employee.email,
            "department": updated_employee.department,
            "designation": updated_employee.designation,
            "salary": updated_employee.salary,
            "status": updated_employee.status.name if updated_employee.status_id else None,
            "status_id": updated_employee.status_id,
            "password_updated": bool(new_password),
        },
        status=status.HTTP_200_OK,
    )

@api_view(["GET", "POST", "DELETE", "PUT"])
@parser_classes([MultiPartParser, FormParser, JSONParser])
@permission_classes([AllowAny])
def cv_submission_view(request, pk=None):

    if request.method == "GET":
        cvs = CVSubmission.objects.select_related('job', 'application_status').all()
        job_param = request.query_params.get('job')
        if job_param is not None:
            if job_param.lower() in ('null', 'none', 'general', ''):
                cvs = cvs.filter(job__isnull=True)
            else:
                cvs = cvs.filter(job_id=job_param)

        serializer = CVSubmissionSerializer(cvs, many=True)
        return Response(
            {"status": "success", "data": serializer.data},
            status=status.HTTP_200_OK,
        )
    elif request.method == "POST":
        serializer = CVSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get("email")
            phone = serializer.validated_data.get("phone")
            today = date.today()

            already_submitted = (
                CVSubmission.objects.filter(submitted_at__date=today)
                .filter(Q(email=email) | Q(phone=phone))
                .exists()
            )

            if already_submitted:
                return Response(
                    {"error": "You have already submitted a CV today. Please try again tomorrow."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

            serializer.save()
            try:
                from accounts.notifications import notify_admins
                data = serializer.data
                applicant = data.get('full_name') or data.get('email') or 'Applicant'
                job_title = ''
                try:
                    job = data.get('job')
                    if isinstance(job, dict):
                        job_title = job.get('job_title') or ''
                except Exception:
                    pass
                notify_admins(
                    type='cv',
                    title='New CV submitted',
                    body=f'{applicant}' + (f' applied for {job_title}' if job_title else ' submitted a CV'),
                    link='/admin/career',
                    payload={'cv_id': data.get('id')},
                )
            except Exception as notify_err:
                print(f'CV notification failed: {notify_err}')
            return Response(
                {"message": "Application submitted successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        try:
            cv = CVSubmission.objects.get(pk=pk)
        except CVSubmission.DoesNotExist:
            return Response(
                {"status": "error", "message": "CV submission not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        cv.delete()
        return Response(
            {"status": "success", "message": "CV submission deleted successfully."},
            status=status.HTTP_200_OK,
        )
    elif request.method == "PUT":
        try:
            cv = CVSubmission.objects.get(pk=pk)
        except CVSubmission.DoesNotExist:
            return Response(
                {"status": "error", "message": "CV submission not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CVSubmissionSerializer(cv, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"status": "success", "message": "CV status updated successfully.", "data": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(
            {"status": "error", "message": "Failed to update.", "errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def send_candidate_email_view(request):
    if request.method == 'POST':
        to_email = (request.data.get('email') or '').strip()
        subject = (request.data.get('subject') or '').strip()
        message = (request.data.get('message') or '').strip()
        recipient_name = (request.data.get('name') or '').strip()

        if not all([to_email, subject, message]):
            return Response({
                'status': 'error',
                'message': 'Email, subject, and message are required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            send_candidate_reply_email(to_email, subject, message, recipient_name)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'Failed to send email.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'status': 'success',
            'message': 'Email sent successfully.'
        }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def cv_download_view(request, pk):
    cv = get_object_or_404(CVSubmission, pk=pk)

    response = HttpResponse(bytes(cv.cv_file), content_type=cv.cv_file_type)
    response['Content-Disposition'] = f'attachment; filename="{cv.cv_file_name}"'
    return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def job_create_view(request):
    serializer = JobOpeningSerializer(data=request.data)
    if serializer.is_valid():
        job_opening = serializer.save()
        return Response({
            'status': 'success',
            'message': 'Job opening created successfully.',
            'data': JobOpeningSerializer(job_opening).data
        }, status=status.HTTP_201_CREATED)
    return Response({
        'status': 'error',
        'message': 'Failed to create job opening.',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def job_list_view(request):
    if request.user and request.user.is_authenticated:
        jobs = JobOpening.objects.all()
    else:
        jobs = JobOpening.objects.filter(status__name='Published')
    serializer = JobOpeningSerializer(jobs, many=True)
    return Response({
        'status': 'success',
        'data': serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def job_update_view(request, pk):
    try:
        job_opening = JobOpening.objects.get(pk=pk)
    except JobOpening.DoesNotExist:
        return Response({
            'status': 'error',
            'message': 'Job opening not found.'
        }, status=status.HTTP_404_NOT_FOUND)

    old_status_name = (job_opening.status.name if job_opening.status else '').lower()

    serializer = JobOpeningSerializer(job_opening, data=request.data, partial=True)
    if serializer.is_valid():
        updated_job = serializer.save()
        new_status_name = (updated_job.status.name if updated_job.status else '').lower()

        if old_status_name == 'draft' and new_status_name == 'published':
            try:
                send_job_published(updated_job)
            except Exception as mail_err:
                print(f"Job published email failed: {mail_err}")
            try:
                from accounts.notifications import notify_admins
                notify_admins(
                    type='job',
                    title='Job published',
                    body=f'{updated_job.job_title} is now live on careers.',
                    link='/admin/career',
                    actor=request.user,
                    payload={'job_id': updated_job.id},
                )
            except Exception as notify_err:
                print(f'Job notification failed: {notify_err}')

        return Response({
            'status': 'success',
            'message': 'Job updated successfully.',
            'data': JobOpeningSerializer(updated_job).data
        }, status=status.HTTP_200_OK)

    return Response({
        'status': 'error',
        'message': 'Failed to update job.',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def job_types_view(request):
    from .models import JobType
    job_types = JobType.objects.all()
    serializer = JobTypeSerializer(job_types, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def job_status_view(request):
    statuses = JobStatus.objects.all()
    serializer = JobStatusSerializer(statuses, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
def send_invitation_email(request):
    employee_id = request.data.get('employee_id')
    if not employee_id:
        return Response(
            {"error": "employee_id is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        employee = Employee.objects.get(id=employee_id)
    except Employee.DoesNotExist:
        return Response(
            {"error": "Employee not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    frontend = getattr(django_settings, 'FRONTEND_URL', 'http://localhost:5173')
    onboarding_link = f"{frontend}/onboarding/{employee.employee_number}"

    try:
        send_branded_email(
            subject="Complete your employee onboarding — Rasant Solutions",
            template_name="emails/onboarding_invite.html",
            context={
                'employee_name': employee.name,
                'employee_number': employee.employee_number,
                'onboarding_link': onboarding_link,
            },
            to=employee.email,
            fail_silently=False,
        )
    except Exception as e:
        return Response(
            {"error": f"Failed to send email: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response(
        {"message": "Invitation email sent successfully"},
        status=status.HTTP_200_OK
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def increment_lookups_view(request):
    return Response({
        "status": "success",
        "data": {
            "increment_types":  IncrementTypeSerializer(IncrementType.objects.all(), many=True).data,
            "cycle_timings":    CycleTimingSerializer(CycleTiming.objects.all(), many=True).data,
            "application_modes": ApplicationModeSerializer(ApplicationMode.objects.all(), many=True).data,
        }
    }, status=status.HTTP_200_OK)

@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def increment_policy_view(request, pk=None):
    if request.method == "GET":
        policies = IncrementPolicy.objects.select_related(
            'increment_type', 'cycle_timing', 'application_mode'
        ).all()
        serializer = IncrementPolicySerializer(policies, many=True)
        return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)

    elif request.method == "POST":
        serializer = IncrementPolicySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"status": "success", "message": "Policy created successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response({"status": "error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "PUT":
        try:
            policy = IncrementPolicy.objects.get(pk=pk)
        except IncrementPolicy.DoesNotExist:
            return Response({"status": "error", "message": "Policy not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = IncrementPolicySerializer(policy, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"status": "success", "message": "Policy updated successfully.", "data": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response({"status": "error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        try:
            policy = IncrementPolicy.objects.get(pk=pk)
        except IncrementPolicy.DoesNotExist:
            return Response({"status": "error", "message": "Policy not found."}, status=status.HTTP_404_NOT_FOUND)
        policy.delete()
        return Response({"status": "success", "message": "Policy deleted successfully."}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def policy_assignments_view(request):
    assignments = EmployeePolicyAssignment.objects.select_related('employee', 'policy').all()
    serializer = EmployeePolicyAssignmentSerializer(assignments, many=True)
    return Response({"status": "success", "data": serializer.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_policy_assignments_view(request, policy_id):
    try:
        policy = IncrementPolicy.objects.get(pk=policy_id)
    except IncrementPolicy.DoesNotExist:
        return Response({"status": "error", "message": "Policy not found."}, status=status.HTTP_404_NOT_FOUND)

    employee_ids = request.data.get('employee_ids', [])
    if not isinstance(employee_ids, list):
        return Response({"status": "error", "message": "employee_ids must be a list."}, status=status.HTTP_400_BAD_REQUEST)

    existing_ids = set(
        EmployeePolicyAssignment.objects.filter(policy=policy).values_list('employee_id', flat=True)
    )
    new_ids = set(employee_ids)

    to_remove = existing_ids - new_ids
    to_add = new_ids - existing_ids

    if to_remove:
        EmployeePolicyAssignment.objects.filter(policy=policy, employee_id__in=to_remove).delete()

    if to_add:
        EmployeePolicyAssignment.objects.bulk_create([
            EmployeePolicyAssignment(
                employee_id=emp_id,
                policy=policy,
            )
            for emp_id in to_add
        ])

    assignments = EmployeePolicyAssignment.objects.filter(policy=policy).select_related('employee')
    serializer = EmployeePolicyAssignmentSerializer(assignments, many=True)
    return Response(
        {"status": "success", "message": "Assignments updated.", "data": serializer.data},
        status=status.HTTP_200_OK,
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def force_increment_view(request):
    employee_ids = request.data.get('employee_ids')

    assignments = (
        EmployeePolicyAssignment.objects
        .select_related('employee', 'policy', 'policy__increment_type')
        .filter(policy__is_active=True)
        .order_by('employee_id', 'policy_id')
    )
    if employee_ids:
        assignments = assignments.filter(employee_id__in=employee_ids)

    by_employee = defaultdict(list)
    for a in assignments:
        by_employee[a.employee_id].append(a)

    if not by_employee:
        return Response(
            {"status": "success", "message": "No employees are assigned to any active policy.", "data": []},
            status=status.HTTP_200_OK,
        )

    results = []
    touched_policy_ids = set()
    deduction_month = date.today().replace(day=1)

    with transaction.atomic():
        for employee_id, emp_assignments in by_employee.items():
            employee = emp_assignments[0].employee
            old_salary = employee.current_salary or employee.salary
            running_salary = old_salary
            applied_policies = []

            for a in emp_assignments:
                policy = a.policy
                touched_policy_ids.add(policy.id)

                if policy.increment_type.code == 'percentage':
                    increment_amount = (running_salary * policy.amount) / 100
                else:
                    increment_amount = policy.amount

                running_salary += increment_amount

                SalaryIncrementHistory.objects.create(
                    employee=employee,
                    policy=policy,
                    old_salary=old_salary,
                    increment_type=policy.increment_type.code,
                    increment_value=policy.amount,
                    increment_amount=increment_amount,
                    new_salary=running_salary,
                )
                applied_policies.append(policy.policy_name)

            employee.current_salary = running_salary
            employee.increment_applied_on = date.today()
            employee.is_increment_pending = False
            employee.save(update_fields=[ 'current_salary', 'increment_applied_on', 'is_increment_pending'])

            deduction = calculate_and_save_deduction(
                employee=employee,
                tax_percent=employee.tax,
                insurance_amount=employee.insurance_amount,
                deduction_month=deduction_month,
            )

            results.append({
                "employee_id": employee.id,
                "employee_name": employee.name,
                "old_salary": str(old_salary),
                "new_salary": str(running_salary),
                "policies_applied": applied_policies,
                "tax_amount": str(deduction.tax_amount),
                "salary_after_tax": str(deduction.salary_after_tax),
                "insurance_amount": str(deduction.insurance_amount),
                "net_salary": str(deduction.net_salary),
            })

        if touched_policy_ids:
            IncrementPolicy.objects.filter(id__in=touched_policy_ids).update(last_run_date=date.today())

    return Response(
        {
            "status": "success",
            "message": f"Force increment applied to {len(results)} employee(s).",
            "data": results,
        },
        status=status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def increments_due_today_view(request):
    today = date.today()
    print(f"\n===== increments_due_today_view CALLED =====")
    print(f"TODAY: {today}")

    assignments = (
        EmployeePolicyAssignment.objects
        .filter(
            policy__is_active=True,
            policy__application_mode__code='manual'
        )
        .select_related('employee', 'policy', 'policy__cycle_timing')
    )

    data = []

    for a in assignments:
        employee = a.employee
        policy = a.policy
        cycle_code = policy.cycle_timing.code

        base_date = employee.increment_applied_on or employee.joined_date
        print(f"  base_date={base_date}")

        next_due_date = calculate_next_effective_date(cycle_code, from_date=base_date)
        print(f"  next_due_date={next_due_date}")

        is_due = next_due_date <= today
        print(f"  is_due (next_due_date <= today): {is_due}")

        if is_due:
            data.append({
                "employee_id": employee.id,
                "employee_name": employee.name,
                "policy_id": policy.id,
                "policy_name": policy.policy_name,
            })
            print(f"ADDED to due list")
        else:
            print(f" NOT due yet")

    print(f"\n===== FINAL DUE LIST ({len(data)} employees) =====")
    print(data)
    print("=====================================\n")

    # Notify admin once per day when increments are due
    if data:
        try:
            email_cfg = EmailSettings.get_solo()
            if email_cfg.last_increment_digest_sent != today:
                try:
                    from accounts.notifications import notify_admins
                    names = ', '.join(item['employee_name'] for item in data[:5])
                    extra = f' (+{len(data) - 5} more)' if len(data) > 5 else ''
                    notify_admins(
                        type='increment',
                        title=f'{len(data)} increment(s) due today',
                        body=f'{names}{extra}',
                        link='/admin/employees/salaries',
                        payload={'count': len(data)},
                    )
                except Exception as notify_err:
                    print(f'Increment notification failed: {notify_err}')
                try:
                    send_increments_due_digest(data)
                except Exception as mail_err:
                    print(f"Increment digest email failed: {mail_err}")
                email_cfg.last_increment_digest_sent = today
                email_cfg.save(update_fields=['last_increment_digest_sent'])
        except Exception as outer_err:
            print(f"Increment daily notify failed: {outer_err}")

    return Response({"status": "success", "data": data}, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_employee_detail(request, pk):
    from .payroll import employment_status_name, applies_attendance_payroll_deductions

    try:
        employee = Employee.objects.select_related("status").prefetch_related("deduction_history").get(pk=pk)
    except Employee.DoesNotExist:
        return Response(
            {"error": "Employee not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    month = date.today().replace(day=1)
    # Ensure current-month slip exists / is refreshed from attendance
    try:
        latest_deduction = calculate_and_save_deduction(
            employee=employee,
            tax_percent=employee.tax,
            insurance_amount=employee.insurance_amount,
            deduction_month=month,
        )
    except Exception as calc_err:
        import traceback
        traceback.print_exc()
        print(f"Monthly payroll calc failed for employee {pk}: {calc_err}")
        latest_deduction = employee.deduction_history.filter(deduction_month=month).first()
        if not latest_deduction:
            latest_deduction = employee.deduction_history.first()

    status_name = employment_status_name(employee)
    data = {
        "id": employee.id,
        "employee_number": employee.employee_number,
        "name": employee.name,
        "email": employee.email,
        "phone_number": employee.phone_number,
        "department": employee.department,
        "designation": employee.designation,
        "status": status_name,
        "status_id": employee.status_id,
        "employment_status": {
            "id": employee.status_id,
            "name": status_name,
            "apply_payroll_deductions": applies_attendance_payroll_deductions(employee),
        } if employee.status_id else None,
        "is_active": employee.is_active,
        "joined_date": employee.joined_date,
        "gender": employee.gender,

        "base_salary": employee.salary,
        "current_salary": employee.current_salary,
        "tax_percent": employee.tax,
        "tax_amount": latest_deduction.tax_amount if latest_deduction else None,
        "salary_after_tax": latest_deduction.salary_after_tax if latest_deduction else None,
        "insurance_amount": latest_deduction.insurance_amount if latest_deduction else None,
        "bonus_amount": latest_deduction.bonus_amount if latest_deduction else 0,
        "net_salary": latest_deduction.net_salary if latest_deduction else None,
        "deduction_month": latest_deduction.deduction_month if latest_deduction else month,
        "deduction_id": latest_deduction.id if latest_deduction else None,

        "total_days": latest_deduction.total_days if latest_deduction else None,
        "present_days": latest_deduction.present_days if latest_deduction else None,
        "paid_leave_days": latest_deduction.paid_leave_days if latest_deduction else None,
        "unpaid_leave_days": latest_deduction.unpaid_leave_days if latest_deduction else None,
        "unpaid_absent_days": latest_deduction.unpaid_absent_days if latest_deduction else None,
        "late_count": latest_deduction.late_count if latest_deduction else None,
        "late_penalty_amount": latest_deduction.late_penalty_amount if latest_deduction else None,
        "attendance_deduction_total": latest_deduction.attendance_deduction_total if latest_deduction else None,
        "overtime_hours": latest_deduction.overtime_hours if latest_deduction else None,
        "overtime_amount": latest_deduction.overtime_amount if latest_deduction else None,
        "payroll_deductions_applied": applies_attendance_payroll_deductions(employee),

        "bank_name": employee.bank_name,
        "branch_name": employee.branch_name,
        "account_number": employee.account_number,
    }

    return Response(data, status=status.HTTP_200_OK)


@api_view(["PATCH", "POST"])
@permission_classes([IsAuthenticated])
def update_employee_monthly_bonus(request, pk):
    """Admin sets bonus for the current (or given) month and recalculates the slip."""
    try:
        employee = Employee.objects.select_related("status").get(pk=pk)
    except Employee.DoesNotExist:
        return Response({"error": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

    month_raw = request.data.get("deduction_month")
    if month_raw:
        try:
            deduction_month = date.fromisoformat(str(month_raw)[:10]).replace(day=1)
        except ValueError:
            return Response({"error": "Invalid deduction_month. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
    else:
        deduction_month = date.today().replace(day=1)

    if "bonus_amount" not in request.data:
        return Response({"error": "bonus_amount is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        bonus = Decimal(str(request.data.get("bonus_amount") or 0))
    except Exception:
        return Response({"error": "Invalid bonus_amount."}, status=status.HTTP_400_BAD_REQUEST)

    if bonus < 0:
        return Response({"error": "bonus_amount cannot be negative."}, status=status.HTTP_400_BAD_REQUEST)

    record = calculate_and_save_deduction(
        employee=employee,
        tax_percent=employee.tax,
        insurance_amount=employee.insurance_amount,
        deduction_month=deduction_month,
        bonus_amount=bonus,
    )
    return Response(
        {
            "success": True,
            "message": "Monthly bonus saved and salary recalculated.",
            "bonus_amount": str(record.bonus_amount),
            "net_salary": str(record.net_salary),
            "deduction_month": str(record.deduction_month),
            "deduction_id": record.id,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def employment_status_list(request):
    from .models import EmploymentStatus
    from .serializers import EmploymentStatusSerializer

    qs = EmploymentStatus.objects.filter(is_active=True).order_by("sort_order", "id")
    return Response(EmploymentStatusSerializer(qs, many=True).data, status=status.HTTP_200_OK)

def calculate_and_save_deduction(
    employee,
    tax_percent=None,
    insurance_amount=None,
    deduction_month=None,
    bonus_amount=None,
    include_attendance=True,
):
    """
    Calculate / upsert the monthly salary slip for an employee.
    Attendance leave/absent/late deductions follow PayrollSettings only when
    the employee's EmploymentStatus.apply_payroll_deductions is True.
    """
    from .payroll import compute_monthly_attendance_payroll
    from .models import PayrollSettings

    deduction_month = deduction_month or date.today().replace(day=1)
    if employee.joined_date and not employee.next_insurance_cycle_date:
        employee.next_insurance_cycle_date = (
            employee.joined_date + relativedelta(months=12)
        ).replace(day=1)
        employee.save(update_fields=["next_insurance_cycle_date"])

    gross_salary = Decimal(str(employee.current_salary or employee.salary or 0))

    if tax_percent is None:
        tax_percent = employee.tax
    if insurance_amount is None:
        insurance_amount = employee.insurance_amount

    tax_amount = Decimal("0")
    if tax_percent:
        tax_amount = gross_salary * (Decimal(str(tax_percent)) / Decimal("100"))
    salary_after_tax = gross_salary - tax_amount

    monthly_insurance = Decimal("0")
    if employee.joined_date and insurance_amount:
        monthly_insurance = (Decimal(str(insurance_amount)) / Decimal("2")) / Decimal("12")

    settings_obj = PayrollSettings.get_settings()
    attendance_fields = {
        "total_days": calendar.monthrange(deduction_month.year, deduction_month.month)[1],
        "present_days": 0,
        "paid_leave_days": 0,
        "unpaid_leave_days": 0,
        "unpaid_absent_days": 0,
        "late_count": 0,
        "late_penalty_days": Decimal("0"),
        "late_penalty_amount": Decimal("0"),
        "overtime_hours": Decimal("0"),
        "overtime_rate_applied": Decimal("0"),
        "overtime_amount": Decimal("0"),
        "per_day_salary": Decimal("0"),
        "half_day_salary": Decimal("0"),
        "base_salary": gross_salary,
        "attendance_deduction_total": Decimal("0"),
        "attendance_synced": False,
    }
    if include_attendance:
        computed = compute_monthly_attendance_payroll(employee, deduction_month, settings_obj)
        computed.pop("payroll_deductions_applied", None)
        attendance_fields.update(computed)

    existing = SalaryDeductionHistory.objects.filter(
        employee=employee,
        deduction_month=deduction_month,
    ).first()

    if bonus_amount is None:
        bonus_value = Decimal(str(existing.bonus_amount)) if existing else Decimal("0")
    else:
        bonus_value = Decimal(str(bonus_amount or 0))

    net_salary = (
        salary_after_tax
        - monthly_insurance
        - Decimal(str(attendance_fields["attendance_deduction_total"]))
        + Decimal(str(attendance_fields["overtime_amount"]))
        + bonus_value
    )

    defaults = {
        "gross_salary": gross_salary,
        "tax_amount": tax_amount,
        "salary_after_tax": salary_after_tax,
        "insurance_amount": monthly_insurance,
        "bonus_amount": bonus_value,
        "net_salary": net_salary,
        **attendance_fields,
    }

    record, _ = SalaryDeductionHistory.objects.update_or_create(
        employee=employee,
        deduction_month=deduction_month,
        defaults=defaults,
    )
    return record


def sync_payroll_for_month(employee, any_date_in_month, bonus_amount=None):
    """
    Thin wrapper around calculate_and_save_deduction — use this from any place
    that mutates Attendance (status edit, bulk upload, leave approval, holiday
    marking) so the SalaryDeductionHistory row for that month stays in sync
    with the actual attendance data. Never lets a payroll-calc error break the
    caller's main request (attendance save should still succeed).
    """
    if not any_date_in_month:
        return None
    month = any_date_in_month.replace(day=1)
    try:
        return calculate_and_save_deduction(
            employee=employee,
            tax_percent=employee.tax,
            insurance_amount=employee.insurance_amount,
            deduction_month=month,
            bonus_amount=bonus_amount,
        )
    except Exception as e:
        print(f"Payroll sync failed for employee {employee.id}, month {month}: {e}")
        return None

def renew_insurance_cycle(employee):
    if not employee.joined_date:
        return None

    if employee.next_insurance_cycle_date is None:
        employee.next_insurance_cycle_date = (
                employee.joined_date + relativedelta(months=12)
        ).replace(day=1)
        employee.save(update_fields=["next_insurance_cycle_date"])
        return calculate_and_save_deduction(
            employee, deduction_month=date.today().replace(day=1)
        )

    today = date.today().replace(day=1)

    if today < employee.next_insurance_cycle_date:
        return None

    record = calculate_and_save_deduction(
        employee, deduction_month=employee.next_insurance_cycle_date
    )

    employee.next_insurance_cycle_date = (
        employee.next_insurance_cycle_date + relativedelta(months=12)
    )
    employee.save(update_fields=["next_insurance_cycle_date"])

    return record

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_insurance_renewals_view(request):
    employees = Employee.objects.all()

    renewed = []
    for employee in employees:
        record = renew_insurance_cycle(employee)
        if record:
            renewed.append({
                "employee_id": employee.id,
                "employee_name": employee.name,
                "deduction_month": record.deduction_month,
                "insurance_amount": str(record.insurance_amount),
                "net_salary": str(record.net_salary),
            })

    return Response(
        {"status": "success", "data": renewed},
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def attendance_bulk_upload(request):
    all_rows = request.data.get('rows', [])
    if not all_rows:
        return Response(
            {'error': 'No rows found in the uploaded file.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    saved_records = []
    failed_records = []
    affected = set()
    for index, single_row in enumerate(all_rows):
        row_checker = AttendanceBulkRowSerializer(data=single_row)
        if row_checker.is_valid():
            try:
                with transaction.atomic():
                    saved_attendance = row_checker.save()
                    affected.add((saved_attendance.employee_id, saved_attendance.date.replace(day=1)))
                saved_records.append({
                    'row_number': index + 1,
                    'employee_name': saved_attendance.employee.name,
                    'date': str(saved_attendance.date),
                    'status': saved_attendance.status,
                })
            except Exception as e:
                failed_records.append({
                    'row_number': index + 1,
                    'emp_no': single_row.get('emp_no'),
                    'reason': str(e),
                })
        else:
            failed_records.append({
                'row_number': index + 1,
                'emp_no': single_row.get('emp_no'),
                'reason': row_checker.errors,
            })

    for emp_id, month in affected:
        try:
            emp = Employee.objects.get(pk=emp_id)
            sync_payroll_for_month(emp, month)
        except Employee.DoesNotExist:
            pass

    return Response({
        'total_rows': len(all_rows),
        'successfully_saved': len(saved_records),
        'failed': len(failed_records),
        'saved_records': saved_records,
        'failed_records': failed_records,
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_attendance_list(request):
    # Include all active employees (self check-in users may not have attendance_id)
    employees = (
        Employee.objects.filter(is_active=True)
        .prefetch_related('attendance_records')
        .order_by('name')
    )

    search = request.query_params.get('search', '').strip()
    if search:
        q = (
            Q(name__icontains=search)
            | Q(employee_number__icontains=search)
            | Q(department__icontains=search)
        )
        if search.isdigit():
            q |= Q(attendance_id=int(search))
        employees = employees.filter(q)
    serializer = EmployeeAttendanceSerializer(employees, many=True)
    data = serializer.data
    status_filter = request.query_params.get('status')
    if status_filter and status_filter != 'all':
        data = [row for row in data if row['status'] == status_filter]

    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_attendance_history(request, id):
    employee = get_object_or_404(Employee, id=id)
    records = employee.attendance_records.all()

    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    status_filter = request.query_params.get('status')

    if date_from:
        records = records.filter(date__gte=date_from)
    if date_to:
        records = records.filter(date__lte=date_to)

    history_stats = {
        'present': records.filter(status='present').count(),
        'late': records.filter(status='late').count(),
        'absent': records.filter(status='absent').count(),
        'on_leave': records.filter(status='on_leave').count(),
        'holiday': records.filter(status='holiday').count(),
    }

    if status_filter and status_filter != 'all':
        records = records.filter(status=status_filter)

    serializer = AttendanceHistorySerializer(records.order_by('-date'), many=True)

    return Response({
        'employee': {
            'id': employee.id,
            'name': employee.name,
            'emp_no': employee.attendance_id or employee.employee_number,
            'dept': employee.department,
        },
        'history': serializer.data,
        'historyStats': history_stats,
    }, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def attendance_record_update(request, id):
    attendance = get_object_or_404(Attendance, id=id)

    serializer = AttendanceHistorySerializer(attendance, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        sync_payroll_for_month(attendance.employee, attendance.date)
        return Response({
            'message': 'Attendance record updated successfully.',
            'record': {
                'id': attendance.id,
                'employee_name': attendance.employee.name,
                'date': str(attendance.date),
                'status': attendance.status,
            }
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def payroll_settings_view(request):
    """Read/update singleton payroll settings used by attendance deductions."""
    settings_obj = PayrollSettings.get_settings()

    if request.method == 'GET':
        return Response(
            PayrollSettingsSerializer(settings_obj).data,
            status=status.HTTP_200_OK,
        )

    serializer = PayrollSettingsSerializer(
        settings_obj,
        data=request.data,
        partial=True,
        context={'request': request},
    )
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    updated = serializer.save()
    return Response(
        PayrollSettingsSerializer(updated).data,
        status=status.HTTP_200_OK,
    )


def _resolve_employee_for_user(user):
    if not user or not user.is_authenticated:
        return None
    employee = Employee.objects.filter(user=user).first()
    if employee:
        return employee
    email = getattr(user, "email", None)
    if email:
        return Employee.objects.filter(email__iexact=email).first()
    return None


def _serialize_today_attendance(record, settings_obj):
    can_check_in = record is None or record.clock_in is None
    can_check_out = record is not None and record.clock_in is not None and record.clock_out is None
    payload = {
        "date": str(date.today()),
        "can_check_in": can_check_in,
        "can_check_out": can_check_out,
        "office_configured": bool(settings_obj.office_configured),
        "office_radius_meters": settings_obj.office_radius_meters,
        "default_timetable": settings_obj.default_timetable,
        "record": AttendanceHistorySerializer(record).data if record else None,
    }
    return payload


def _apply_location_fields(record, action, latitude, longitude, address, settings_obj):
    from .geo import evaluate_office_presence, coerce_coordinate

    lat = coerce_coordinate(latitude)
    lng = coerce_coordinate(longitude)
    in_office, distance = evaluate_office_presence(
        lat,
        lng,
        settings_obj.office_latitude,
        settings_obj.office_longitude,
        settings_obj.office_radius_meters,
    )
    address_text = (address or "").strip()[:500]
    if action == "check_in":
        record.check_in_latitude = lat
        record.check_in_longitude = lng
        record.check_in_address = address_text
        record.check_in_in_office = in_office
        record.check_in_distance_meters = distance
    else:
        record.check_out_latitude = lat
        record.check_out_longitude = lng
        record.check_out_address = address_text
        record.check_out_in_office = in_office
        record.check_out_distance_meters = distance
    return in_office, distance


def _recalculate_attendance_metrics(record, settings_obj):
    timetable = record.timetable or settings_obj.default_timetable or "10 - 7"
    record.timetable = timetable
    grace = settings_obj.grace_minutes or 0
    if record.clock_in and record.clock_out:
        record.status = calculate_status(
            record.clock_in, record.clock_out, timetable, grace
        )
        late, ot = calculate_late_and_overtime(
            record.clock_in, record.clock_out, timetable, grace
        )
        record.late_minutes = late
        record.overtime_hours = ot or 0
    elif record.clock_in:
        # Provisional status from check-in alone
        provisional = calculate_status(record.clock_in, record.clock_in, timetable, grace)
        record.status = provisional if provisional != "absent" else "present"
        late, _ = calculate_late_and_overtime(
            record.clock_in, record.clock_in, timetable, grace
        )
        # late_and_overtime needs both; compute late vs shift start manually via status
        if record.status == "late":
            from .utils import parse_shift_range
            from datetime import datetime as dt, timedelta as td

            start_time, _ = parse_shift_range(timetable)
            if start_time:
                start_dt = dt.combine(date.today(), start_time)
                clock_dt = dt.combine(date.today(), record.clock_in)
                record.late_minutes = max(0, int((clock_dt - start_dt).total_seconds() // 60))
            else:
                record.late_minutes = None
        else:
            record.late_minutes = 0
        record.overtime_hours = 0


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_attendance_today(request):
    employee = _resolve_employee_for_user(request.user)
    if not employee:
        return Response(
            {"error": "No employee profile is linked to this account."},
            status=status.HTTP_404_NOT_FOUND,
        )
    settings_obj = PayrollSettings.get_settings()
    record = Attendance.objects.filter(employee=employee, date=date.today()).first()
    return Response(_serialize_today_attendance(record, settings_obj))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def my_attendance_check_in(request):
    employee = _resolve_employee_for_user(request.user)
    if not employee:
        return Response(
            {"error": "No employee profile is linked to this account."},
            status=status.HTTP_404_NOT_FOUND,
        )

    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")
    if latitude is None or longitude is None:
        return Response(
            {"error": "Current location (latitude & longitude) is required to check in."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    settings_obj = PayrollSettings.get_settings()
    today = date.today()
    record, _ = Attendance.objects.get_or_create(
        employee=employee,
        date=today,
        defaults={
            "timetable": settings_obj.default_timetable or "10 - 7",
            "status": "present",
        },
    )
    if record.clock_in:
        return Response(
            {
                "error": "You already checked in today.",
                "today": _serialize_today_attendance(record, settings_obj),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    now = datetime.datetime.now().time().replace(microsecond=0)
    record.clock_in = now
    in_office, distance = _apply_location_fields(
        record,
        "check_in",
        latitude,
        longitude,
        request.data.get("address"),
        settings_obj,
    )
    _recalculate_attendance_metrics(record, settings_obj)
    record.save()
    sync_payroll_for_month(employee, record.date)

    from .geo import location_presence_label

    return Response(
        {
            "success": True,
            "message": "Checked in successfully.",
            "in_office": in_office,
            "location_label": location_presence_label(in_office, bool(employee.work_from_home)),
            "work_from_home": bool(employee.work_from_home),
            "distance_meters": distance,
            "today": _serialize_today_attendance(record, settings_obj),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def my_attendance_check_out(request):
    employee = _resolve_employee_for_user(request.user)
    if not employee:
        return Response(
            {"error": "No employee profile is linked to this account."},
            status=status.HTTP_404_NOT_FOUND,
        )

    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")
    if latitude is None or longitude is None:
        return Response(
            {"error": "Current location (latitude & longitude) is required to check out."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    settings_obj = PayrollSettings.get_settings()
    record = Attendance.objects.filter(employee=employee, date=date.today()).first()
    if not record or not record.clock_in:
        return Response(
            {"error": "Check in first before checking out."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if record.clock_out:
        return Response(
            {
                "error": "You already checked out today.",
                "today": _serialize_today_attendance(record, settings_obj),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    now = datetime.datetime.now().time().replace(microsecond=0)
    record.clock_out = now
    in_office, distance = _apply_location_fields(
        record,
        "check_out",
        latitude,
        longitude,
        request.data.get("address"),
        settings_obj,
    )
    _recalculate_attendance_metrics(record, settings_obj)
    record.save()
    sync_payroll_for_month(employee, record.date)

    from .geo import location_presence_label

    return Response(
        {
            "success": True,
            "message": "Checked out successfully.",
            "in_office": in_office,
            "location_label": location_presence_label(in_office, bool(employee.work_from_home)),
            "work_from_home": bool(employee.work_from_home),
            "distance_meters": distance,
            "today": _serialize_today_attendance(record, settings_obj),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_attendance_overview(request):
    """Employee self-service overview: allowances + month analytics + recent history."""
    employee = _resolve_employee_for_user(request.user)
    if not employee:
        return Response(
            {"error": "No employee profile is linked to this account."},
            status=status.HTTP_404_NOT_FOUND,
        )

    settings_obj = PayrollSettings.get_settings()
    today = date.today()
    month_start = today.replace(day=1)
    if today.month == 12:
        month_end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
    else:
        month_end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)

    month_records = Attendance.objects.filter(
        employee=employee,
        date__gte=month_start,
        date__lte=month_end,
    )
    present = month_records.filter(status="present").count()
    late = month_records.filter(status="late").count()
    absent = month_records.filter(status="absent").count()
    on_leave = month_records.filter(status="on_leave").count()
    in_office_days = month_records.filter(check_in_in_office=True).count()
    remote_days = month_records.filter(check_in_in_office=False).count()

    recent = Attendance.objects.filter(employee=employee).order_by("-date")[:14]
    today_record = Attendance.objects.filter(employee=employee, date=today).first()

    return Response(
        {
            "employee": {
                "id": employee.id,
                "name": employee.name,
                "department": employee.department,
                "designation": employee.designation,
                "employee_number": employee.employee_number,
                "work_from_home": bool(employee.work_from_home),
            },
            "allowances": {
                "grace_minutes": settings_obj.grace_minutes,
                "allowed_leaves_per_month": settings_obj.allowed_leaves_per_month,
                "allowed_absents_per_month": settings_obj.allowed_absents_per_month,
                "late_count_threshold": settings_obj.late_count_threshold,
                "overtime_rate_per_hour": str(settings_obj.overtime_rate_per_hour),
                "default_timetable": settings_obj.default_timetable,
                "office_radius_meters": settings_obj.office_radius_meters,
                "office_configured": bool(settings_obj.office_configured),
                "office_address": settings_obj.office_address or "",
            },
            "month": {
                "label": month_start.strftime("%B %Y"),
                "present": present,
                "late": late,
                "absent": absent,
                "on_leave": on_leave,
                "in_office_days": in_office_days,
                "remote_or_outside_days": remote_days,
                "total_recorded": month_records.count(),
                "attendance_pct": (
                    round(((present + late) / month_records.count()) * 100)
                    if month_records.count()
                    else 0
                ),
            },
            "today": _serialize_today_attendance(today_record, settings_obj),
            "recent": AttendanceHistorySerializer(recent, many=True).data,
            "work_update": _serialize_work_update(
                employee.daily_work_updates.filter(date=today).first()
            ),
        }
    )


def _serialize_work_update(row):
    if not row:
        return {"note": "", "date": str(date.today()), "updated_at": None}
    return {
        "id": row.id,
        "note": row.note or "",
        "date": str(row.date),
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
    }


@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def my_daily_work_update(request):
    """Employee posts/updates what they are working on today."""
    from .models import DailyWorkUpdate

    employee = _resolve_employee_for_user(request.user)
    if not employee:
        return Response(
            {"error": "No employee profile is linked to this account."},
            status=status.HTTP_404_NOT_FOUND,
        )

    today = date.today()
    row = DailyWorkUpdate.objects.filter(employee=employee, date=today).first()

    if request.method == "GET":
        return Response(_serialize_work_update(row), status=status.HTTP_200_OK)

    note = (request.data.get("note") or "").strip()
    if not note:
        return Response(
            {"error": "Please describe what you are working on today."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if len(note) > 2000:
        return Response(
            {"error": "Work update is too long (max 2000 characters)."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if row:
        row.note = note
        row.save(update_fields=["note", "updated_at"])
    else:
        row = DailyWorkUpdate.objects.create(employee=employee, date=today, note=note)

    return Response(
        {
            "success": True,
            "message": "Today’s work update saved.",
            "work_update": _serialize_work_update(row),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET", "PATCH", "PUT"])
@permission_classes([IsAuthenticated])
def my_work_from_home(request):
    """Employee self-service: read/update own Work from home flag."""
    employee = _resolve_employee_for_user(request.user)
    if not employee:
        return Response(
            {"error": "No employee profile is linked to this account."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        return Response(
            {"work_from_home": bool(employee.work_from_home)},
            status=status.HTTP_200_OK,
        )

    if "work_from_home" not in request.data:
        return Response(
            {"error": "work_from_home is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    raw = request.data.get("work_from_home")
    if isinstance(raw, str):
        value = raw.strip().lower() in ("1", "true", "yes", "on")
    else:
        value = bool(raw)

    employee.work_from_home = value
    employee.save(update_fields=["work_from_home"])
    return Response(
        {
            "success": True,
            "work_from_home": bool(employee.work_from_home),
            "message": (
                "Work from home enabled."
                if employee.work_from_home
                else "Work from home disabled."
            ),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_attendance_history(request):
    """Employee self-service attendance history (own records only)."""
    employee = _resolve_employee_for_user(request.user)
    if not employee:
        return Response(
            {"error": "No employee profile is linked to this account."},
            status=status.HTTP_404_NOT_FOUND,
        )

    records = employee.attendance_records.all()
    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")
    status_filter = request.query_params.get("status")

    if date_from:
        records = records.filter(date__gte=date_from)
    if date_to:
        records = records.filter(date__lte=date_to)

    history_stats = {
        "present": records.filter(status="present").count(),
        "late": records.filter(status="late").count(),
        "absent": records.filter(status="absent").count(),
        "on_leave": records.filter(status="on_leave").count(),
        "holiday": records.filter(status="holiday").count(),
    }

    if status_filter and status_filter != "all":
        records = records.filter(status=status_filter)

    serializer = AttendanceHistorySerializer(records.order_by("-date"), many=True)
    return Response(
        {
            "employee": {
                "id": employee.id,
                "name": employee.name,
                "emp_no": employee.attendance_id or employee.employee_number,
                "dept": employee.department,
            },
            "history": serializer.data,
            "historyStats": history_stats,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_office_location(request):
    """Admin captures current GPS pin as the office location."""
    role_name = (request.user.role.name if getattr(request.user, "role", None) else "").lower()
    if not (
        role_name in ("admin", "administrator")
        or request.user.is_superuser
        or request.user.is_staff
    ):
        return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")
    if latitude is None or longitude is None:
        return Response(
            {"error": "latitude and longitude are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    from .geo import coerce_coordinate
    from django.utils import timezone as dj_tz

    lat = coerce_coordinate(latitude)
    lng = coerce_coordinate(longitude)
    if lat is None or lng is None:
        return Response({"error": "Invalid coordinates."}, status=status.HTTP_400_BAD_REQUEST)

    settings_obj = PayrollSettings.get_settings()
    settings_obj.office_latitude = lat
    settings_obj.office_longitude = lng
    if "office_radius_meters" in request.data and request.data.get("office_radius_meters") not in ("", None):
        try:
            settings_obj.office_radius_meters = max(20, int(request.data.get("office_radius_meters")))
        except (TypeError, ValueError):
            pass
    if "office_address" in request.data:
        settings_obj.office_address = (request.data.get("office_address") or "").strip()[:500]
    if "default_timetable" in request.data and request.data.get("default_timetable"):
        settings_obj.default_timetable = str(request.data.get("default_timetable"))[:50]
    settings_obj.office_set_at = dj_tz.now()
    settings_obj.updated_by = request.user
    settings_obj.save()

    return Response(
        {
            "success": True,
            "message": "Office location saved.",
            "data": PayrollSettingsSerializer(settings_obj).data,
        }
    )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_employee_status(request, employee_id):
    """Update employee status with feedback"""
    try:
        employee = Employee.objects.get(id=employee_id)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = EmployeeStatusUpdateSerializer(employee, data=request.data, partial=True)

    if serializer.is_valid():
        if serializer.validated_data.get('status') and \
                serializer.validated_data['status'].code == 'resign' and \
                not serializer.validated_data.get('feedback'):
            return Response(
                {'feedback': 'Feedback is required for resignation'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)