from django.db import models
from django.conf import settings


class Employee(models.Model):
    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    # --- Personal Details ---
    full_name = models.CharField(max_length=150)
    cnic = models.CharField(max_length=20)
    cnic_scan = models.FileField(upload_to="employer/cnic_scans/")
    email = models.EmailField()
    reference_of = models.CharField(max_length=150)
    present_address = models.TextField()
    permanent_address = models.TextField(blank=True)
    phone = models.CharField(max_length=20)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employee_profile",
        null=True,
        blank=True,
    )


    # --- Emergency Contact ---
    emergency_name = models.CharField(max_length=150)
    emergency_relation = models.CharField(max_length=100)
    emergency_cnic = models.CharField(max_length=20)
    emergency_cnic_scan = models.FileField(upload_to="employer/emergency_cnic_scans/")
    emergency_phone = models.CharField(max_length=20)
    emergency_address = models.TextField()

    # --- Educational Information ---
    metric = models.FileField(upload_to="employer/education/")
    intermediate = models.FileField(upload_to="employer/education/")
    masters_graduation = models.FileField(upload_to="employer/education/", null=True, blank=True)
    other_certificates = models.FileField(upload_to="employer/education/", null=True, blank=True)

    # --- Bank Details ---
    bank_name = models.CharField(max_length=150)
    branch_name = models.CharField(max_length=150, blank=True)
    branch_code = models.CharField(max_length=50, blank=True)
    iban = models.CharField(max_length=34)
    account_no = models.CharField(max_length=50)

    # --- Meta ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name