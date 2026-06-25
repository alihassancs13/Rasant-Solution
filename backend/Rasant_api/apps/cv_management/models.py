from django.db import models

def cv_upload_path(instance, filename):
    return f'cvs/{instance.email}/{filename}'

class CVSubmission(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=False)
    phone = models.CharField(max_length=50)
    desired_position = models.CharField(max_length=255)
    cv_file = models.FileField(upload_to=cv_upload_path)
    submitted_at = models.DateTimeField(auto_now_add=True)
    cover_letter = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'cv_submissions'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.full_name} — {self.desired_position}"