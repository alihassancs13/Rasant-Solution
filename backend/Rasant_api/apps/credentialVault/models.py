from django.db import models

# Create your models here.
from django.db import models

class CredentialStore(models.Model):
    name = models.CharField(max_length=200, help_text="Credential/Label name",)
    link = models.URLField(max_length=500, blank=True, null=True, help_text="URL/Link for the service")
    username = models.CharField(max_length=200, help_text="Username",unique=True)
    email = models.EmailField(max_length=254, blank=True, null=True, help_text="Email address",unique=True)
    password = models.CharField(max_length=500, help_text="Password")
    description = models.TextField(blank=True, null=True, help_text="Additional description or notes")
    created_at = models.DateTimeField(auto_now_add=True, help_text="Created date/time")

    class Meta:
        db_table = 'credential_store'
        verbose_name = 'Credential'
        verbose_name_plural = 'Credentials'
        ordering = ['-created_at']

    def __str__(self):
        return self.name



class SharedCredential(models.Model):
    credential = models.ForeignKey(
        CredentialStore,
        on_delete=models.CASCADE,
        related_name='shared_credentials',
        help_text="Reference to the credential being shared"
    )
    employee_id = models.IntegerField(
        help_text="Employee ID from EmployeeDashboard table"
    )
    shared_at = models.DateTimeField(auto_now_add=True, help_text="Date/Time when shared")

    class Meta:
        db_table = 'shared_credentials'
        verbose_name = 'Shared Credential'
        verbose_name_plural = 'Shared Credentials'
        ordering = ['-shared_at']
        unique_together = ['credential', 'employee_id']  # Prevent duplicate shares

    def __str__(self):
        return f"{self.credential.name} → Employee #{self.employee_id}"