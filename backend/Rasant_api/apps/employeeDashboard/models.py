from django.db import models
from django.conf import settings
from datetime import date


class EmploymentStatus(models.Model):
    """Lookup table for employee post/status (Intern, Probation, etc.)."""
    name = models.CharField(max_length=50, unique=True)
    code = models.SlugField(max_length=50, unique=True)
    apply_payroll_deductions = models.BooleanField(
        default=True,
        help_text="If false, leave/absent/late payroll settings do not apply (e.g. Intern, Probation).",
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "employment_status"
        ordering = ["sort_order", "id"]
        verbose_name = "Employment Status"
        verbose_name_plural = "Employment Statuses"

    def __str__(self):
        return self.name


class Employee(models.Model):

    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    employee_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        help_text="Auto‑generated employee ID (e.g., RS‑0726‑01)"
    )

    # ---------- Personal Details ----------
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    cnic = models.CharField(max_length=15, unique=True, null=True, blank=True)

    cnic_scan_data = models.BinaryField(null=True, blank=True)
    cnic_scan_name = models.CharField(max_length=255, null=True, blank=True)
    cnic_scan_mimetype = models.CharField(max_length=100, null=True, blank=True)

    present_address = models.TextField(null=True, blank=True)
    permanent_address = models.TextField(null=True, blank=True)
    phone_number = models.CharField(max_length=15)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True)
    department = models.CharField(max_length=100, default='Unassigned')
    designation = models.CharField(max_length=100, default='Unassigned')
    is_active = models.BooleanField(default=True)
    work_from_home = models.BooleanField(
        default=False,
        help_text="If true, attendance outside the office radius is labeled Work from home.",
    )
    salary = models.IntegerField(default=0)
    tax = models.IntegerField(  default=0)
    insurance_amount = models.IntegerField( default=0)
    is_increment_pending = models.BooleanField(default=False)
    increment_applied_on = models.DateField(null=True, blank=True)
    current_salary = models.IntegerField(null=True, blank=True)
    joined_date = models.DateField(default=date.today)
    status = models.ForeignKey(
        EmploymentStatus,
        on_delete=models.PROTECT,
        related_name="employees",
        null=True,
        blank=True,
    )
    feedback = models.TextField(
        null=True,
        blank=True,
        help_text="Feedback/reason for employment status changes (especially for resignation)"
    )

    # ---------- Emergency Contact ----------
    emergency_name = models.CharField(max_length=255, null=True, blank=True)
    emergency_relation = models.CharField(max_length=100, null=True, blank=True)
    emergency_cnic = models.CharField(max_length=15, null=True, blank=True)

    # 2. EMERGENCY CNIC SCAN (3 Columns)
    emergency_cnic_scan_data = models.BinaryField(null=True, blank=True)
    emergency_cnic_scan_name = models.CharField(max_length=255, null=True, blank=True)
    emergency_cnic_scan_mimetype = models.CharField(max_length=100, null=True, blank=True)

    emergency_phone = models.CharField(max_length=15, null=True, blank=True)
    emergency_address = models.TextField(null=True, blank=True)
    next_insurance_cycle_date = models.DateField(null=True, blank=True)

    # ---------- Education ----------
    # 3. MATRIC CERTIFICATE (3 Columns)
    matric_certificate_data = models.BinaryField(null=True, blank=True)
    matric_certificate_name = models.CharField(max_length=255, null=True, blank=True)
    matric_certificate_mimetype = models.CharField(max_length=100, null=True, blank=True)

    # 4. FSC CERTIFICATE (3 Columns)
    fsc_certificate_data = models.BinaryField(null=True, blank=True)
    fsc_certificate_name = models.CharField(max_length=255, null=True, blank=True)
    fsc_certificate_mimetype = models.CharField(max_length=100, null=True, blank=True)

    # 5. UNIVERSITY DEGREE (3 Columns)
    university_degree_data = models.BinaryField(null=True, blank=True)
    university_degree_name = models.CharField(max_length=255, null=True, blank=True)
    university_degree_mimetype = models.CharField(max_length=100, null=True, blank=True)

    # 6. OTHER COURSE (3 Columns)
    other_course_data = models.BinaryField(null=True, blank=True)
    other_course_name = models.CharField(max_length=255, null=True, blank=True)
    other_course_mimetype = models.CharField(max_length=100, null=True, blank=True)

    # ---------- Bank Details ----------
    bank_name = models.CharField(max_length=255, null=True, blank=True)
    branch_name = models.CharField(max_length=255, null=True, blank=True)
    branch_code = models.CharField(max_length=50, null=True, blank=True)
    account_number = models.CharField(max_length=50, null=True, blank=True)
    attendance_id = models.IntegerField(
        unique=True,
        null=True,
        blank=True,
        help_text="Numeric ID used to match bulk attendance CSV uploads to this employee"
    )

    # ---------- User Relation ----------
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='employee_profile',
        null=True,
        blank=True
    )
    increment_policy = models.ForeignKey(
        'IncrementPolicy',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees'
    )
    password = models.CharField(
        max_length=128,
        null=True,
        blank=True,
        help_text="Hashed password using Django's PBKDF2 algorithm"
    )

    # ---------- Timestamps ----------
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def full_name(self):
        return self.name


class ApplicationStatus(models.Model):
    name = models.CharField(max_length=20, unique=True)

    class Meta:
        db_table = 'application_status'
        ordering = ['id']

    def __str__(self):
        return self.name


class CVSubmission(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=False)
    phone = models.CharField(max_length=50)
    desired_position = models.CharField(max_length=255)

    cv_file = models.BinaryField()
    cv_file_name = models.CharField(max_length=255)
    cv_file_type = models.CharField(max_length=100)
    cv_file_size = models.PositiveIntegerField(default=0)

    submitted_at = models.DateTimeField(auto_now_add=True)
    cover_letter = models.TextField(blank=True, null=True)

    application_status = models.ForeignKey(
        ApplicationStatus,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cv_submissions'
    )

    job = models.ForeignKey(
        'JobOpening',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cv_submissions'
    )

    class Meta:
        db_table = 'cv_submissions'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.full_name} — {self.desired_position}"


class JobType(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'job_types'
        ordering = ['name']

    def __str__(self):
        return self.name


class JobStatus(models.Model):
    name = models.CharField(max_length=20, unique=True)

    class Meta:
        db_table = 'job_status'
        ordering = ['id']

    def __str__(self):
        return self.name


class JobOpening(models.Model):
    job_title = models.CharField(max_length=200)
    job_type = models.ForeignKey(
        JobType,
        on_delete=models.PROTECT,
        related_name='job_openings'
    )
    department = models.CharField(max_length=100)
    location = models.CharField(max_length=150)
    salary_range = models.IntegerField(null=True, blank=True)
    description = models.CharField(max_length=2000)
    requirements = models.CharField(max_length=2000)

    status = models.ForeignKey(
        JobStatus,
        on_delete=models.PROTECT,
        related_name='job_openings',
        default=1
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'job_openings'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.job_title} ({self.department})"


class IncrementType(models.Model):
    name = models.CharField(max_length=100)
    code = models.SlugField(max_length=50, unique=True)  # e.g. "percentage", "fixed"

    class Meta:
        db_table = "increment_type"

    def __str__(self):
        return self.name


class CycleTiming(models.Model):
    name = models.CharField(max_length=100)
    code = models.SlugField(max_length=50, unique=True)  # e.g. "monthly", "quarterly", "annually"

    class Meta:
        db_table = "cycle_timing"

    def __str__(self):
        return self.name


class ApplicationMode(models.Model):
    name = models.CharField(max_length=100)
    code = models.SlugField(max_length=50, unique=True)  # e.g. "auto", "manual"

    class Meta:
        db_table = "application_mode"

    def __str__(self):
        return self.name


class IncrementPolicy(models.Model):
    policy_name = models.CharField(max_length=255)
    increment_type = models.ForeignKey(
        IncrementType, on_delete=models.PROTECT, related_name="policies"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    cycle_timing = models.ForeignKey(
        CycleTiming, on_delete=models.PROTECT, related_name="policies"
    )
    next_effective_date = models.DateField(null=True, blank=True)
    application_mode = models.ForeignKey(
        ApplicationMode, on_delete=models.PROTECT, related_name="policies"
    )
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    last_run_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "increment_policy"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.policy_name} ({self.increment_type.name})"


class SalaryIncrementHistory(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="increment_history"
    )
    policy = models.ForeignKey(
        IncrementPolicy,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    old_salary = models.DecimalField(max_digits=10, decimal_places=2)
    increment_type = models.CharField(max_length=50)
    increment_value = models.DecimalField(max_digits=10, decimal_places=2)
    increment_amount = models.DecimalField(max_digits=10, decimal_places=2)
    new_salary = models.DecimalField(max_digits=10, decimal_places=2)
    applied_on = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-applied_on"]

class EmployeePolicyAssignment(models.Model):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name='policy_assignments'
    )
    policy = models.ForeignKey(
        IncrementPolicy, on_delete=models.CASCADE, related_name='employee_assignments'
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'employee_policy_assignments'
        unique_together = ('employee', 'policy')
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.employee} → {self.policy.policy_name}"


class SalaryDeductionHistory(models.Model):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="deduction_history"
    )
    deduction_month = models.DateField()

    gross_salary = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    salary_after_tax = models.DecimalField(max_digits=10, decimal_places=2)

    insurance_amount = models.DecimalField(max_digits=10, decimal_places=2)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2)

    # --- Attendance summary ---
    total_days = models.PositiveIntegerField(default=30)
    present_days = models.PositiveIntegerField(default=0)
    paid_leave_days = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    unpaid_leave_days = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    unpaid_absent_days = models.PositiveIntegerField(default=0)

    # --- Late penalty ---
    late_count = models.PositiveIntegerField(default=0)
    late_penalty_days = models.DecimalField(max_digits=4, decimal_places=1, default=0)
    late_penalty_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    attendance_synced = models.BooleanField(default=False)

    # --- Overtime ---
    overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    overtime_rate_applied = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    overtime_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # --- Calculation base values ---
    per_day_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    half_day_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    attendance_deduction_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    bonus_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # --- Lock ---
    is_finalized = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "salary_deduction_history"
        ordering = ["-deduction_month"]
        unique_together = ("employee", "deduction_month")

    def __str__(self):
        return f"{self.employee.name} — {self.deduction_month.strftime('%b %Y')}"

class PayrollSettings(models.Model):
    grace_minutes = models.PositiveIntegerField(default=10)
    allowed_leaves_per_month = models.PositiveIntegerField(default=2)
    allowed_absents_per_month = models.PositiveIntegerField(default=0)

    overtime_rate_per_hour = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    late_count_threshold = models.PositiveIntegerField(
        default=3,
        help_text="Free lates per month before half-day penalty starts"
    )

    default_timetable = models.CharField(
        max_length=50,
        default="10 - 7",
        help_text='Shift used for employee self check-in (e.g. "10 - 7")',
    )

    office_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    office_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    office_radius_meters = models.PositiveIntegerField(
        default=150,
        help_text="Distance from office pin within which check-in counts as In Office",
    )
    office_address = models.CharField(max_length=500, blank=True, default="")
    office_set_at = models.DateTimeField(null=True, blank=True)

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payroll_settings"

    def save(self, *args, **kwargs):
        self.pk = 1  # enforce singleton
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    @property
    def office_configured(self):
        return self.office_latitude is not None and self.office_longitude is not None

    def __str__(self):
        return "Payroll Settings"

class Attendance(models.Model):

    STATUS_CHOICES = [
        ('present', 'Present'),
        ('late', 'Late'),
        ('absent', 'Absent'),
        ('on_leave', 'On leave'),
        ('holiday', 'Holiday'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    timetable = models.CharField(max_length=100, blank=True, null=True)
    clock_in = models.TimeField(null=True, blank=True)
    clock_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')

    late_minutes = models.PositiveIntegerField(null=True, blank=True)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_paid = models.BooleanField(null=True, blank=True)
    # True when an approved half-day leave applies (counts as 0.5 leave day in payroll)
    is_half_day = models.BooleanField(default=False)

    check_in_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    check_in_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    check_in_address = models.CharField(max_length=500, blank=True, default="")
    check_in_in_office = models.BooleanField(null=True, blank=True)
    check_in_distance_meters = models.PositiveIntegerField(null=True, blank=True)

    check_out_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    check_out_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    check_out_address = models.CharField(max_length=500, blank=True, default="")
    check_out_in_office = models.BooleanField(null=True, blank=True)
    check_out_distance_meters = models.PositiveIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'attendance'
        ordering = ['-date']
        unique_together = ('employee', 'date')

    def __str__(self):
        return f"{self.employee.name} — {self.date} ({self.status})"
class DailyWorkUpdate(models.Model):
    """What an employee is working on for a given calendar day (visible to admin)."""

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='daily_work_updates',
    )
    date = models.DateField(default=date.today)
    note = models.TextField(
        help_text='What the employee is working on today.',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'daily_work_updates'
        ordering = ['-updated_at']
        unique_together = ('employee', 'date')

    def __str__(self):
        return f'{self.employee.name} — {self.date}'

class CompanyHoliday(models.Model):
    """Admin-defined non-working day — attendance auto-marked Holiday (no deductions)."""

    date = models.DateField(unique=True, db_index=True)
    name = models.CharField(max_length=255, default='Holiday')
    note = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='company_holidays_created',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'company_holidays'
        ordering = ['-date']

    def __str__(self):
        return f'{self.date} — {self.name}'

class LeaveRequest(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    HALF_DAY_MORNING = 'morning'
    HALF_DAY_AFTERNOON = 'afternoon'
    HALF_DAY_PERIOD_CHOICES = [
        (HALF_DAY_MORNING, 'Morning'),
        (HALF_DAY_AFTERNOON, 'Afternoon'),
    ]

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='leave_requests',
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_half_day = models.BooleanField(
        default=False,
        help_text='When true, leave is for half of a single day (0.5 day).',
    )
    half_day_period = models.CharField(
        max_length=20,
        choices=HALF_DAY_PERIOD_CHOICES,
        blank=True,
        default='',
        help_text='Morning or afternoon when is_half_day is true.',
    )
    subject = models.CharField(max_length=255, default='Leave request')
    reason = models.TextField(help_text='Leave proposal / reasoning for admin review.')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING, db_index=True)
    admin_note = models.TextField(blank=True, default='')
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='leave_reviews',
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'leave_requests'
        ordering = ['-created_at']

    def __str__(self):
        kind = 'half-day' if self.is_half_day else 'full'
        return f'{self.employee.name} {self.start_date}→{self.end_date} ({kind}, {self.status})'

    @property
    def duration_days(self):
        if self.is_half_day:
            return 0.5
        if not self.start_date or not self.end_date:
            return 0
        return (self.end_date - self.start_date).days + 1

    @property
    def duration_label(self):
        if self.is_half_day:
            period = dict(self.HALF_DAY_PERIOD_CHOICES).get(self.half_day_period, '')
            return f'Half day ({period})' if period else 'Half day'
        days = int(self.duration_days or 0)
        return f'{days} day' if days == 1 else f'{days} days'
