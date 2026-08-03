from django.contrib.auth.models import AbstractUser
from django.db import models

class Role(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'roles'

    def __str__(self):
        return self.name or ''

class User(AbstractUser):
    email = models.EmailField(max_length=255,unique=True, blank=True, null=True,)
    avatar = models.BinaryField(null=True, blank=True)  
    avatar_content_type = models.CharField(max_length=100, null=True, blank=True)
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        related_name='users',
        null=True,
        blank=True,
    )

    # Add these to avoid conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username

class Module(models.Model):
    name = models.CharField(max_length=255,)
    icon = models.CharField(max_length=50, blank=True, null=True)
    role = models.ForeignKey(
        'Role',
        on_delete=models.CASCADE,
        related_name='modules'
    )
    link = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'modules'

    def __str__(self):
        return self.name

class InquiryStatus(models.Model):
    name = models.CharField(max_length=20, unique=True)
    code = models.SlugField(max_length=20, unique=True)

    class Meta:
        db_table = 'inquiry_status'
        ordering = ['id']

    def __str__(self):
        return self.name

class ContactMessage(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    message = models.TextField()
    status = models.ForeignKey(
        InquiryStatus, on_delete=models.PROTECT, related_name='inquiries',
        null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contact_messages'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} — {self.email}"


class EmailSettings(models.Model):
    """Singleton-style SMTP configuration managed by admin."""
    smtp_host = models.CharField(max_length=255, default='mail.rasantsol.com')
    smtp_port = models.PositiveIntegerField(default=465)
    smtp_username = models.EmailField(default='danialali@rasantsol.com')
    smtp_password = models.CharField(max_length=255, blank=True, default='')
    use_ssl = models.BooleanField(default=True)
    use_tls = models.BooleanField(default=False)
    from_name = models.CharField(max_length=120, default='Rasant Solutions')
    from_email = models.EmailField(default='danialali@rasantsol.com')
    admin_notification_email = models.EmailField(
        default='danialali@rasantsol.com',
        help_text='Receives system alerts (increments due, onboarding completed, etc.)'
    )
    is_active = models.BooleanField(default=True)
    last_increment_digest_sent = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='email_settings_updates',
    )

    class Meta:
        db_table = 'email_settings'
        verbose_name = 'Email Settings'
        verbose_name_plural = 'Email Settings'

    def __str__(self):
        return f"SMTP {self.smtp_host}:{self.smtp_port}"

    @classmethod
    def get_solo(cls):
        obj = cls.objects.first()
        if obj:
            return obj
        return cls.objects.create()


class PasswordActionToken(models.Model):
    """OTP / one-time links for password reset and first-time password setup."""

    PURPOSE_RESET_OTP = 'reset_otp'
    PURPOSE_RESET_SESSION = 'reset_session'
    PURPOSE_SETUP = 'setup'
    PURPOSE_ONBOARDING = 'onboarding'
    PURPOSE_CHOICES = [
        (PURPOSE_RESET_OTP, 'Password reset OTP'),
        (PURPOSE_RESET_SESSION, 'Password reset session'),
        (PURPOSE_SETUP, 'Create password (invite)'),
        (PURPOSE_ONBOARDING, 'Employee onboarding form'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_action_tokens',
    )
    purpose = models.CharField(max_length=32, choices=PURPOSE_CHOICES)
    token = models.CharField(max_length=64, unique=True, db_index=True)
    code_hash = models.CharField(max_length=128, blank=True, default='')
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'password_action_tokens'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'purpose']),
        ]

    def __str__(self):
        return f'{self.purpose} for {self.user_id}'

    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() >= self.expires_at

    @property
    def is_used(self):
        return self.used_at is not None

class Notification(models.Model):
    TYPE_INBOX = 'inbox'
    TYPE_INQUIRY = 'inquiry'
    TYPE_CV = 'cv'
    TYPE_JOB = 'job'
    TYPE_INCREMENT = 'increment'
    TYPE_STATUS = 'status'
    TYPE_LEAVE = 'leave'
    TYPE_SYSTEM = 'system'
    TYPE_CHOICES = [
        (TYPE_INBOX, 'Inbox'),
        (TYPE_INQUIRY, 'Inquiry'),
        (TYPE_CV, 'CV / Hiring'),
        (TYPE_JOB, 'Job'),
        (TYPE_INCREMENT, 'Increment'),
        (TYPE_STATUS, 'Status'),
        (TYPE_LEAVE, 'Leave'),
        (TYPE_SYSTEM, 'System'),
    ]

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications_sent',
    )
    type = models.CharField(max_length=32, choices=TYPE_CHOICES, default=TYPE_SYSTEM)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True, default='')
    link = models.CharField(max_length=255, blank=True, default='')
    payload = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f'{self.type}: {self.title} -> {self.recipient_id}'

