# Historical stub — ended column already exists.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jira', '0003_worklog'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name='worklog',
                    name='ended',
                    field=models.DateTimeField(blank=True, null=True),
                ),
            ],
            database_operations=[],
        ),
    ]
