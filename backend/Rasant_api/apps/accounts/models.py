from django.contrib.auth.models import AbstractUser
from django.db import models

class Role(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'roles'

    def __str__(self):
        return self.name or ''

class User(AbstractUser):
    email = models.EmailField(max_length=255,unique=True, blank=True, null=True,)
    avatar = models.BinaryField(null=True, blank=True)  
    avatar_content_type = models.CharField(max_length=100, null=True, blank=True)
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        related_name='users',
        null=True,
        blank=True,
    )

    # Add these to avoid conflicts
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username

class Module(models.Model):
    name = models.CharField(max_length=255,)
    icon = models.CharField(max_length=50, blank=True, null=True)
    role = models.ForeignKey(
        'Role',
        on_delete=models.CASCADE,
        related_name='modules'
    )
    link = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'modules'

    def __str__(self):
        return self.name
class ContactMessage(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contact_messages'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} — {self.email}"