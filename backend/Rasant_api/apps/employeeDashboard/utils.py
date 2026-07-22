import re
from datetime import time, datetime, timedelta


def parse_shift_range(timetable_text: str):
    if not timetable_text:
        return None, None

    match = re.search(r'(\d{1,2})(?::(\d{2}))?\s*-\s*(\d{1,2})(?::(\d{2}))?', timetable_text)
    if not match:
        return None, None

    start_hour = int(match.group(1))
    start_min = int(match.group(2) or 0)
    end_hour = int(match.group(3))
    end_min = int(match.group(4) or 0)

    # Daytime shifts only — e.g. "10 - 7" means 10 AM - 7 PM
    start_hour_24 = start_hour % 12
    end_hour_24 = (end_hour % 12) + 12

    return time(start_hour_24, start_min), time(end_hour_24 % 24, end_min)


def calculate_status(clock_in, clock_out, timetable_text, grace_minutes):
    if not clock_in and not clock_out:
        return 'absent'
    if not clock_in or not clock_out:
        return 'present'

    start_time, _ = parse_shift_range(timetable_text)
    if not start_time:
        return 'present'

    cutoff = (
        datetime.combine(datetime.today(), start_time) + timedelta(minutes=grace_minutes)
    ).time()

    return 'late' if clock_in > cutoff else 'present'


def calculate_late_and_overtime(clock_in, clock_out, timetable_text, grace_minutes):
    if not clock_in or not clock_out:
        return None, 0

    start_time, end_time = parse_shift_range(timetable_text)
    if not start_time or not end_time:
        return None, 0

    ref_date = datetime.today().date()

    # ---------- Late minutes ----------
    start_dt = datetime.combine(ref_date, start_time)
    clock_in_dt = datetime.combine(ref_date, clock_in)
    cutoff_dt = start_dt + timedelta(minutes=grace_minutes)

    late_minutes = 0
    if clock_in_dt > cutoff_dt:
        late_minutes = int((clock_in_dt - start_dt).total_seconds() // 60)

    # ---------- Overtime hours ----------
    end_dt = datetime.combine(ref_date, end_time)
    clock_out_dt = datetime.combine(ref_date, clock_out)

    overtime_hours = 0
    if clock_out_dt > end_dt:
        overtime_seconds = (clock_out_dt - end_dt).total_seconds()
        overtime_hours = round(overtime_seconds / 3600, 2)

    return late_minutes, overtime_hours