# Generated manually for PasswordActionToken

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0010_emailsettings"),
    ]

    operations = [
        migrations.CreateModel(
            name="PasswordActionToken",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "purpose",
                    models.CharField(
                        choices=[
                            ("reset_otp", "Password reset OTP"),
                            ("reset_session", "Password reset session"),
                            ("setup", "Create password (invite)"),
                        ],
                        max_length=32,
                    ),
                ),
                ("token", models.CharField(db_index=True, max_length=64, unique=True)),
                ("code_hash", models.CharField(blank=True, default="", max_length=128)),
                ("expires_at", models.DateTimeField()),
                ("used_at", models.DateTimeField(blank=True, null=True)),
                ("attempts", models.PositiveSmallIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="password_action_tokens",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "password_action_tokens",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="passwordactiontoken",
            index=models.Index(fields=["user", "purpose"], name="password_ac_user_purpose_idx"),
        ),
    ]
