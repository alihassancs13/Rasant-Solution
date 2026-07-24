# accounts/urls.py
from django.urls import path
from .views import (
    login_user,
    get_user_modules,
    contact_message_view,
    update_my_avatar,
    get_user_avatar,
    my_profile,
    change_my_password,
    email_settings_view,
    test_email_settings,
    admin_overview_stats,
    password_forgot,
    password_verify_otp,
    password_reset_confirm,
    password_setup_validate,
    password_setup_confirm,
    notification_list,
    notification_mark_read,
    notification_clear,
    get_user_avatar,
    update_inquiry_status,
    send_inquiry_reply,
    get_inquiry_statuses,
    delete_inquiry,
)

urlpatterns = [
    # Authentication
    path('login/', login_user, name='login'),
    path('password/forgot/', password_forgot, name='password-forgot'),
    path('password/verify-otp/', password_verify_otp, name='password-verify-otp'),
    path('password/reset/', password_reset_confirm, name='password-reset'),
    path('password/setup/<str:token>/', password_setup_validate, name='password-setup-validate'),
    path('password/setup/<str:token>/confirm/', password_setup_confirm, name='password-setup-confirm'),
    path('notifications/', notification_list, name='notification-list'),
    path('notifications/mark-read/', notification_mark_read, name='notification-mark-read'),
    path('notifications/clear/', notification_clear, name='notification-clear'),
    path('get_user_modules/', get_user_modules, name='user-modules'),
    path('contact/', contact_message_view, name='contact-message'),
    path('contact/<int:pk>/status/', update_inquiry_status, name='inquiry-status-update'),
    path('contact/<int:pk>/reply/', send_inquiry_reply, name='inquiry-reply'),
    path('inquiry-statuses/', get_inquiry_statuses, name='inquiry-statuses-list'),
    path('contact/<int:pk>/', delete_inquiry, name='inquiry-delete'),


    path('profile/', my_profile, name='my-profile'),
    path('profile/change-password/', change_my_password, name='change-my-password'),
    path('profile/avatar/', update_my_avatar, name='update-my-avatar'),
    path('users/<int:user_id>/avatar/', get_user_avatar, name='get-user-avatar'),

    path('email-settings/', email_settings_view, name='email-settings'),
    path('email-settings/test/', test_email_settings, name='email-settings-test'),
    path('overview-stats/', admin_overview_stats, name='admin-overview-stats'),
]
