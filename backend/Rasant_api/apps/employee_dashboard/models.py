import datetime
from django.db import models
from django.db import IntegrityError
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
        ('intern', 'Intern'),
        ('probation', 'Probation'),
        ('contract', 'Contract'),
        ('permanent', 'Permanent'),
    ]


    # Primary key is auto‑created (id), no need to define it.
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
    department = models.CharField(max_length=100, null=True, blank=True)
    designation = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    joined_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='intern')

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
        null=True, blank=True    # matches the nullable column in DB
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

    # If your code expects `full_name`, you can use this property
    @property
    def full_name(self):
        return self.name

    # ---------- Employee Number Generation ----------
    def generate_employee_number(self):
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

    def save(self, *args, **kwargs):
        if not self.employee_number:
            for attempt in range(3):
                try:
                    self.employee_number = self.generate_employee_number()
                    super().save(*args, **kwargs)
                    break
                except IntegrityError:
                    continue
            else:
                raise IntegrityError("Could not generate a unique employee number.")
        else:
            super().save(*args, **kwargs)