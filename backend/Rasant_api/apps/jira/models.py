from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class JiraCredential(models.Model):
    auth_user_id = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    domain = models.CharField(max_length=255, null=True, blank=True)
    email = models.CharField(max_length=255, null=True, blank=True)
    api_token = models.TextField(null=True, blank=True)
    account_id = models.CharField(max_length=255, blank=True, null=True)
    display_name = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Jira display name / username used in timesheet exports.',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        allowed_roles = ["admin", "employee"]
        user_role = getattr(self.auth_user_id.role, "name", None)
        if user_role not in allowed_roles:
            raise ValidationError(
                f"Only users with Admin or Employee role can have a Jira credential. "
                f"'{self.auth_user_id.username}' has role: {user_role or 'None'}"
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        email = getattr(self.auth_user_id, "email", None) or self.email or "?"
        return f"{email} - Jira"


class Source(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'source'

    def __str__(self):
        return self.name


class JiraTask(models.Model):
    jira_credential = models.ForeignKey(JiraCredential, on_delete=models.CASCADE, related_name='jira_tasks')
    issue_key = models.CharField(max_length=100)
    summary = models.TextField()
    source = models.ForeignKey(
        Source,
        on_delete=models.PROTECT,
        related_name='tasks',
        null=True,
        blank=True,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chatbot_tickets'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'jira_tasks'
        ordering = ['-created_at']

    def __str__(self):
        source_name = self.source.name if self.source else 'N/A'
        return f"{self.issue_key} — {self.jira_credential.email} — {source_name}"


class Worklog(models.Model):
    """Local store for Jira-synced and manually entered worklogs."""

    SOURCE_JIRA = 'jira'
    SOURCE_MANUAL = 'manual'
    SOURCE_CHOICES = [
        (SOURCE_JIRA, 'Jira'),
        (SOURCE_MANUAL, 'Manual'),
    ]

    HOURS_PER_DAY = 8

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_worklogs',
        null=True,
        blank=True,
        help_text='Owner of this worklog (employee / admin user).',
    )
    jira_credential = models.ForeignKey(
        JiraCredential,
        on_delete=models.SET_NULL,
        related_name='worklogs',
        null=True,
        blank=True,
    )
    worklog_id = models.CharField(
        max_length=100,
        blank=True,
        default='',
        help_text='Jira worklog id, or generated id for manual entries.',
    )
    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default=SOURCE_JIRA,
        db_index=True,
    )
    issue_key = models.CharField(max_length=100)
    issue_id = models.CharField(max_length=100, null=True, blank=True)
    summary = models.TextField(null=True, blank=True)

    started = models.DateTimeField()
    ended = models.DateTimeField(null=True, blank=True)
    time_spent_seconds = models.PositiveIntegerField()
    comment = models.TextField(null=True, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_worklogs',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'worklog'
        ordering = ['-started']
        indexes = [
            models.Index(fields=['user', 'started']),
            models.Index(fields=['source', 'started']),
        ]

    def __str__(self):
        return f"{self.issue_key} — {self.worklog_id or self.pk} — {self.source}"

    @property
    def hours(self):
        return round((self.time_spent_seconds or 0) / 3600, 2)

    @property
    def day_units(self):
        """Work-day units at 8 hours per day."""
        return round((self.time_spent_seconds or 0) / (self.HOURS_PER_DAY * 3600), 2)


class WorklogExportSettings(models.Model):
    """Singleton-style settings used for monthly worklog Excel exports."""

    project_name = models.CharField(max_length=255, default="CSM-MOVE")
    project_number = models.CharField(max_length=255, default="10501273/004800")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "worklog_export_settings"
        verbose_name = "Worklog Export Settings"
        verbose_name_plural = "Worklog Export Settings"

    def __str__(self):
        return f"{self.project_name} ({self.project_number})"

    @classmethod
    def get_solo(cls):
        obj = cls.objects.first()
        if obj:
            return obj
        return cls.objects.create()
