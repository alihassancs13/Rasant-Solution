from django.db import models
from django.conf import settings

class Employee(models.Model):
    """
    Employee model – fields match the existing database table.
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
    cnic = models.CharField(max_length=15, unique=True)
    cnic_scan = models.FileField(upload_to='employee_docs/cnic/')
    present_address = models.TextField()
    permanent_address = models.TextField()
    phone_number = models.CharField(max_length=15)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    department = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    joined_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Intern')

    # ---------- Emergency Contact ----------
    emergency_name = models.CharField(max_length=255)
    emergency_relation = models.CharField(max_length=100)
    emergency_cnic = models.CharField(max_length=15)
    emergency_cnic_scan = models.FileField(upload_to='employee_docs/emergency/')
    emergency_phone = models.CharField(max_length=15)
    emergency_address = models.TextField()

    # ---------- Education ----------
    matric_certificate = models.FileField(upload_to='employee_docs/education/matric/')
    fsc_certificate = models.FileField(upload_to='employee_docs/education/fsc/')
    university_degree = models.FileField(upload_to='employee_docs/education/university/')
    other_course = models.FileField(
        upload_to='employee_docs/education/other/',
        null=True, blank=True
    )

    # ---------- Bank Details ----------
    bank_name = models.CharField(max_length=255)
    branch_name = models.CharField(max_length=255)
    branch_code = models.CharField(max_length=50)
    iban_number = models.CharField(max_length=34)
    account_number = models.CharField(max_length=50)

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