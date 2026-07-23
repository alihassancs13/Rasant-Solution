# Generated manually for half-day leave support

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('employeeDashboard', '0016_leave_request'),
    ]

    operations = [
        migrations.AddField(
            model_name='attendance',
            name='is_half_day',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='leaverequest',
            name='is_half_day',
            field=models.BooleanField(
                default=False,
                help_text='When true, leave is for half of a single day (0.5 day).',
            ),
        ),
        migrations.AddField(
            model_name='leaverequest',
            name='half_day_period',
            field=models.CharField(
                blank=True,
                choices=[('morning', 'Morning'), ('afternoon', 'Afternoon')],
                default='',
                help_text='Morning or afternoon when is_half_day is true.',
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name='salarydeductionhistory',
            name='paid_leave_days',
            field=models.DecimalField(decimal_places=1, default=0, max_digits=5),
        ),
        migrations.AlterField(
            model_name='salarydeductionhistory',
            name='unpaid_leave_days',
            field=models.DecimalField(decimal_places=1, default=0, max_digits=5),
        ),
    ]
