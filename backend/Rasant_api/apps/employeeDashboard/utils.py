import re
from datetime import time


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

    is_night = 'night' in timetable_text.lower()

    if is_night:
        start_hour_24 = (start_hour % 12) + 12   # e.g. 7 -> 19 (7 PM)
        end_hour_24 = end_hour % 12               # e.g. 3 -> 3 (3 AM)
    else:
        start_hour_24 = start_hour % 12            # e.g. 10 -> 10 (10 AM)
        end_hour_24 = (end_hour % 12) + 12          # e.g. 7 -> 19 (7 PM)

    return time(start_hour_24, start_min), time(end_hour_24 % 24, end_min)


def calculate_status(clock_in, clock_out, timetable_text, grace_minutes=25):
    if not clock_in and not clock_out:
        return 'absent'
    if not clock_in or not clock_out:
        return 'present'
    start_time, _ = parse_shift_range(timetable_text)
    if not start_time:
        return 'present'

    from datetime import datetime, timedelta
    cutoff = (
        datetime.combine(datetime.today(), start_time) + timedelta(minutes=grace_minutes)
    ).time()

    return 'late' if clock_in > cutoff else 'present'