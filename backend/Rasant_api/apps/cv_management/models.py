from django.db import models


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