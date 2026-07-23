# Local worklog storage: source + user owner, nullable Jira credential for manual rows.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def backfill_user_and_source(apps, schema_editor):
    Worklog = apps.get_model('jira', 'Worklog')
    for row in Worklog.objects.select_related('jira_credential').iterator():
        changed = False
        if not row.source:
            row.source = 'jira'
            changed = True
        if row.user_id is None and row.jira_credential_id:
            cred = row.jira_credential
            if cred and cred.auth_user_id_id:
                row.user_id = cred.auth_user_id_id
                changed = True
        if changed:
            row.save(update_fields=['source', 'user_id', 'updated_at'])


class Migration(migrations.Migration):

    dependencies = [
        ('jira', '0004_worklog_ended'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='worklog',
            name='source',
            field=models.CharField(
                choices=[('jira', 'Jira'), ('manual', 'Manual')],
                db_index=True,
                default='jira',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='worklog',
            name='user',
            field=models.ForeignKey(
                blank=True,
                help_text='Owner of this worklog (employee / admin user).',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='owned_worklogs',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name='worklog',
            name='jira_credential',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='worklogs',
                to='jira.jiracredential',
            ),
        ),
        migrations.AlterField(
            model_name='worklog',
            name='worklog_id',
            field=models.CharField(
                blank=True,
                default='',
                help_text='Jira worklog id, or generated id for manual entries.',
                max_length=100,
            ),
        ),
        migrations.AlterUniqueTogether(
            name='worklog',
            unique_together=set(),
        ),
        migrations.AddIndex(
            model_name='worklog',
            index=models.Index(fields=['user', 'started'], name='worklog_user_started_idx'),
        ),
        migrations.AddIndex(
            model_name='worklog',
            index=models.Index(fields=['source', 'started'], name='worklog_source_started_idx'),
        ),
        migrations.RunPython(backfill_user_and_source, migrations.RunPython.noop),
    ]
