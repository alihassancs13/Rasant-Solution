from django.urls import path
from . import views

urlpatterns = [
    # Individual APIs
    path('create/', views.create_credential, name='create_credential'),
    path('get_all_credentials/', views.get_all_credentials, name='create_credential'),
    path('share_credentials/', views.share_credential, name='share_credential'),
    path('get_credentials/<int:employee_id>/', views.get_employee_credentials, name='get_employee_credentials'),
    ]