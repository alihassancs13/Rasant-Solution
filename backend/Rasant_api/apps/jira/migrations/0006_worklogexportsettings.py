from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("jira", "0005_worklog_local_storage"),
    ]

    operations = [
        migrations.CreateModel(
            name="WorklogExportSettings",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("project_name", models.CharField(default="CSM-MOVE", max_length=255)),
                ("project_number", models.CharField(default="10501273/004800", max_length=255)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "worklog_export_settings",
                "verbose_name": "Worklog Export Settings",
                "verbose_name_plural": "Worklog Export Settings",
            },
        ),
    ]
