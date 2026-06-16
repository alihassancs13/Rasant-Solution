from django.db import models
from django.contrib.auth.models import AbstractUser

class Role(models.Model): 
    name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'roles'

    def __str__(self):
        return self.name or ''

class User(AbstractUser): 
    email = models.EmailField(max_length=255, blank=True, null=True)  
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,  
        related_name='users',   
        null=True,
        blank=True,
    )

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username

class ContactForm(models.Model):
    full_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(max_length=255, unique=True, blank=True, null=True)
    phone = models.IntegerField(unique=True, null=True, blank=True)
    projectType = models.CharField(max_length=255, null=True, blank=True)
    description = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        db_table = 'contact_form'
    
    def __str__(self):
        return self.full_name