# Generated manually for employee self check-in geolocation

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('employeeDashboard', '0011_salarydeductionhistory_attendance_synced'),
    ]

    operations = [
        migrations.AddField(
            model_name='payrollsettings',
            name='default_timetable',
            field=models.CharField(
                default='10 - 7',
                help_text='Shift used for employee self check-in (e.g. "10 - 7")',
                max_length=50,
            ),
        ),
        migrations.AddField(
            model_name='payrollsettings',
            name='office_latitude',
            field=models.DecimalField(blank=True, decimal_places=7, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='payrollsettings',
            name='office_longitude',
            field=models.DecimalField(blank=True, decimal_places=7, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='payrollsettings',
            name='office_radius_meters',
            field=models.PositiveIntegerField(
                default=150,
                help_text='Distance from office pin within which check-in counts as In Office',
            ),
        ),
        migrations.AddField(
            model_name='payrollsettings',
            name='office_address',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AddField(
            model_name='payrollsettings',
            name='office_set_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='attendance',
            name='check_in_latitude',
            field=models.DecimalField(blank=True, decimal_places=7, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='attendance',
            name='check_in_longitude',
            field=models.DecimalField(blank=True, decimal_places=7, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='attendance',
            name='check_in_address',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AddField(
            model_name='attendance',
            name='check_in_in_office',
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='attendance',
            name='check_in_distance_meters',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='attendance',
            name='check_out_latitude',
            field=models.DecimalField(blank=True, decimal_places=7, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='attendance',
            name='check_out_longitude',
            field=models.DecimalField(blank=True, decimal_places=7, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='attendance',
            name='check_out_address',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AddField(
            model_name='attendance',
            name='check_out_in_office',
            field=models.BooleanField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='attendance',
            name='check_out_distance_meters',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
