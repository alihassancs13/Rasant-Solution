
import datetime
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
from datetime import date
from django.conf import settings
from collections import defaultdict
from decimal import Decimal
from django.db import transaction
from .serializers import calculate_next_effective_date
import random
import string
from django.contrib.auth.hashers import make_password

User = get_user_model()

from .models import (
    Employee, CVSubmission, JobOpening, JobType, JobStatus,
    IncrementType, IncrementPolicy, CycleTiming, ApplicationMode, EmployeePolicyAssignment,
    SalaryIncrementHistory,SalaryDeductionHistory, Attendance,
)
from .serializers import (
    EmployeeSerializer, EmployeeListSerializer, UpdateEmployeeSerializer,
    CVSubmissionSerializer, JobOpeningSerializer, JobTypeSerializer, JobStatusSerializer,
    IncrementTypeSerializer, CycleTimingSerializer, ApplicationModeSerializer,
    IncrementPolicySerializer, EmployeePolicyAssignmentSerializer, EmployeeAttendanceSerializer, AttendanceBulkRowSerializer,
    AttendanceHistorySerializer
)
# ---------- GENRERATE EMPLOYEE NUMBER ----------
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
def add_employee(request):
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    serializer = EmployeeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    employee = Employee(**serializer.validated_data)
    employee.current_salary = employee.salary

    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    raw_password = ''.join(random.choice(characters) for _ in range(8))
    employee.password = make_password(raw_password)

    employee_role, _ = Role.objects.get_or_create(name='employee')
    # Generate unique username
    base_username = employee.name.replace(' ', '_').lower()
    username = base_username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}_{counter}"
        counter += 1

    try:
        user_account = User.objects.create(
            username=username,
            email=employee.email,
            is_staff=False,
            is_active=True,
        )
        user_account.set_password(raw_password)
        user_account.save()
    except IntegrityError as e:
        return Response(
            {"error": f"User creation failed: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    employee.user = user_account

    file_fields = [
        ('cnic_scan', False),
        ('emergency_cnic_scan', False),
        ('matric_certificate', False),
        ('fsc_certificate', False),
        ('university_degree', False),
        ('other_course', False)
    ]

    for field_name, is_mandatory in file_fields:
        uploaded_file = request.FILES.get(field_name)
        if uploaded_file:
            if uploaded_file.size > MAX_FILE_SIZE:
                return Response(
                    {"error": f"The file '{field_name}' exceeds the {MAX_FILE_SIZE // (1024 * 1024)} MB size limit."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            setattr(employee, f"{field_name}_data", uploaded_file.read())
            setattr(employee, f"{field_name}_name", uploaded_file.name)
            setattr(employee, f"{field_name}_mimetype", uploaded_file.content_type)
        elif is_mandatory:
            return Response(
                {"error": f"The file '{field_name}' is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

    for attempt in range(3):
        new_number = generate_employee_number()
        employee.employee_number = new_number
        try:
            employee.save()
            try:
                if employee.joined_date:
                    calculate_and_save_deduction(
                        employee=employee,
                        tax_percent=employee.tax,
                        insurance_amount=employee.insurance_amount,
                        deduction_month=date.today().replace(day=1),
                    )
            except Exception as e:
                # Log the error but don't fail the request
                print(f" Deduction calculation failed: {e}")
                # You can also log to a file here

            return Response(
                {
                    "success": True,
                    "message": "Employee added successfully.",
                    "employee_number": employee.employee_number,
                    "name": employee.name,
                    "password": raw_password
                },
                status=status.HTTP_201_CREATED
            )
        except IntegrityError:
            continue

    return Response(
        {"error": "Could not generate a unique employee number after multiple attempts."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )

@api_view(['GET'])
def list_employees(request):
    employees = Employee.objects.all().order_by('-created_at').prefetch_related('deduction_history')
    serializer = EmployeeListSerializer(employees, many=True)
    for employee in employees:
        renew_insurance_cycle(employee)
    return Response(serializer.data)


@api_view(['PATCH'])
def update_employee(request, pk):
    try:
        employee = Employee.objects.get(pk=pk)
    except Employee.DoesNotExist:
        return Response(
            {"error": "Employee not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    old_tax = employee.tax
    old_insurance_amount = employee.insurance_amount
    old_salary = employee.salary
    old_password = employee.password

    serializer = UpdateEmployeeSerializer(
        employee,
        data=request.data,
        partial=True,
        context={'request': request}
    )

    if serializer.is_valid():
        updated_employee = serializer.save()
        updated_employee.current_salary = updated_employee.salary
        updated_employee.save(update_fields=['current_salary'])

        # Handle password update
        if 'password' in request.data and request.data['password'] != old_password:
            new_password = request.data['password']
            from django.contrib.auth.hashers import make_password
            from accounts.models import User

            hashed_password = make_password(new_password)
            updated_employee.password = hashed_password
            updated_employee.save(update_fields=['password'])

            try:
                user = User.objects.get(username=updated_employee.name)
                user.set_password(new_password)
                user.save()
                print(f"User updated by username: {user.username}")
            except User.DoesNotExist:
                try:
                    user = User.objects.get(email=updated_employee.email)
                    user.username = updated_employee.name
                    user.set_password(new_password)
                    user.save()
                    print(f"User updated and username changed to: {user.username}")
                except User.DoesNotExist:
                    user = User.objects.create_user(
                        username=updated_employee.name,
                        email=updated_employee.email or f"{updated_employee.employee_number}@example.com",
                        password=new_password,
                        first_name=updated_employee.name.split()[0] if updated_employee.name else '',
                        last_name=' '.join(updated_employee.name.split()[1:]) if updated_employee.name else ''
                    )
                    print(f"New user created: {user.username}")
        try:
            salary_changed = updated_employee.salary != old_salary
            tax_changed = updated_employee.tax != old_tax
            insurance_changed = updated_employee.insurance_amount != old_insurance_amount
            if (salary_changed or tax_changed or insurance_changed):
                tax_percent = updated_employee.tax or 0
                insurance_amount = updated_employee.insurance_amount or 0

                print(
                    f" Recalculating deductions: Salary={updated_employee.salary}, Tax={tax_percent}%, Insurance={insurance_amount}")

                calculate_and_save_deduction(
                    employee=updated_employee,
                    tax_percent=tax_percent,
                    insurance_amount=insurance_amount,
                    deduction_month=date.today().replace(day=1),
                )
        except Exception as e:
            # Log the error but don't fail the response
            import traceback
            print(f" Deduction calculation failed: {e}")
            print(traceback.format_exc())

        # Return success response with proper data
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
                "status": updated_employee.status
            },
            status=status.HTTP_200_OK
        )

    # Return validation errors
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        to_email = request.data.get('email')
        subject = request.data.get('subject')
        message = request.data.get('message')

        if not all([to_email, subject, message]):
            return Response({
                'status': 'error',
                'message': 'Email, subject, and message are required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False,
            )
            return Response({
                'status': 'success',
                'message': 'Email sent successfully.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'Failed to send email.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'GET':
        cv = CVSubmission.objects.all()
        serializer = CVSubmissionSerializer(cv, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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

    serializer = JobOpeningSerializer(job_opening, data=request.data, partial=True)
    if serializer.is_valid():
        updated_job = serializer.save()
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

    BASE_URL = "http://localhost:8000/"

    onboarding_link = (
        f"{BASE_URL}/html/dashboard-admin.html"
        f"?onb=emp_{employee.employee_number}#employees"
    )
    subject = "Complete your employee onboarding — Rasant Solutions"

    html_message = f"""
    <html>
    <body>
        <p>Dear {employee.name},</p>
        <p>Welcome to Rasant Solutions! Please complete your employee onboarding form to proceed.</p>
        <p>Your reference: {employee.employee_number}</p>
        <p>Open the link below in the admin dashboard onboarding section (your name and email are pre-filled):<br>
        <a href="{onboarding_link}">{onboarding_link}</a></p>
        <p>Please have the following documents ready:</p>
        <ul>
            <li>CNIC scan copies</li>
            <li>Educational certificates (Metric, Intermediate, etc.)</li>
            <li>Bank account details</li>
        </ul>
        <p>If you have questions, reply to this email or contact HR.</p>
        <br>
        <p>Best regards,<br>Rasant Solutions HR Team</p>
    </body>
    </html>
    """
    try:
        send_mail(
            subject=subject,
            message="",  # plain text version (leave empty if using HTML)
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[employee.email],
            html_message=html_message,
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

    return Response({"status": "success", "data": data}, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_employee_detail(request, pk):
    try:
        employee = Employee.objects.prefetch_related('deduction_history').get(pk=pk)
    except Employee.DoesNotExist:
        return Response(
            {"error": "Employee not found."},
            status=status.HTTP_404_NOT_FOUND
        )


    latest_deduction = employee.deduction_history.first()

    data = {
        "employee_number": employee.employee_number,
        "name": employee.name,
        "email": employee.email,
        "phone_number": employee.phone_number,
        "department": employee.department,
        "designation": employee.designation,
        "status": employee.status,
        "is_active": employee.is_active,
        "joined_date": employee.joined_date,
        "gender": employee.gender,

        "base_salary": employee.salary,
        "current_salary": employee.current_salary,
        "tax_percent": employee.tax,
        "tax_amount": latest_deduction.tax_amount if latest_deduction else None,
        "salary_after_tax": latest_deduction.salary_after_tax if latest_deduction else None,
        "insurance_amount": latest_deduction.insurance_amount if latest_deduction else None,
        "net_salary": latest_deduction.net_salary if latest_deduction else None,
        "deduction_month": latest_deduction.deduction_month if latest_deduction else None,

        # ---------- Bank Details ----------
        "bank_name": employee.bank_name,
        "branch_name": employee.branch_name,
        "account_number": employee.account_number,
    }

    return Response(data, status=status.HTTP_200_OK)

def calculate_and_save_deduction(employee, tax_percent=None, insurance_amount=None, deduction_month=None):
    deduction_month = deduction_month or date.today().replace(day=1)
    if employee.joined_date and not employee.next_insurance_cycle_date:
        employee.next_insurance_cycle_date = (
            employee.joined_date + relativedelta(months=12)
        ).replace(day=1)
        employee.save(update_fields=["next_insurance_cycle_date"])

    gross_salary = employee.current_salary or employee.salary

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

    net_salary = salary_after_tax - monthly_insurance

    record = SalaryDeductionHistory.objects.create(
        employee=employee,
        deduction_month=deduction_month,
        gross_salary=gross_salary,
        tax_amount=tax_amount,
        salary_after_tax=salary_after_tax,
        insurance_amount=monthly_insurance,
        net_salary=net_salary,
    )
    return record

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
    for index, single_row in enumerate(all_rows):
        row_checker = AttendanceBulkRowSerializer(data=single_row)
        if row_checker.is_valid():
            try:
                with transaction.atomic():
                    saved_attendance = row_checker.save()
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
    employees = Employee.objects.filter(attendance_id__isnull=False).prefetch_related('attendance_records')

    search = request.query_params.get('search', '').strip()
    if search:
        employees = employees.filter(
            Q(name__icontains=search) | Q(attendance_id__icontains=search)
        )
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
    }

    if status_filter and status_filter != 'all':
        records = records.filter(status=status_filter)

    serializer = AttendanceHistorySerializer(records.order_by('-date'), many=True)

    return Response({
        'employee': {
            'id': employee.id,
            'name': employee.name,
            'emp_no': employee.attendance_id,
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