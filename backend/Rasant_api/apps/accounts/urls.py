from django.urls import path
from .views import (
    login_user, get_user_modules,contact_message_view
)
urlpatterns = [
    # Authentication
    path('login/', login_user, name='login'),
    path('get_user_modules/', get_user_modules, name='user-modules'),
    path('contact/', contact_message_view, name='contact-message'),

]