"""Helpers for password reset OTP and create-password invite links."""
from __future__ import annotations

import hashlib
import secrets
import string
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.utils import timezone

from .models import PasswordActionToken

User = get_user_model()

OTP_LENGTH = 6
OTP_TTL_MINUTES = 15
RESET_SESSION_TTL_MINUTES = 30
SETUP_TTL_HOURS = 72
MAX_OTP_ATTEMPTS = 5
ONBOARDING_TTL_HOURS = 24

def _hash_code(code: str) -> str:
    return hashlib.sha256(code.strip().encode("utf-8")).hexdigest()


def generate_otp_code(length: int = OTP_LENGTH) -> str:
    return "".join(secrets.choice(string.digits) for _ in range(length))


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def invalidate_tokens(user, purpose: str):
    PasswordActionToken.objects.filter(
        user=user,
        purpose=purpose,
        used_at__isnull=True,
    ).update(used_at=timezone.now())


def create_reset_otp(user) -> tuple[PasswordActionToken, str]:
    """Create a reset OTP row and return (row, plain_code)."""
    invalidate_tokens(user, PasswordActionToken.PURPOSE_RESET_OTP)
    invalidate_tokens(user, PasswordActionToken.PURPOSE_RESET_SESSION)
    code = generate_otp_code()
    row = PasswordActionToken.objects.create(
        user=user,
        purpose=PasswordActionToken.PURPOSE_RESET_OTP,
        token=generate_token(),
        code_hash=_hash_code(code),
        expires_at=timezone.now() + timedelta(minutes=OTP_TTL_MINUTES),
    )
    return row, code


def verify_reset_otp(user, code: str) -> tuple[PasswordActionToken | None, str | None]:
    """
    Verify OTP. On success mark OTP used and create a short-lived reset session token.
    Returns (session_row, error_message).
    """
    row = (
        PasswordActionToken.objects.filter(
            user=user,
            purpose=PasswordActionToken.PURPOSE_RESET_OTP,
            used_at__isnull=True,
        )
        .order_by("-created_at")
        .first()
    )
    if not row:
        return None, "No active verification code. Please request a new one."
    if row.is_expired:
        row.used_at = timezone.now()
        row.save(update_fields=["used_at"])
        return None, "Verification code expired. Please request a new one."
    if row.attempts >= MAX_OTP_ATTEMPTS:
        row.used_at = timezone.now()
        row.save(update_fields=["used_at"])
        return None, "Too many invalid attempts. Please request a new code."

    if _hash_code(code) != row.code_hash:
        row.attempts += 1
        row.save(update_fields=["attempts"])
        remaining = MAX_OTP_ATTEMPTS - row.attempts
        if remaining <= 0:
            row.used_at = timezone.now()
            row.save(update_fields=["used_at"])
            return None, "Too many invalid attempts. Please request a new code."
        return None, f"Invalid verification code. {remaining} attempt(s) left."

    row.used_at = timezone.now()
    row.save(update_fields=["used_at"])

    session = PasswordActionToken.objects.create(
        user=user,
        purpose=PasswordActionToken.PURPOSE_RESET_SESSION,
        token=generate_token(),
        expires_at=timezone.now() + timedelta(minutes=RESET_SESSION_TTL_MINUTES),
    )
    return session, None


def create_setup_token(user) -> PasswordActionToken:
    invalidate_tokens(user, PasswordActionToken.PURPOSE_SETUP)
    return PasswordActionToken.objects.create(
        user=user,
        purpose=PasswordActionToken.PURPOSE_SETUP,
        token=generate_token(),
        expires_at=timezone.now() + timedelta(hours=SETUP_TTL_HOURS),
    )


def get_valid_token(token: str, purpose: str) -> tuple[PasswordActionToken | None, str | None]:
    row = PasswordActionToken.objects.select_related("user").filter(token=token, purpose=purpose).first()
    print("token:", row.token)
    print("created_at:", row.created_at)
    print("expires_at:", row.expires_at)
    print("now:", timezone.now())
    print("is_expired:", row.is_expired)
    print("used_at:", row.used_at)
    if not row:
        return None, "Invalid or unknown link."
    if row.is_used:
        return None, "This link has already been used."
    if row.is_expired:
        return None, "This link has expired. Please request a new one."
    return row, None


def mark_token_used(row: PasswordActionToken):
    row.used_at = timezone.now()
    row.save(update_fields=["used_at"])


def set_user_password(user, raw_password: str):
    """Set User password and sync linked Employee.password hash when present."""
    user.set_password(raw_password)
    user.save(update_fields=["password"])
    try:
        from employeeDashboard.models import Employee

        employee = Employee.objects.filter(user=user).first()
        if employee is None:
            employee = Employee.objects.filter(email__iexact=user.email).first()
        if employee:
            employee.password = make_password(raw_password)
            if employee.user_id is None:
                employee.user = user
                employee.save(update_fields=["password", "user"])
            else:
                employee.save(update_fields=["password"])
    except Exception:
        # Employee app may be unavailable in some contexts — User password still set.
        pass


def find_user_by_email(email: str):
    email = (email or "").strip()
    if not email:
        return None
    return User.objects.filter(email__iexact=email).first()


def validate_new_password(password: str, confirm: str) -> list[str]:
    errors = []
    if not password or len(password) < 8:
        errors.append("Password must be at least 8 characters.")
    if password != confirm:
        errors.append("Passwords do not match.")
    return errors

def create_onboarding_token(user) -> PasswordActionToken:
    invalidate_tokens(user, PasswordActionToken.PURPOSE_ONBOARDING)
    return PasswordActionToken.objects.create(
        user=user,
        purpose=PasswordActionToken.PURPOSE_ONBOARDING,
        token=generate_token(),
        expires_at=timezone.now() + timedelta(hours=ONBOARDING_TTL_HOURS),
    )
