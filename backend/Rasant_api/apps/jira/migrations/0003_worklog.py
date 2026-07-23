# Historical stub — worklog table already exists.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('jira', '0002_auto_20260703_1745'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name='JiraTask',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('issue_key', models.CharField(max_length=100)),
                        ('summary', models.TextField()),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='chatbot_tickets', to=settings.AUTH_USER_MODEL)),
                        ('jira_credential', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='jira_tasks', to='jira.jiracredential')),
                        ('source', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='tasks', to='jira.source')),
                    ],
                    options={'db_table': 'jira_tasks', 'ordering': ['-created_at']},
                ),
                migrations.CreateModel(
                    name='Worklog',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('worklog_id', models.CharField(max_length=100)),
                        ('issue_key', models.CharField(max_length=100)),
                        ('issue_id', models.CharField(blank=True, max_length=100, null=True)),
                        ('summary', models.TextField(blank=True, null=True)),
                        ('started', models.DateTimeField()),
                        ('time_spent_seconds', models.PositiveIntegerField()),
                        ('comment', models.TextField(blank=True, null=True)),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('updated_at', models.DateTimeField(auto_now=True)),
                        ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_worklogs', to=settings.AUTH_USER_MODEL)),
                        ('jira_credential', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='worklogs', to='jira.jiracredential')),
                    ],
                    options={
                        'db_table': 'worklog',
                        'ordering': ['-started'],
                        'unique_together': {('jira_credential', 'worklog_id')},
                    },
                ),
            ],
            database_operations=[],
        ),
    ]
