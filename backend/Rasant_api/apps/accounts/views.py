# Create your views here.

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Module, ContactMessage, EmailSettings
from .serializer import (
    LoginSerializer,
    UserSerializer,
    ContactMessageSerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
    EmailSettingsSerializer,
)
from django.http import HttpResponse
from employeeDashboard.models import Employee
from .email_service import send_test_email


def _is_admin(user):
    role_name = (user.role.name if user.role else '').lower()
    return role_name in ('admin', 'administrator') or user.is_superuser or user.is_staff


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    # Validate input using serializer
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({
            "status": False,
            "message": "Validation Failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data.get('email')
    username = serializer.validated_data.get('username')
    password = serializer.validated_data['password']
    is_email_login = email is not None
    is_username_login = username is not None

    try:
        if is_email_login:
            if not User.objects.filter(email=email).exists():
                return Response({
                    "status": False,
                    "message": f"Email '{email}' not found in our system",
                    "error_type": "email_not_found"
                }, status=status.HTTP_404_NOT_FOUND)
            user = User.objects.get(email=email)

        elif is_username_login:
            if not User.objects.filter(username=username).exists():
                return Response({
                    "status": False,
                    "message": f"Username '{username}' not found in our system",
                    "error_type": "username_not_found"
                }, status=status.HTTP_404_NOT_FOUND)
            user = User.objects.get(username=username)
        else:
            return Response({
                "status": False,
                "message": "Email or username is required"
            }, status=status.HTTP_400_BAD_REQUEST)

    except User.DoesNotExist:
        return Response({
            "status": False,
            "message": "User not found with provided credentials"
        }, status=status.HTTP_404_NOT_FOUND)

    # Check password
    if not user.check_password(password):
        return Response({
            "status": False,
            "message": "Incorrect password. Please try again.",
            "error_type": "incorrect_password"
        }, status=status.HTTP_401_UNAUTHORIZED)

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)

    user_data = UserSerializer(user).data

    try:
        # Try to get employee from the Employee model
        employee = Employee.objects.get(user=user)
        user_data['employee_id'] = employee.id

        # Only add employee fields if they exist
        employee_data = {'id': employee.id}

        # Safely add fields if they exist
        if hasattr(employee, 'name'):
            employee_data['name'] = employee.name
        if hasattr(employee, 'email'):
            employee_data['email'] = employee.email
        if hasattr(employee, 'employee_number'):
            employee_data['employee_number'] = employee.employee_number
        if hasattr(employee, 'department'):
            employee_data['department'] = employee.department
        if hasattr(employee, 'designation'):
            employee_data['designation'] = employee.designation

        user_data['employee'] = employee_data

    except Employee.DoesNotExist:
        # User is not an employee (admin or other role)
        user_data['employee_id'] = None
        user_data['employee'] = None
    except Exception as e:
        # If any other error occurs, do not pretend user.id is an employee id
        print(f"Error getting employee: {e}")
        user_data['employee_id'] = None
        user_data['employee'] = None

    # Get modules for the user's role (same shape as get_user_modules)
    from .employee_access import build_sidebar_modules_for_role, ensure_user_is_employee

    try:
        if user_data.get('employee_id') and user.role and user.role.name.lower() == 'employee':
            ensure_user_is_employee(user)
    except Exception as sync_err:
        print(f"Employee access sync on login failed: {sync_err}")

    sidebar = build_sidebar_modules_for_role(user.role) if user.role else {
        "modules": [],
        "account_modules": [],
        "project_modules": [],
    }

    return Response({
        "status": True,
        "message": "Login successful",
        "data": {
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": user_data,
            "modules": sidebar.get("modules", []),
            "account_modules": sidebar.get("account_modules", []),
            "project_modules": sidebar.get("project_modules", []),
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_modules(request):
    """
    Get all modules for the logged-in user based on their role.
    Nesting (e.g. Employees children) is prepared on the backend.
    """
    from .employee_access import (
        build_sidebar_modules_for_role,
        ensure_employee_modules,
        ensure_user_is_employee,
    )

    user = request.user
    if not user.role:
        return Response({
            "status": True,
            "message": "No role assigned",
            "data": {"modules": [], "account_modules": [], "project_modules": []},
        })

    try:
        role_name = (user.role.name or "").lower()
        if role_name == "employee":
            ensure_user_is_employee(user)
        else:
            ensure_employee_modules()
    except Exception as sync_err:
        print(f"Module sync on get_user_modules failed: {sync_err}")

    payload = build_sidebar_modules_for_role(user.role)

    return Response({
        "status": True,
        "message": "Modules fetched successfully",
        "data": payload,
    })


@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def contact_message_view(request):
    if request.method == 'POST':
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            saved = serializer.save()
            try:
                from .notifications import notify_admins
                name = saved.full_name or saved.email or 'Someone'
                notify_admins(
                    type='inquiry',
                    title='New inquiry received',
                    body=f'{name}: {(saved.message or "")[:140]}',
                    link='/admin/inquiries',
                    payload={'inquiry_id': saved.id},
                )
            except Exception as notify_err:
                print(f'Inquiry notification failed: {notify_err}')
            return Response({'message': 'Message sent successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        messages = ContactMessage.objects.all()
        serializer = ContactMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def my_profile(request):
    user = request.user

    if request.method == 'GET':
        data = UserSerializer(user).data
        try:
            employee = Employee.objects.get(user=user)
            data['employee'] = {
                'id': employee.id,
                'name': employee.name,
                'email': employee.email,
                'phone_number': employee.phone_number,
                'employee_number': employee.employee_number,
                'department': employee.department,
                'designation': employee.designation,
            }
        except Employee.DoesNotExist:
            data['employee'] = None
        return Response({'status': True, 'data': data})

    serializer = ProfileUpdateSerializer(data=request.data, partial=True, context={'request': request})
    if not serializer.is_valid():
        return Response(
            {'status': False, 'message': 'Validation failed', 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    data = serializer.validated_data
    for field in ('username', 'email', 'first_name', 'last_name'):
        if field in data:
            setattr(user, field, data[field])
    user.save()

    # Keep linked employee profile in sync for name/email
    try:
        employee = Employee.objects.get(user=user)
        if 'email' in data and data['email']:
            employee.email = data['email']
        if 'first_name' in data or 'last_name' in data:
            first = data.get('first_name', user.first_name) or ''
            last = data.get('last_name', user.last_name) or ''
            full = f"{first} {last}".strip()
            if full:
                employee.name = full
        employee.save()
    except Employee.DoesNotExist:
        pass

    return Response({
        'status': True,
        'message': 'Profile updated successfully.',
        'data': UserSerializer(user).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_my_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(
            {'status': False, 'message': 'Validation failed', 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = request.user
    current_password = serializer.validated_data['current_password']
    new_password = serializer.validated_data['new_password']

    if not user.check_password(current_password):
        return Response(
            {'status': False, 'message': 'Current password is incorrect.', 'error_type': 'incorrect_password'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save()

    # Sync employee.password hash when linked
    try:
        from django.contrib.auth.hashers import make_password
        employee = Employee.objects.get(user=user)
        employee.password = make_password(new_password)
        employee.save(update_fields=['password'])
    except Employee.DoesNotExist:
        pass

    return Response({'status': True, 'message': 'Password updated successfully.'})


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def email_settings_view(request):
    if not _is_admin(request.user):
        return Response(
            {'status': False, 'message': 'Only administrators can manage email settings.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    settings_obj = EmailSettings.get_solo()

    if request.method == 'GET':
        return Response({
            'status': True,
            'data': EmailSettingsSerializer(settings_obj).data,
        })

    serializer = EmailSettingsSerializer(settings_obj, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(
            {'status': False, 'message': 'Validation failed', 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    updated = serializer.save(updated_by=request.user)
    return Response({
        'status': True,
        'message': 'Email settings saved successfully.',
        'data': EmailSettingsSerializer(updated).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_email_settings(request):
    if not _is_admin(request.user):
        return Response(
            {'status': False, 'message': 'Only administrators can test email settings.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    to_email = request.data.get('to_email') or request.user.email
    if not to_email:
        return Response(
            {'status': False, 'message': 'to_email is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        send_test_email(to_email)
        return Response({'status': True, 'message': f'Test email sent to {to_email}.'})
    except Exception as exc:
        return Response(
            {'status': False, 'message': f'Failed to send test email: {exc}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def update_my_avatar(request):
    avatar_file = request.FILES.get('avatar')
    if not avatar_file:
        return Response({'error': 'No image file provided'}, status=400)
    if not avatar_file.content_type.startswith('image/'):
        return Response({'error': 'File must be an image'}, status=400)
    if avatar_file.size > 5 * 1024 * 1024:
        return Response({'error': 'Image too large (max 5MB)'}, status=400)

    user = request.user
    user.avatar = avatar_file.read()
    user.avatar_content_type = avatar_file.content_type
    user.save(update_fields=['avatar', 'avatar_content_type'])
    return Response({'status': True, 'has_avatar': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_avatar(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    if not user.avatar:
        return Response({'error': 'No avatar set'}, status=404)
    return HttpResponse(bytes(user.avatar), content_type=user.avatar_content_type or 'image/png')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_overview_stats(request):
    """Aggregate stats for the admin Overview dashboard."""
    role_name = (request.user.role.name if request.user.role else '') or ''
    if role_name.lower() not in ('admin', 'administrator') and not (request.user.is_superuser or request.user.is_staff):
        return Response({'status': False, 'message': 'Admin access required.'}, status=403)

    from datetime import date, timedelta
    from employeeDashboard.models import Employee, JobOpening, CVSubmission, Attendance, DailyWorkUpdate
    from jira.models import JiraCredential
    from jira.services import fetch_worklogs_for_range

    today = date.today()
    month_start = today.replace(day=1)

    total_employees = Employee.objects.count()
    active_employees = Employee.objects.filter(is_active=True).count()
    inactive_employees = total_employees - active_employees

    open_jobs = JobOpening.objects.filter(status__name__iexact='Published').count()
    draft_jobs = JobOpening.objects.filter(status__name__iexact='Draft').count()
    new_cvs = CVSubmission.objects.filter(application_status_id=1).count()
    total_inquiries = ContactMessage.objects.count()
    recent_inquiries = ContactMessage.objects.filter(
        created_at__date__gte=today - timedelta(days=7)
    ).count()

    attendance_today = Attendance.objects.filter(date=today)
    present_today = attendance_today.filter(status='present').count()
    late_today = attendance_today.filter(status='late').count()
    absent_today = attendance_today.filter(status='absent').count()

    # Live Jira totals for current month (same source as Worklog Analytics)
    worklog_seconds = 0
    worklog_entries = 0
    for cred in JiraCredential.objects.select_related('auth_user_id').exclude(
        domain__isnull=True
    ).exclude(domain='').exclude(api_token__isnull=True).exclude(api_token=''):
        user = cred.auth_user_id
        if not user or not cred.email:
            continue
        try:
            entries = fetch_worklogs_for_range(user, month_start, today)
            worklog_entries += len(entries)
            worklog_seconds += sum(int(e.get('time_spent_seconds') or 0) for e in entries)
        except Exception:
            continue
    worklog_hours = round(worklog_seconds / 3600, 1)

    today_work_updates = []
    for row in (
        DailyWorkUpdate.objects.filter(date=today)
        .select_related('employee')
        .order_by('-updated_at')[:50]
    ):
        emp = row.employee
        today_work_updates.append({
            'id': row.id,
            'employee_id': emp.id,
            'name': emp.name,
            'department': emp.department or '',
            'designation': emp.designation or '',
            'note': row.note,
            'updated_at': row.updated_at.isoformat() if row.updated_at else None,
        })

    recent_employees = list(
        Employee.objects.order_by('-created_at')[:5].values(
            'id', 'name', 'email', 'department', 'designation', 'is_active', 'created_at'
        )
    )
    for row in recent_employees:
        if row.get('created_at'):
            row['created_at'] = row['created_at'].isoformat()

    recent_messages = list(
        ContactMessage.objects.order_by('-created_at')[:5].values(
            'id', 'full_name', 'email', 'message', 'created_at'
        )
    )
    for row in recent_messages:
        if row.get('created_at'):
            row['created_at'] = row['created_at'].isoformat()
        if row.get('message') and len(row['message']) > 120:
            row['message'] = row['message'][:120] + '…'

    return Response({
        'status': True,
        'data': {
            'employees': {
                'total': total_employees,
                'active': active_employees,
                'inactive': inactive_employees,
            },
            'hiring': {
                'published_jobs': open_jobs,
                'draft_jobs': draft_jobs,
                'new_cvs': new_cvs,
            },
            'inquiries': {
                'total': total_inquiries,
                'last_7_days': recent_inquiries,
            },
            'attendance_today': {
                'present': present_today,
                'late': late_today,
                'absent': absent_today,
            },
            'worklogs_month': {
                'hours': worklog_hours,
                'entries': worklog_entries,
            },
            'today_work_updates': today_work_updates,
            'today_work_updates_count': len(today_work_updates),
            'recent_employees': recent_employees,
            'recent_inquiries': recent_messages,
        },
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def password_forgot(request):
    """Send a 6-digit OTP to the user's email (always returns generic success)."""
    from .password_tokens import create_reset_otp, find_user_by_email, OTP_TTL_MINUTES
    from .email_service import send_password_reset_otp

    email = (request.data.get('email') or '').strip()
    generic = {
        'success': True,
        'message': 'If an account exists for that email, a verification code has been sent.',
    }
    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = find_user_by_email(email)
    if user and user.is_active:
        try:
            _, code = create_reset_otp(user)
            send_password_reset_otp(user, code, ttl_minutes=OTP_TTL_MINUTES)
        except Exception as exc:
            print(f'password_forgot email failed: {exc}')
    return Response(generic, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_verify_otp(request):
    """Verify email OTP and return a short-lived reset session token."""
    from .password_tokens import find_user_by_email, verify_reset_otp, RESET_SESSION_TTL_MINUTES

    email = (request.data.get('email') or '').strip()
    code = (request.data.get('code') or '').strip()
    if not email or not code:
        return Response(
            {'error': 'Email and verification code are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = find_user_by_email(email)
    if not user or not user.is_active:
        return Response({'error': 'Invalid email or verification code.'}, status=status.HTTP_400_BAD_REQUEST)

    session, err = verify_reset_otp(user, code)
    if err:
        return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {
            'success': True,
            'message': 'Code verified. You can now set a new password.',
            'reset_token': session.token,
            'expires_in_minutes': RESET_SESSION_TTL_MINUTES,
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """Set a new password using a verified reset session token."""
    from .models import PasswordActionToken
    from .password_tokens import get_valid_token, mark_token_used, set_user_password, validate_new_password

    reset_token = (request.data.get('reset_token') or '').strip()
    new_password = request.data.get('new_password') or ''
    confirm_password = request.data.get('confirm_password') or ''

    if not reset_token:
        return Response({'error': 'reset_token is required.'}, status=status.HTTP_400_BAD_REQUEST)

    errors = validate_new_password(new_password, confirm_password)
    if errors:
        return Response({'error': errors[0], 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

    row, err = get_valid_token(reset_token, PasswordActionToken.PURPOSE_RESET_SESSION)
    if err:
        return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)

    set_user_password(row.user, new_password)
    mark_token_used(row)
    return Response(
        {'success': True, 'message': 'Password updated successfully. You can now sign in.'},
        status=status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def password_setup_validate(request, token):
    """Validate a create-password invite link."""
    from .models import PasswordActionToken
    from .password_tokens import get_valid_token

    row, err = get_valid_token(token, PasswordActionToken.PURPOSE_SETUP)
    if err:
        return Response({'valid': False, 'error': err}, status=status.HTTP_400_BAD_REQUEST)

    user = row.user
    return Response(
        {
            'valid': True,
            'email': user.email,
            'name': (f'{user.first_name} {user.last_name}'.strip() or user.username),
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def password_setup_confirm(request, token):
    """Complete first-time password setup from invite link."""
    from .models import PasswordActionToken
    from .password_tokens import get_valid_token, mark_token_used, set_user_password, validate_new_password

    new_password = request.data.get('new_password') or ''
    confirm_password = request.data.get('confirm_password') or ''
    errors = validate_new_password(new_password, confirm_password)
    if errors:
        return Response({'error': errors[0], 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

    row, err = get_valid_token(token, PasswordActionToken.PURPOSE_SETUP)
    if err:
        return Response({'error': err}, status=status.HTTP_400_BAD_REQUEST)

    set_user_password(row.user, new_password)
    mark_token_used(row)
    return Response(
        {
            'success': True,
            'message': 'Password created successfully. You can now sign in.',
            'login_url': '/login',
        },
        status=status.HTTP_200_OK,
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    from .models import Notification
    from .notifications import serialize_notification

    qs = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:50]
    unread = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return Response({
        'success': True,
        'unread_count': unread,
        'notifications': [serialize_notification(n) for n in qs],
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_mark_read(request):
    from .models import Notification

    ids = request.data.get('ids') or []
    mark_all = bool(request.data.get('mark_all'))
    qs = Notification.objects.filter(recipient=request.user, is_read=False)
    if mark_all:
        updated = qs.update(is_read=True)
    else:
        if not isinstance(ids, (list, tuple)):
            return Response({'error': 'ids must be a list.'}, status=status.HTTP_400_BAD_REQUEST)
        updated = qs.filter(id__in=ids).update(is_read=True)
    unread = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return Response({'success': True, 'updated': updated, 'unread_count': unread})
