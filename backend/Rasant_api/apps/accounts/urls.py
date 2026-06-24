from django.urls import path
from .views import (
    login_user,
)
urlpatterns = [
    # Authentication
    path('login/', login_user, name='login')
]