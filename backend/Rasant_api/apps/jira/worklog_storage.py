"""Persist and query worklogs (Jira-synced + manual) in the local worklog table."""
from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta, timezone as dt_timezone
from decimal import Decimal

from django.db.models import Q, Sum
from django.utils import timezone

from .models import JiraCredential, Worklog


SECONDS_PER_DAY = Worklog.HOURS_PER_DAY * 3600


def _parse_started(started_str):
    if not started_str:
        return None
    if isinstance(started_str, datetime):
        return started_str if timezone.is_aware(started_str) else timezone.make_aware(started_str)
    try:
        return datetime.strptime(started_str, "%Y-%m-%dT%H:%M:%S.000%z")
    except (TypeError, ValueError):
        try:
            dt = datetime.fromisoformat(str(started_str).replace("Z", "+00:00"))
            if timezone.is_naive(dt):
                dt = timezone.make_aware(dt)
            return dt
        except Exception:
            return None


def seconds_to_hours(seconds) -> float:
    return round((seconds or 0) / 3600, 2)


def hours_to_day_units(hours) -> float:
    """Convert hours to work-day units (8h = 1 day)."""
    return round(float(hours or 0) / Worklog.HOURS_PER_DAY, 2)


def seconds_to_day_units(seconds) -> float:
    return round((seconds or 0) / SECONDS_PER_DAY, 2)


def serialize_worklog_row(row: Worklog) -> dict:
    started = row.started
    ended = row.ended
    date_str = started.date().isoformat() if started else ""
    seconds = int(row.time_spent_seconds or 0)
    hours = seconds / 3600
    # Human timeSpent like Jira ("4h", "30m")
    h = seconds // 3600
    m = (seconds % 3600) // 60
    if h and m:
        time_spent = f"{h}h {m}m"
    elif h:
        time_spent = f"{h}h"
    else:
        time_spent = f"{m}m"

    return {
        "id": row.id,
        "worklog_id": row.worklog_id or str(row.id),
        "issue_key": row.issue_key,
        "issue_id": row.issue_id or "",
        "summary": row.summary or "",
        "time_spent": time_spent,
        "time_spent_seconds": seconds,
        "hours": round(hours, 2),
        "day_units": seconds_to_day_units(seconds),
        "comment": row.comment or "",
        "started": started.isoformat() if started else None,
        "ended": ended.isoformat() if ended else None,
        "date": date_str,
        "source": row.source,
        "is_manual": row.source == Worklog.SOURCE_MANUAL,
    }


def upsert_jira_entry(user, credential: JiraCredential | None, entry: dict) -> Worklog | None:
    worklog_id = str(entry.get("worklog_id") or "").strip()
    if not worklog_id:
        return None

    started = _parse_started(entry.get("started"))
    if not started:
        return None

    ended = _parse_started(entry.get("ended"))
    if not ended:
        seconds = int(entry.get("time_spent_seconds") or 0)
        ended = started + timedelta(seconds=seconds)

    defaults = {
        "user": user,
        "jira_credential": credential,
        "source": Worklog.SOURCE_JIRA,
        "issue_key": entry.get("issue_key") or "UNKNOWN",
        "issue_id": entry.get("issue_id") or "",
        "summary": entry.get("summary") or "",
        "started": started,
        "ended": ended,
        "time_spent_seconds": int(entry.get("time_spent_seconds") or 0),
        "comment": entry.get("comment") or "",
        "created_by": user,
    }

    if credential:
        row, _ = Worklog.objects.update_or_create(
            jira_credential=credential,
            worklog_id=worklog_id,
            defaults=defaults,
        )
    else:
        row, _ = Worklog.objects.update_or_create(
            user=user,
            worklog_id=worklog_id,
            source=Worklog.SOURCE_JIRA,
            defaults=defaults,
        )
    return row


def sync_user_worklogs_from_jira(user, date_from: date, date_to: date) -> tuple[int, str | None]:
    """
    Fetch Jira worklogs for the user in range and upsert into local table.
    Returns (synced_count, error_message_or_None).
    """
    from .services import fetch_worklogs_for_range

    credential = JiraCredential.objects.filter(auth_user_id=user).first()
    if not credential or not credential.domain or not credential.api_token:
        return 0, "Jira is not connected."

    try:
        entries = fetch_worklogs_for_range(user, date_from, date_to)
    except Exception as exc:
        return 0, str(exc)

    count = 0
    for entry in entries:
        if upsert_jira_entry(user, credential, entry):
            count += 1
    return count, None


def create_manual_worklog(
    *,
    user,
    issue_key: str,
    started: datetime,
    ended: datetime,
    comment: str = "",
    summary: str = "",
    created_by=None,
) -> Worklog:
    if ended <= started:
        raise ValueError("End time can not be before the start time.")

    seconds = int((ended - started).total_seconds())
    worklog_id = f"manual-{uuid.uuid4().hex[:16]}"
    credential = JiraCredential.objects.filter(auth_user_id=user).first()

    return Worklog.objects.create(
        user=user,
        jira_credential=credential,
        worklog_id=worklog_id,
        source=Worklog.SOURCE_MANUAL,
        issue_key=(issue_key or "MANUAL").strip()[:100],
        issue_id="",
        summary=(summary or issue_key or "Manual worklog").strip(),
        started=started,
        ended=ended,
        time_spent_seconds=seconds,
        comment=comment or "",
        created_by=created_by or user,
    )


def worklogs_for_user_month(user, year: int, month: int):
    start = date(year, month, 1)
    if month == 12:
        end = date(year + 1, 1, 1)
    else:
        end = date(year, month + 1, 1)

    start_dt = timezone.make_aware(datetime.combine(start, datetime.min.time()))
    end_dt = timezone.make_aware(datetime.combine(end, datetime.min.time()))

    return (
        Worklog.objects.filter(user=user, started__gte=start_dt, started__lt=end_dt)
        .order_by("started")
    )


def group_worklogs_by_date(queryset) -> dict:
    logs_by_date = {}
    for row in queryset:
        payload = serialize_worklog_row(row)
        date_str = payload["date"]
        if not date_str:
            continue
        logs_by_date.setdefault(date_str, []).append(payload)
    return logs_by_date


def worklogs_in_range(date_from: date, date_to: date, user=None):
    start_dt = timezone.make_aware(datetime.combine(date_from, datetime.min.time()))
    end_dt = timezone.make_aware(
        datetime.combine(date_to + timedelta(days=1), datetime.min.time())
    )
    qs = Worklog.objects.filter(started__gte=start_dt, started__lt=end_dt).select_related(
        "user", "jira_credential", "created_by"
    )
    if user is not None:
        qs = qs.filter(user=user)
    return qs.order_by("started")
