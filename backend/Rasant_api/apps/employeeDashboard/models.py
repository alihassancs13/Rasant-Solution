from django.db import models
from django.conf import settings
from datetime import date
class Employee(models.Model):
    """
    Employee model – All file fields are converted into a 3-column
    binary setup to store documents entirely inside XAMPP MySQL.
    """
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('Intern', 'Intern'),
        ('Probation', 'Probation'),
        ('Contract', 'Contract'),
        ('Permanent', 'Permanent'),
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

    # 1. CNIC SCAN (3 Columns)
    cnic_scan_data = models.BinaryField(null=True, blank=True)
    cnic_scan_name = models.CharField(max_length=255, null=True, blank=True)
    cnic_scan_mimetype = models.CharField(max_length=100, null=True, blank=True)

    present_address = models.TextField(null=True, blank=True)
    permanent_address = models.TextField(null=True, blank=True)
    phone_number = models.CharField(max_length=15)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    designation = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    joined_date = models.DateField(default=date.today)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Intern')

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

    # ---------- User Relation ----------
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='employee_profile',
        null=True,
        blank=True
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
    full_name        = models.CharField(max_length=255)
    email             = models.EmailField(unique=False)
    phone             = models.CharField(max_length=50)
    desired_position  = models.CharField(max_length=255)

    cv_file           = models.BinaryField()
    cv_file_name      = models.CharField(max_length=255)
    cv_file_type      = models.CharField(max_length=100)
    cv_file_size      = models.PositiveIntegerField(default=0)

    submitted_at      = models.DateTimeField(auto_now_add=True)
    cover_letter      = models.TextField(blank=True, null=True)

    application_status = models.ForeignKey(
        ApplicationStatus,
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