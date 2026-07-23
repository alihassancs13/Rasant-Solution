# Generated manually for employment_status FK + monthly bonus

from django.db import migrations, models
import django.db.models.deletion


DEFAULT_STATUSES = [
    ("Intern", "intern", False, 1),
    ("Probation", "probation", False, 2),
    ("Contract", "contract", True, 3),
    ("Permanent", "permanent", True, 4),
]


def seed_and_map_statuses(apps, schema_editor):
    EmploymentStatus = apps.get_model("employeeDashboard", "EmploymentStatus")
    Employee = apps.get_model("employeeDashboard", "Employee")

    by_name = {}
    for name, code, apply_deductions, sort_order in DEFAULT_STATUSES:
        obj, _ = EmploymentStatus.objects.get_or_create(
            code=code,
            defaults={
                "name": name,
                "apply_payroll_deductions": apply_deductions,
                "sort_order": sort_order,
                "is_active": True,
            },
        )
        by_name[name.lower()] = obj

    intern = by_name["intern"]
    for emp in Employee.objects.all():
        legacy = (getattr(emp, "status_legacy", None) or "Intern").strip()
        emp.status = by_name.get(legacy.lower(), intern)
        emp.save(update_fields=["status"])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("employeeDashboard", "0012_attendance_geolocation_office"),
    ]

    operations = [
        migrations.CreateModel(
            name="EmploymentStatus",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=50, unique=True)),
                ("code", models.SlugField(unique=True)),
                (
                    "apply_payroll_deductions",
                    models.BooleanField(
                        default=True,
                        help_text="If false, leave/absent/late payroll settings do not apply (e.g. Intern, Probation).",
                    ),
                ),
                ("sort_order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "verbose_name": "Employment Status",
                "verbose_name_plural": "Employment Statuses",
                "db_table": "employment_status",
                "ordering": ["sort_order", "id"],
            },
        ),
        migrations.RenameField(
            model_name="employee",
            old_name="status",
            new_name="status_legacy",
        ),
        migrations.AddField(
            model_name="employee",
            name="status",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="employees",
                to="employeeDashboard.employmentstatus",
            ),
        ),
        migrations.AddField(
            model_name="salarydeductionhistory",
            name="bonus_amount",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.RunPython(seed_and_map_statuses, noop_reverse),
        migrations.RemoveField(
            model_name="employee",
            name="status_legacy",
        ),
        migrations.AlterUniqueTogether(
            name="salarydeductionhistory",
            unique_together={("employee", "deduction_month")},
        ),
    ]
