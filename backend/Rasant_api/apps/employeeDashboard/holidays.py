"""Company holidays: mark attendance + exclude from payroll deductions (with weekends)."""
from __future__ import annotations

from datetime import date

from .models import Attendance, CompanyHoliday, Employee, PayrollSettings


def is_weekend(day: date) -> bool:
    return day.weekday() >= 5  # Sat=5, Sun=6


def holiday_dates_in_range(start: date, end: date) -> set[date]:
    return set(
        CompanyHoliday.objects.filter(date__gte=start, date__lte=end).values_list("date", flat=True)
    )


def is_non_working_day(day: date, holiday_dates: set[date] | None = None) -> bool:
    if is_weekend(day):
        return True
    if holiday_dates is not None:
        return day in holiday_dates
    return CompanyHoliday.objects.filter(date=day).exists()


def apply_holiday_attendance(holiday_date: date) -> int:
    """
    Mark every active employee's attendance for holiday_date as holiday (paid).
    Does not wipe punches if the employee already clocked in that day.
    """
    settings_obj = PayrollSettings.get_settings()
    timetable = settings_obj.default_timetable or "10 - 7"
    employees = Employee.objects.filter(is_active=True)
    marked = 0
    for emp in employees.iterator():
        record, created = Attendance.objects.get_or_create(
            employee=emp,
            date=holiday_date,
            defaults={
                "status": "holiday",
                "is_paid": True,
                "timetable": timetable,
                "clock_in": None,
                "clock_out": None,
                "late_minutes": 0,
                "overtime_hours": 0,
                "is_half_day": False,
            },
        )
        if created:
            marked += 1
            continue
        # Already punched — keep their work day; otherwise force holiday
        if record.clock_in:
            continue
        record.status = "holiday"
        record.is_paid = True
        record.timetable = record.timetable or timetable
        record.late_minutes = 0
        record.overtime_hours = 0
        record.is_half_day = False
        record.save(
            update_fields=[
                "status",
                "is_paid",
                "timetable",
                "late_minutes",
                "overtime_hours",
                "is_half_day",
                "updated_at",
            ]
        )
        marked += 1
    return marked


def clear_holiday_attendance(holiday_date: date) -> int:
    """Revert auto holiday rows that have no punches (so they don't stay stuck as holiday)."""
    qs = Attendance.objects.filter(
        date=holiday_date,
        status="holiday",
        clock_in__isnull=True,
    )
    cleared = qs.count()
    qs.delete()
    return cleared


def countable_absent_qs(records, start: date, end: date):
    """
    Absents that should count toward payroll deductions:
    exclude weekends and company holidays.
    """
    holidays = holiday_dates_in_range(start, end)
    qs = records.filter(status="absent")
    # Exclude Sat/Sun
    qs = qs.exclude(date__week_day__in=[1, 7])  # Django: 1=Sunday, 7=Saturday
    if holidays:
        qs = qs.exclude(date__in=holidays)
    return qs


def countable_late_qs(records, start: date, end: date):
    holidays = holiday_dates_in_range(start, end)
    qs = records.filter(status="late")
    qs = qs.exclude(date__week_day__in=[1, 7])
    if holidays:
        qs = qs.exclude(date__in=holidays)
    return qs
