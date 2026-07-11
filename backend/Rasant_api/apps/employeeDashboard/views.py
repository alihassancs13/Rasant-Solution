import datetime
from rest_framework.decorators import permission_classes
from django.http import HttpResponse
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

from .models import (
    Employee, CVSubmission, JobOpening, JobType, JobStatus,
    IncrementType, IncrementPolicy, CycleTiming, ApplicationMode,
)
from .serializers import (
    EmployeeSerializer, EmployeeListSerializer, UpdateEmployeeSerializer,
    CVSubmissionSerializer, JobOpeningSerializer, JobTypeSerializer, JobStatusSerializer,
    IncrementTypeSerializer, CycleTimingSerializer, ApplicationModeSerializer,
    IncrementPolicySerializer,
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


# ---------- Views ----------
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def add_employee(request):
    """
    Add a new employee. Reads files from request.FILES,
    converts them to bytes, and saves them directly to MySQL.
    """
    # -------------------- FILE SIZE LIMIT --------------------
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    serializer = EmployeeSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    employee = Employee(**serializer.validated_data)

    file_fields = [
        ('cnic_scan', False),
        ('emergency_cnic_scan', False),
        ('matric_certificate', False),
        ('fsc_certificate', False),
        ('university_degree', False),
        ('other_course', False)  # Optional field
    ]
    for field_name, is_mandatory in file_fields:
        uploaded_file = request.FILES.get(field_name)
        if uploaded_file:
            # ---------- NEW SIZE CHECK ----------
            if uploaded_file.size > MAX_FILE_SIZE:
                return Response(
                    {"error": f"The file '{field_name}' exceeds the {MAX_FILE_SIZE // (1024*1024)} MB size limit."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Proceed as before
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
            return Response(
                {
                    "message": "Employee added successfully.",
                    "employee_number": employee.employee_number,
                    "name": employee.name
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
    employees = Employee.objects.all().order_by('-created_at')
    serializer = EmployeeListSerializer(employees, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_employee_detail(request, pk):
    """
    Fetch a single employee by primary key (id).
    Returns all fields including file URLs.
    """
    try:
        employee = Employee.objects.get(pk=pk)
    except Employee.DoesNotExist:
        return Response(
            {"error": "Employee not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    serializer = EmployeeSerializer(employee, context={'request': request})
    return Response(serializer.data)


@api_view(['PATCH'])
def update_employee(request, pk):
    """
    Update only text fields of an employee by ID.
    File fields are ignored and cannot be updated here.
    """
    try:
        employee = Employee.objects.get(pk=pk)
    except Employee.DoesNotExist:
        return Response(
            {"error": "Employee not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = UpdateEmployeeSerializer(
        employee,
        data=request.data,
        partial=True,
        context={'request': request}
    )

    if serializer.is_valid():
        updated_employee = serializer.save()
        return Response(
            {
                "message": "Employee updated successfully.",
                "employee_number": updated_employee.employee_number,
                "name": updated_employee.name
            },
            status=status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "POST", "DELETE", "PUT"])
@parser_classes([MultiPartParser, FormParser, JSONParser])
@permission_classes([AllowAny])
def cv_submission_view(request, pk=None):
    # -------------------------------------------------------------
    # GET: List CV Submissions (optionally filtered by job)
    # -------------------------------------------------------------
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

    # -------------------------------------------------------------
    # POST: Submit a new CV
    # -------------------------------------------------------------
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

    # -------------------------------------------------------------
    # DELETE: Remove a specific CV submission
    # -------------------------------------------------------------
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

    # -------------------------------------------------------------
    # PUT: Update status / re-link job (partial update)
    # -------------------------------------------------------------
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


# ==========================================
# 2. Send Candidate Email View
# ==========================================

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


# ==========================================
# 3. CV Download View
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def cv_download_view(request, pk):
    cv = get_object_or_404(CVSubmission, pk=pk)

    response = HttpResponse(bytes(cv.cv_file), content_type=cv.cv_file_type)
    response['Content-Disposition'] = f'attachment; filename="{cv.cv_file_name}"'
    return response


# ==========================================
# 4. Job Create View
# ==========================================

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


# ==========================================
# 5. Job List View
# ==========================================

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


# ==========================================
# 6. Job Update View
# ==========================================

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


# ==========================================
# Email API
# ==========================================

@api_view(['POST'])
def send_invitation_email(request):
    """
    Send onboarding invitation email to an employee.
    Expects: { "employee_id": <int> }
    """
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

    # ---------- Generate the onboarding link ----------
    BASE_URL = "http://localhost:8000/"

    onboarding_link = (
        f"{BASE_URL}/html/dashboard-admin.html"
        f"?onb=emp_{employee.employee_number}#employees"
    )
    # ---------- Email content ----------
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
    # ---------- Send email ----------
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


# ==========================================
# 7. Increment Lookups View
# ==========================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def increment_lookups_view(request):
    """One call returns all 3 dropdown lists — powers Increment Type /
    Cycle Timing / Application Mode selects in the Add/Edit Policy modal."""
    return Response({
        "status": "success",
        "data": {
            "increment_types":  IncrementTypeSerializer(IncrementType.objects.all(), many=True).data,
            "cycle_timings":    CycleTimingSerializer(CycleTiming.objects.all(), many=True).data,
            "application_modes": ApplicationModeSerializer(ApplicationMode.objects.all(), many=True).data,
        }
    }, status=status.HTTP_200_OK)


# ==========================================
# 8. Increment Policy View (CRUD)
# ==========================================

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