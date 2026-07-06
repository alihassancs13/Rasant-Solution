import datetime
from django.db import models
from django.db import IntegrityError

class Employee(models.Model):
    """
    Employee model with all required fields (file uploads mandatory).
    employee_number auto‑generated as RS‑MMYY‑NN (resets monthly).
    """

    # ========== Employee Number (Auto-generated) ==========
    employee_number = models.CharField(
        max_length=20,
        unique=True,
        editable=False,
        blank=True,
        help_text="Auto-generated employee ID (e.g., RS-0726-01)"
    )

    # ========== Personal Details ==========
    name = models.CharField(max_length=255, help_text="Full name (required)")
    email = models.EmailField(unique=True, help_text="Email address (required)")
    cnic = models.CharField(max_length=15, unique=True, help_text="CNIC number without dashes (required)")
    cnic_scan = models.FileField(
        upload_to='employee_docs/cnic/',
        help_text="CNIC scan copy (required)"               # <-- required
    )
    present_address = models.TextField(help_text="Present residential address (required)")
    permanent_address = models.TextField(help_text="Permanent residential address (required)")
    phone_number = models.CharField(max_length=15, help_text="Contact phone number (required)")
    gender = models.CharField(
        max_length=10,
        choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')],
        help_text="Gender (required)"
    )

    # ========== Emergency Contact ==========
    emergency_name = models.CharField(max_length=255, help_text="Emergency contact name (required)")
    emergency_relation = models.CharField(max_length=100, help_text="Relationship (required)")
    emergency_cnic = models.CharField(max_length=15, help_text="Emergency contact CNIC (required)")
    emergency_cnic_scan = models.FileField(
        upload_to='employee_docs/emergency/',
        help_text="Emergency contact CNIC scan copy (required)"   # <-- required
    )
    emergency_phone = models.CharField(max_length=15, help_text="Emergency contact phone number (required)")
    emergency_address = models.TextField(help_text="Emergency contact address (required)")

    # ========== Educational Information ==========
    matric_certificate = models.FileField(
        upload_to='employee_docs/education/matric/',
        help_text="Matric certificate or marksheet (required)"    # <-- required
    )
    fsc_certificate = models.FileField(
        upload_to='employee_docs/education/fsc/',
        help_text="FSc/Intermediate certificate or marksheet (required)"
    )
    university_degree = models.FileField(
        upload_to='employee_docs/education/university/',
        help_text="University degree certificate (required)"
    )
    other_course = models.FileField(
        upload_to='employee_docs/education/other/',
        blank=True, null=True,   # <-- remains optional
        help_text="Other course certificates (optional)"
    )

    # ========== Bank Details ==========
    bank_name = models.CharField(max_length=255, help_text="Bank name (required)")
    branch_name = models.CharField(max_length=255, help_text="Branch name (required)")
    branch_code = models.CharField(max_length=50, help_text="Branch code (required)")
    iban_number = models.CharField(max_length=34, help_text="IBAN number (required)")
    account_number = models.CharField(max_length=50, help_text="Bank account number (required)")

    # ========== Meta fields ==========
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.employee_number} - {self.name}"

    def generate_employee_number(self):
        """Generate employee ID in format RS-MMYY-NN, resetting each month."""
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