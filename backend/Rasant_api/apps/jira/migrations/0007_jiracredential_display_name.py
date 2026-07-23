from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("jira", "0006_worklogexportsettings"),
    ]

    operations = [
        migrations.AddField(
            model_name="jiracredential",
            name="display_name",
            field=models.CharField(
                blank=True,
                default="",
                help_text="Jira display name / username used in timesheet exports.",
                max_length=255,
            ),
        ),
    ]
