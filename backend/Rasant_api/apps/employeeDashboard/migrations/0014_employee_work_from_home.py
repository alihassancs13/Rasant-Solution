from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("employeeDashboard", "0013_employment_status_and_bonus"),
    ]

    operations = [
        migrations.AddField(
            model_name="employee",
            name="work_from_home",
            field=models.BooleanField(
                default=False,
                help_text="If true, attendance outside the office radius is labeled Work from home.",
            ),
        ),
    ]
