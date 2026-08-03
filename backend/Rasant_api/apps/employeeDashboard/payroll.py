"""Payroll / employment-status helpers."""
from __future__ import annotations

import calendar
from datetime import date
from decimal import Decimal

from django.db.models import Sum


def employment_status_name(employee) -> str:
    status = getattr(employee, "status", None)
    if status is None:
        return ""
    return getattr(status, "name", "") or ""


def applies_attendance_payroll_deductions(employee) -> bool:
    """
    Leave / absent / late payroll settings apply only when the linked
    EmploymentStatus has apply_payroll_deductions=True.
    Intern & Probation are seeded with False.
    """
    status = getattr(employee, "status", None)
    if status is None:
        return True
    return bool(getattr(status, "apply_payroll_deductions", True))


def resolve_employment_status(value):
    """Accept status id, code, or display name; return EmploymentStatus or None."""
    from .models import EmploymentStatus

    if value is None or value == "":
        return None
    if hasattr(value, "pk"):
        return value
    try:
        return EmploymentStatus.objects.get(pk=int(value))
    except (TypeError, ValueError, EmploymentStatus.DoesNotExist):
        pass
    text = str(value).strip()
    obj = EmploymentStatus.objects.filter(name__iexact=text).first()
    if obj:
        return obj
    return EmploymentStatus.objects.filter(code__iexact=text).first()


def default_employment_status():
    from .models import EmploymentStatus

    obj = EmploymentStatus.objects.filter(code="draft").first()
    if obj:
        return obj
    return EmploymentStatus.objects.order_by("sort_order", "id").first()


def month_bounds(deduction_month: date):
    days = calendar.monthrange(deduction_month.year, deduction_month.month)[1]
    start = deduction_month.replace(day=1)
    end = deduction_month.replace(day=days)
    return start, end, days


def compute_monthly_attendance_payroll(employee, deduction_month: date, settings_obj):
    """
    Build attendance deduction figures for one calendar month.
    Returns a dict of SalaryDeductionHistory attendance fields.
    """
    from .models import Attendance

    start, end, days_in_month = month_bounds(deduction_month)
    records = Attendance.objects.filter(employee=employee, date__gte=start, date__lte=end)

    present_days = records.filter(status__in=["present", "late"]).count()
    # Full-day leave + half-day leave (0.5 each). Half-day flag survives if they also punch.
    full_leave_days = records.filter(status="on_leave", is_half_day=False).count()
    half_leave_days = records.filter(is_half_day=True).count()
    leave_days = Decimal(full_leave_days) + (Decimal(half_leave_days) * Decimal("0.5"))

    from .holidays import countable_absent_qs, countable_late_qs

    # Absents / lates on weekends & company holidays do not deduct
    absent_days = countable_absent_qs(records, start, end).count()
    late_count = countable_late_qs(records, start, end).count()
    overtime_hours = records.aggregate(total=Sum("overtime_hours")).get("total") or Decimal("0")
    overtime_hours = Decimal(str(overtime_hours))

    apply = applies_attendance_payroll_deductions(employee)
    unpaid_leave_days = Decimal("0")
    unpaid_absent_days = 0
    late_penalty_days = Decimal("0")
    late_penalty_amount = Decimal("0")
    attendance_deduction_total = Decimal("0")
    overtime_rate = Decimal(str(settings_obj.overtime_rate_per_hour or 0))
    overtime_amount = overtime_hours * overtime_rate if apply else Decimal("0")

    gross = Decimal(str(employee.current_salary or employee.salary or 0))
    per_day = (gross / Decimal(days_in_month)) if days_in_month else Decimal("0")
    half_day = per_day / Decimal("2")

    if apply:
        allowed_leaves = Decimal(str(settings_obj.allowed_leaves_per_month or 0))
        allowed_absents = int(settings_obj.allowed_absents_per_month or 0)

        unpaid_leave_days = max(Decimal("0"), leave_days - allowed_leaves)
        unpaid_absent_days = max(0, absent_days - allowed_absents)
        paid_leave_days = leave_days - unpaid_leave_days

        penalty_lates = late_count

        late_penalty_days = Decimal(penalty_lates) * Decimal("0.5")
        late_penalty_amount = late_penalty_days * per_day
        off_days_amount = (unpaid_leave_days + Decimal(unpaid_absent_days)) * per_day
        attendance_deduction_total = off_days_amount + late_penalty_amount
    else:
        paid_leave_days = leave_days

    return {
        "total_days": days_in_month,
        "present_days": present_days,
        "paid_leave_days": paid_leave_days,
        "unpaid_leave_days": unpaid_leave_days,
        "unpaid_absent_days": unpaid_absent_days,
        "late_count": late_count,
        "late_penalty_days": late_penalty_days,
        "late_penalty_amount": late_penalty_amount,
        "overtime_hours": overtime_hours,
        "overtime_rate_applied": overtime_rate if apply else Decimal("0"),
        "overtime_amount": overtime_amount,
        "per_day_salary": per_day,
        "half_day_salary": half_day,
        "base_salary": gross,
        "attendance_deduction_total": attendance_deduction_total,
        "attendance_synced": True,
        "payroll_deductions_applied": apply,
    }