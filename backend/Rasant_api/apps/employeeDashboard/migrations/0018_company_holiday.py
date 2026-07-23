# Generated for company holidays + attendance holiday status

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('employeeDashboard', '0017_leave_half_day'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='attendance',
            name='status',
            field=models.CharField(
                choices=[
                    ('present', 'Present'),
                    ('late', 'Late'),
                    ('absent', 'Absent'),
                    ('on_leave', 'On leave'),
                    ('holiday', 'Holiday'),
                ],
                default='present',
                max_length=20,
            ),
        ),
        migrations.CreateModel(
            name='CompanyHoliday',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(db_index=True, unique=True)),
                ('name', models.CharField(default='Holiday', max_length=255)),
                ('note', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='company_holidays_created',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'db_table': 'company_holidays',
                'ordering': ['-date'],
            },
        ),
    ]
