# Historical stub — tables already exist; restores Django migration graph.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name='JiraCredential',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('domain', models.CharField(blank=True, max_length=255, null=True)),
                        ('email', models.CharField(blank=True, max_length=255, null=True)),
                        ('api_token', models.TextField(blank=True, null=True)),
                        ('account_id', models.CharField(blank=True, max_length=255, null=True)),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('auth_user_id', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                    ],
                ),
                migrations.CreateModel(
                    name='Source',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('code', models.CharField(max_length=50, unique=True)),
                        ('name', models.CharField(max_length=100)),
                        ('is_active', models.BooleanField(default=True)),
                        ('is_default', models.BooleanField(default=False)),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                    ],
                    options={'db_table': 'source'},
                ),
            ],
            database_operations=[],
        ),
    ]
