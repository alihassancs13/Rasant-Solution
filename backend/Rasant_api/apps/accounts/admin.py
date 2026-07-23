from django.apps import apps
from django.contrib import admin

EmailSettings = apps.get_model('accounts', 'EmailSettings')


@admin.register(EmailSettings)
class EmailSettingsAdmin(admin.ModelAdmin):
    list_display = ('smtp_host', 'smtp_port', 'smtp_username', 'from_email', 'is_active', 'updated_at')
    readonly_fields = ('updated_at', 'last_increment_digest_sent')
