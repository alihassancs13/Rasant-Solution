from django.urls import path
from . import views

urlpatterns = [
    # Individual APIs
    path('create/', views.create_credential, name='create_credential'),
    path('get_all_credentials/', views.get_all_credentials, name='create_credential'),
    ]