# accounts/urls.py
from django.urls import path
from .views import (
    login_user,
    get_user_modules,
    contact_message_view,
    update_my_avatar,
    get_user_avatar
)

urlpatterns = [
    # Authentication
    path('login/', login_user, name='login'),
    path('get_user_modules/', get_user_modules, name='user-modules'),
    path('contact/', contact_message_view, name='contact-message'),

    path('profile/avatar/', update_my_avatar, name='update-my-avatar'),
    path('users/<int:user_id>/avatar/', get_user_avatar, name='get-user-avatar'),
]