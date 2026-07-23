from django.db import migrations, models
import django.db.models.deletion
import datetime


class Migration(migrations.Migration):

    dependencies = [
        ("employeeDashboard", "0014_employee_work_from_home"),
    ]

    operations = [
        migrations.CreateModel(
            name="DailyWorkUpdate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date", models.DateField(default=datetime.date.today)),
                ("note", models.TextField(help_text="What the employee is working on today.")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "employee",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="daily_work_updates",
                        to="employeeDashboard.employee",
                    ),
                ),
            ],
            options={
                "db_table": "daily_work_updates",
                "ordering": ["-updated_at"],
                "unique_together": {("employee", "date")},
            },
        ),
    ]
