"""
Central email helpers: load admin SMTP settings and send branded HTML mail.
"""
from __future__ import annotations

import logging
from email.mime.image import MIMEImage
from pathlib import Path

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

LOGO_PATH = Path(__file__).resolve().parent.parent.parent / 'static' / 'email' / 'rasant-logo.png'
COMPANY = {
    'name': 'Rasant Solutions',
    'tagline': 'Software & AI Solutions',
    'website': getattr(settings, 'FRONTEND_URL', 'https://rasantsol.com'),
    'support_email': 'danialali@rasantsol.com',
}


def _get_email_settings():
    from .models import EmailSettings
    return EmailSettings.get_solo()


def get_smtp_connection(email_settings=None):
    cfg = email_settings or _get_email_settings()
    if not cfg.is_active or not cfg.smtp_host or not cfg.smtp_username:
        return get_connection(
            backend=getattr(settings, 'EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend'),
            fail_silently=False,
        )

    return get_connection(
        backend='django.core.mail.backends.smtp.EmailBackend',
        host=cfg.smtp_host,
        port=cfg.smtp_port,
        username=cfg.smtp_username,
        password=cfg.smtp_password or '',
        use_tls=bool(cfg.use_tls),
        use_ssl=bool(cfg.use_ssl),
        fail_silently=False,
    )


def get_from_email(email_settings=None):
    cfg = email_settings or _get_email_settings()
    if cfg.from_email:
        name = cfg.from_name or COMPANY['name']
        return f"{name} <{cfg.from_email}>"
    return getattr(settings, 'DEFAULT_FROM_EMAIL', COMPANY['support_email'])


def get_admin_email(email_settings=None):
    cfg = email_settings or _get_email_settings()
    return cfg.admin_notification_email or cfg.from_email or COMPANY['support_email']


def _logo_cid_payload():
    if not LOGO_PATH.exists():
        return None
    return LOGO_PATH.read_bytes()


def send_branded_email(
        *,
        subject: str,
        template_name: str,
        context: dict,
        to: list[str] | str,
        fail_silently: bool = True,
):
    """
    Render a branded HTML template and send via configured SMTP.
    Returns True on success, False on failure.
    """
    recipients = [to] if isinstance(to, str) else list(to)
    recipients = [r for r in recipients if r]
    if not recipients:
        logger.warning('send_branded_email skipped: no recipients for %s', subject)
        return False

    cfg = _get_email_settings()
    ctx = {
        'company': COMPANY,
        'frontend_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:5173'),
        'support_email': cfg.admin_notification_email or COMPANY['support_email'],
        **context,
    }

    try:
        html_body = render_to_string(template_name, ctx)
        text_body = strip_tags(html_body)
        connection = get_smtp_connection(cfg)
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=get_from_email(cfg),
            to=recipients,
            connection=connection,
        )
        message.attach_alternative(html_body, 'text/html')

        logo_bytes = _logo_cid_payload()
        if logo_bytes:
            logo = MIMEImage(logo_bytes, _subtype='png')
            logo.add_header('Content-ID', '<rasant_logo>')
            logo.add_header('Content-Disposition', 'inline', filename='rasant-logo.png')
            message.attach(logo)

        message.send(fail_silently=False)
        return True
    except Exception as exc:
        logger.exception('Failed to send email "%s": %s', subject, exc)
        if not fail_silently:
            raise
        return False


def send_employee_welcome(employee, setup_url: str, ttl_hours: int = 72):
    return send_branded_email(
        subject='Welcome to Rasant Solutions — Create your password',
        template_name='emails/employee_welcome.html',
        context={
            'employee_name': employee.name,
            'employee_email': employee.email,
            'employee_number': employee.employee_number,
            'setup_url': setup_url,
            'ttl_hours': ttl_hours,
            'login_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/login",
            'department': employee.department,
            'designation': employee.designation,
        },
        to=employee.email,
    )


def send_password_reset_otp(user, code: str, ttl_minutes: int = 15):
    name = f"{user.first_name or ''} {user.last_name or ''}".strip() or user.username
    return send_branded_email(
        subject='Your password reset code — Rasant Solutions',
        template_name='emails/password_reset_otp.html',
        context={
            'employee_name': name,
            'code': code,
            'ttl_minutes': ttl_minutes,
            'email': user.email,
        },
        to=user.email,
    )


def send_onboarding_complete(employee):
    """Notify employee + admin that onboarding form was submitted."""
    ok_emp = send_branded_email(
        subject='Onboarding received — Rasant Solutions',
        template_name='emails/onboarding_complete.html',
        context={
            'employee_name': employee.name,
            'employee_number': employee.employee_number,
            'department': employee.department,
            'designation': employee.designation,
            'recipient_is_admin': False,
        },
        to=employee.email,
    )
    ok_admin = send_branded_email(
        subject=f'Onboarding completed: {employee.name}',
        template_name='emails/onboarding_complete.html',
        context={
            'employee_name': employee.name,
            'employee_email': employee.email,
            'employee_number': employee.employee_number,
            'department': employee.department,
            'designation': employee.designation,
            'phone_number': employee.phone_number,
            'recipient_is_admin': True,
        },
        to=get_admin_email(),
    )
    return ok_emp or ok_admin


def send_employee_status_changed(employee, old_status: str, new_status: str):
    return send_branded_email(
        subject=f'Employment status updated — {new_status}',
        template_name='emails/status_changed.html',
        context={
            'employee_name': employee.name,
            'employee_number': employee.employee_number,
            'old_status': old_status,
            'new_status': new_status,
        },
        to=employee.email,
    )


def send_job_published(job):
    return send_branded_email(
        subject=f'Job published: {job.job_title}',
        template_name='emails/job_published.html',
        context={
            'job_title': job.job_title,
            'department': job.department,
            'location': job.location,
            'job_type': getattr(job.job_type, 'name', ''),
            'careers_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/careers",
        },
        to=get_admin_email(),
    )


def send_increments_due_digest(items: list[dict]):
    if not items:
        return False
    return send_branded_email(
        subject=f'Increments due — {len(items)} employee(s)',
        template_name='emails/increment_due.html',
        context={
            'items': items,
            'count': len(items),
            'salaries_url': f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/admin/employees/salaries",
        },
        to=get_admin_email(),
    )


def send_test_email(to_email: str):
    return send_branded_email(
        subject='Rasant Solutions — SMTP test email',
        template_name='emails/test_email.html',
        context={'to_email': to_email},
        to=to_email,
        fail_silently=False,
    )


def send_leave_requested(leave_request):
    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    emp = leave_request.employee
    return send_branded_email(
        subject=f'Leave request: {emp.name} ({leave_request.duration_label})',
        template_name='emails/leave_requested.html',
        context={
            'employee_name': emp.name,
            'employee_number': emp.employee_number,
            'department': emp.department,
            'subject': leave_request.subject,
            'reason': leave_request.reason,
            'start_date': str(leave_request.start_date),
            'end_date': str(leave_request.end_date),
            'duration_days': leave_request.duration_days,
            'duration_label': leave_request.duration_label,
            'is_half_day': bool(leave_request.is_half_day),
            'half_day_period': leave_request.half_day_period or '',
            'review_url': f'{frontend}/admin/employees/leave',
        },
        to=get_admin_email(),
    )


def send_leave_decision(leave_request, *, approved: bool):
    frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    emp = leave_request.employee
    decision_label = 'approved' if approved else 'rejected'
    return send_branded_email(
        subject=f'Your leave request was {decision_label}',
        template_name='emails/leave_decision.html',
        context={
            'employee_name': emp.name,
            'subject': leave_request.subject,
            'start_date': str(leave_request.start_date),
            'end_date': str(leave_request.end_date),
            'duration_days': leave_request.duration_days,
            'duration_label': leave_request.duration_label,
            'is_half_day': bool(leave_request.is_half_day),
            'half_day_period': leave_request.half_day_period or '',
            'approved': approved,
            'decision_label': decision_label,
            'admin_note': leave_request.admin_note or '',
            'portal_url': f'{frontend}/employee/leave',
        },
        to=emp.email,
    )
def send_inquiry_reply_email(inquiry, subject: str, body: str):
    return send_branded_email(
        subject=subject,
        template_name='emails/inquiry_reply.html',
        context={
            'recipient_name': inquiry.full_name or 'Customer',
            'subject': subject,
            'message': body,
            'original_message': inquiry.message,
        },
        to=inquiry.email,
        fail_silently=False,
    )

def send_candidate_reply_email(to_email: str, subject: str, body: str, recipient_name: str = ''):
    return send_branded_email(
        subject=subject,
        template_name='emails/candidate_reply.html',
        context={
            'recipient_name': recipient_name or 'there',
            'subject': subject,
            'message': body,
        },
        to=to_email,
        fail_silently=False,
    )