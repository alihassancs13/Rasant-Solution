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

class JobType(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'job_types'
        ordering = ['name']

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

    is_published = models.BooleanField(default=False)  # "Publish immediately on careers page"

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'job_openings'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.job_title} ({self.department})"