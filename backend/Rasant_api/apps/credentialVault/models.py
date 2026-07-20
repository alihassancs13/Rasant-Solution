from django.db import models

# Create your models here.
from django.db import models

class CredentialStore(models.Model):
    name = models.CharField(max_length=200, help_text="Credential/Label name")
    link = models.URLField(max_length=500, blank=True, null=True, help_text="URL/Link for the service")
    username = models.CharField(max_length=200, help_text="Username")
    email = models.EmailField(max_length=254, blank=True, null=True, help_text="Email address")
    password = models.CharField(max_length=500, help_text="Password")
    created_at = models.DateTimeField(auto_now_add=True, help_text="Created date/time")

    class Meta:
        db_table = 'credential_store'
        verbose_name = 'Credential'
        verbose_name_plural = 'Credentials'
        ordering = ['-created_at']

    def __str__(self):
        return self.name