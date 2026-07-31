# Create your views here.

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Module, ContactMessage, EmailSettings,InquiryStatus
from .employee_access import build_sidebar_modules_for_role, ensure_user_is_employee
from .serializer import (
    LoginSerializer,
    UserSerializer,
    ContactMessageSerializer,
    ProfileUpdateSerializer,
    ChangePasswordSerializer,
    EmailSettingsSerializer,
)
from django.http import  HttpResponse
from employeeDashboard.models import Employee
from .email_service import send_test_email, send_inquiry_reply_email

def _is_admin(user):
    role_name = (user.role.name if user.role else '').lower()
    return role_name in ('admin', 'administrator') or user.is_superuser or user.is_staff


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        errors = {}
        for field, error_list in serializer.errors.items():
            if field == 'non_field_errors':
                errors['non_field_errors'] = error_list
            else:
                if error_list and isinstance(error_list, list):
                    errors[field] = error_list[0] if error_list else "Invalid value"
                else:
                    errors[field] = error_list
        return Response({
            "status": False,
            "message": "Validation Failed",
            "errors": errors
        }, status=status.HTTP_400_BAD_REQUEST)
    email = serializer.validated_data.get('email')
    username = serializer.validated_data.get('username')
    password = serializer.validated_data['password']
    is_email_login = email is not None and email != ''
    is_username_login = username is not None and username != ''
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
    # Check if user account is active
    if not user.is_active:
        return Response({
            "status": False,
            "message": "Your account has been suspended. Please contact administrator.",
            "error_type": "account_suspended"
        }, status=status.HTTP_403_FORBIDDEN)
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
        employee = Employee.objects.get(user=user)
        user_data['employee_id'] = employee.id
        employee_data = {'id': employee.id}
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
        user_data['employee_id'] = None
        user_data['employee'] = None
    except Exception as e:
        print(f"Error getting employee: {e}")
        user_data['employee_id'] = None
        user_data['employee'] = None
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
    empty = {"modules": [], "account_modules": [], "project_modules": []}
    try:
        from .employee_access import (
            build_sidebar_modules_for_role,
            ensure_admin_leave_module,
            ensure_employee_modules,
            ensure_user_is_employee,
        )

        user = request.user
        role = getattr(user, "role", None)
        if not role:
            return Response({
                "status": True,
                "message": "No role assigned",
                "data": empty,
            })

        try:
            role_name = (role.name or "").lower()
            if role_name == "employee":
                ensure_user_is_employee(user)
            else:
                ensure_employee_modules()
                ensure_admin_leave_module()
        except Exception as sync_err:
            print(f"Module sync on get_user_modules failed: {sync_err}")

        payload = build_sidebar_modules_for_role(role)
        return Response({
            "status": True,
            "message": "Modules fetched successfully",
            "data": payload,
        })
    except Exception as exc:
        print(f"get_user_modules failed: {exc}")
        return Response({
            "status": False,
            "message": f"Failed to load modules: {exc}",
            "data": empty,
        }, status=status.HTTP_200_OK)


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

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_inquiry(request, pk):
    try:
        inquiry = ContactMessage.objects.get(pk=pk)
    except ContactMessage.DoesNotExist:
        return Response({'error': 'Inquiry not found.'}, status=status.HTTP_404_NOT_FOUND)

    inquiry.delete()
    return Response({'status': True, 'message': 'Inquiry deleted successfully.'}, status=status.HTTP_200_OK)


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


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_inquiry_status(request, pk):
    try:
        inquiry = ContactMessage.objects.get(pk=pk)
    except ContactMessage.DoesNotExist:
        return Response({'error': 'Inquiry not found.'}, status=status.HTTP_404_NOT_FOUND)

    code = request.data.get('status')
    try:
        new_status = InquiryStatus.objects.get(code=code)
    except InquiryStatus.DoesNotExist:
        return Response({'error': f"Invalid status '{code}'."}, status=status.HTTP_400_BAD_REQUEST)

    inquiry.status = new_status
    inquiry.save(update_fields=['status'])

    return Response(ContactMessageSerializer(inquiry).data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_inquiry_reply(request, pk):
    try:
        inquiry = ContactMessage.objects.get(pk=pk)
    except ContactMessage.DoesNotExist:
        return Response({'error': 'Inquiry not found.'}, status=status.HTTP_404_NOT_FOUND)

    body = (request.data.get('body') or '').strip()
    subject = (request.data.get('subject') or '').strip() or "Re: Your inquiry to Rasant Solutions"

    if not body:
        return Response({'error': 'Reply body is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        send_inquiry_reply_email(inquiry, subject, body)
    except Exception as e:
        return Response(
            {'error': f'Failed to send email: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    replied_status, _ = InquiryStatus.objects.get_or_create(code='replied', defaults={'name': 'Replied'})
    inquiry.status = replied_status
    inquiry.save(update_fields=['status'])

    return Response(ContactMessageSerializer(inquiry).data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_inquiry_statuses(request):
    statuses = InquiryStatus.objects.all().values('id', 'code', 'name')
    return Response({'status': True, 'data': list(statuses)}, status=status.HTTP_200_OK)

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
    try:
        raw = user.avatar
        if isinstance(raw, memoryview):
            data = raw.tobytes()
        elif isinstance(raw, (bytes, bytearray)):
            data = bytes(raw)
        else:
            data = bytes(raw)
    except Exception as exc:
        print(f'get_user_avatar encode failed: {exc}')
        return Response({'error': 'Avatar could not be read.'}, status=500)
    response = HttpResponse(data, content_type=user.avatar_content_type or 'image/png')
    response['Cache-Control'] = 'private, max-age=300'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_overview_stats(request):
    """Aggregate stats for the admin Overview dashboard."""
    try:
        role_name = (request.user.role.name if request.user.role else '') or ''
        if role_name.lower() not in ('admin', 'administrator') and not (request.user.is_superuser or request.user.is_staff):
            return Response({'status': False, 'message': 'Admin access required.'}, status=403)

        from datetime import date, timedelta
        from django.db import DatabaseError
        from employeeDashboard.models import Employee, JobOpening, CVSubmission, Attendance

        today = date.today()
        month_start = today.replace(day=1)

        total_employees = Employee.objects.count()
        active_employees = Employee.objects.filter(is_active=True).count()
        inactive_employees = total_employees - active_employees

        try:
            open_jobs = JobOpening.objects.filter(status__name__iexact='Published').count()
            draft_jobs = JobOpening.objects.filter(status__name__iexact='Draft').count()
        except DatabaseError:
            open_jobs = draft_jobs = 0

        try:
            new_cvs = CVSubmission.objects.filter(application_status_id=1).count()
        except DatabaseError:
            new_cvs = 0

        total_inquiries = ContactMessage.objects.count()
        recent_inquiries = ContactMessage.objects.filter(
            created_at__date__gte=today - timedelta(days=7)
        ).count()

        try:
            attendance_today = Attendance.objects.filter(date=today)
            present_today = attendance_today.filter(status='present').count()
            late_today = attendance_today.filter(status='late').count()
            absent_today = attendance_today.filter(status='absent').count()
        except DatabaseError:
            present_today = late_today = absent_today = 0

        # Prefer local synced worklogs (fast / reliable). Fall back to 0 on schema issues.
        worklog_seconds = 0
        worklog_entries = 0
        try:
            from jira.models import Worklog
            from django.db.models import Sum, Count
            from datetime import datetime, time as dtime, timezone as dt_tz

            start_dt = datetime.combine(month_start, dtime.min, tzinfo=dt_tz.utc)
            end_dt = datetime.combine(today, dtime.max, tzinfo=dt_tz.utc)
            agg = Worklog.objects.filter(started__gte=start_dt, started__lte=end_dt).aggregate(
                total_seconds=Sum('time_spent_seconds'),
                total_entries=Count('id'),
            )
            worklog_seconds = int(agg.get('total_seconds') or 0)
            worklog_entries = int(agg.get('total_entries') or 0)
        except Exception as wl_err:
            print(f'overview worklog aggregate failed: {wl_err}')

        worklog_hours = round(worklog_seconds / 3600, 1)

        today_work_updates = []
        try:
            from employeeDashboard.models import DailyWorkUpdate
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
        except Exception as upd_err:
            print(f'overview daily work updates failed: {upd_err}')

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
    except Exception as exc:
        print(f'admin_overview_stats failed: {exc}')
        return Response(
            {'status': False, 'message': f'Failed to load overview stats: {exc}', 'data': {}},
            status=status.HTTP_200_OK,
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def password_forgot(request):
    from .password_tokens import create_reset_otp, find_user_by_email, OTP_TTL_MINUTES
    from .email_service import send_password_reset_otp

    email = (request.data.get('email') or '').strip()

    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = find_user_by_email(email)

    if not user or not user.is_active:
        return Response(
            {'error': 'No account found with this email address.', 'errorType': 'email_not_found'},
            status=status.HTTP_404_NOT_FOUND
        )

    try:
        _, code = create_reset_otp(user)
        send_password_reset_otp(user, code, ttl_minutes=OTP_TTL_MINUTES)
    except Exception as exc:
        print(f'password_forgot email failed: {exc}')
        return Response(
            {'error': 'Could not send verification code. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response(
        {'success': True, 'message': 'Verification code sent to your email.'},
        status=status.HTTP_200_OK
    )


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
    from django.db import DatabaseError

    try:
        from .models import Notification
        from .notifications import serialize_notification

        qs = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:50]
        unread = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({
            'success': True,
            'unread_count': unread,
            'notifications': [serialize_notification(n) for n in qs],
        })
    except DatabaseError as exc:
        print(f'notification_list DB error: {exc}')
        return Response({
            'success': False,
            'unread_count': 0,
            'notifications': [],
            'error': 'Notifications table missing. Run: python manage.py migrate accounts',
        }, status=status.HTTP_200_OK)
    except Exception as exc:
        print(f'notification_list failed: {exc}')
        return Response({
            'success': False,
            'unread_count': 0,
            'notifications': [],
            'error': str(exc),
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_mark_read(request):
    from django.db import DatabaseError
    from .models import Notification

    ids = request.data.get('ids') or []
    mark_all = bool(request.data.get('mark_all'))
    try:
        qs = Notification.objects.filter(recipient=request.user, is_read=False)
        if mark_all:
            updated = qs.update(is_read=True)
        else:
            if not isinstance(ids, (list, tuple)):
                return Response({'error': 'ids must be a list.'}, status=status.HTTP_400_BAD_REQUEST)
            updated = qs.filter(id__in=ids).update(is_read=True)
        unread = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'success': True, 'updated': updated, 'unread_count': unread})
    except DatabaseError as exc:
        print(f'notification_mark_read DB error: {exc}')
        return Response({
            'success': False,
            'updated': 0,
            'unread_count': 0,
            'error': 'Notifications table missing. Run migrate accounts.',
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notification_clear(request):
    """
    Delete notifications for the current user.
    Body:
      - clear_all: true  → delete every notification
      - ids: [1,2,…]     → delete specific ids
      - read_only: true  → delete only already-read notifications
    Default (no flags): delete all notifications for the user.
    """
    from django.db import DatabaseError
    from .models import Notification

    try:
        qs = Notification.objects.filter(recipient=request.user)
        ids = request.data.get('ids')
        clear_all = request.data.get('clear_all', None)
        read_only = bool(request.data.get('read_only'))

        if isinstance(ids, (list, tuple)) and len(ids) > 0:
            qs = qs.filter(id__in=ids)
        elif read_only:
            qs = qs.filter(is_read=True)
        elif clear_all is False and not read_only:
            # explicit false with no ids → nothing to do
            return Response({'success': True, 'deleted': 0, 'unread_count': qs.filter(is_read=False).count()})

        deleted, _ = qs.delete()
        unread = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'success': True, 'deleted': deleted, 'unread_count': unread})
    except DatabaseError as exc:
        print(f'notification_clear DB error: {exc}')
        return Response({
            'success': False,
            'deleted': 0,
            'unread_count': 0,
            'error': 'Notifications table missing. Run migrate accounts.',
        }, status=status.HTTP_200_OK)
