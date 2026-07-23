"""Admin worklog analytics — local DB (Jira-synced + manual), 8h = 1 day."""
from __future__ import annotations

from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date, datetime, timezone
from io import BytesIO
import calendar

from django.http import HttpResponse
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side

from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import JiraCredential, Worklog, WorklogExportSettings
from .worklog_storage import (
    seconds_to_day_units,
    seconds_to_hours,
    serialize_worklog_row,
    sync_user_worklogs_from_jira,
    worklogs_in_range,
)


HOURS_PER_DAY = Worklog.HOURS_PER_DAY
THIN_BORDER = Border(
    left=Side(style="thin", color="D9E2F2"),
    right=Side(style="thin", color="D9E2F2"),
    top=Side(style="thin", color="D9E2F2"),
    bottom=Side(style="thin", color="D9E2F2"),
)


def _is_admin_user(user):
    role_name = (user.role.name if getattr(user, "role", None) else "") or ""
    return role_name.lower() in ("admin", "administrator") or user.is_superuser or user.is_staff


def _parse_analytics_range(request):
    today = datetime.now(timezone.utc).date()
    default_from = today.replace(day=1)
    date_from_raw = request.query_params.get("from") or request.query_params.get("date_from")
    date_to_raw = request.query_params.get("to") or request.query_params.get("date_to")
    try:
        date_from = datetime.strptime(date_from_raw, "%Y-%m-%d").date() if date_from_raw else default_from
    except ValueError:
        date_from = default_from
    try:
        date_to = datetime.strptime(date_to_raw, "%Y-%m-%d").date() if date_to_raw else today
    except ValueError:
        date_to = today
    if date_to < date_from:
        date_from, date_to = date_to, date_from
    return date_from, date_to


def _month_bounds_for_export(request):
    today = datetime.now(timezone.utc).date()
    month_raw = request.query_params.get("month")
    ref_raw = request.query_params.get("from") or request.query_params.get("date_from")
    target = today
    if month_raw:
        try:
            target = datetime.strptime(month_raw, "%Y-%m").date()
        except ValueError:
            target = today
    elif ref_raw:
        try:
            target = datetime.strptime(ref_raw, "%Y-%m-%d").date()
        except ValueError:
            target = today
    first = target.replace(day=1)
    last = target.replace(day=calendar.monthrange(target.year, target.month)[1])
    return first, last


def _owner_from_user(user, employee=None, cred=None):
    name = None
    email = (cred.email if cred else None) or (user.email if user else "")
    if employee:
        name = employee.name or name
        email = employee.email or email
    if user and not name:
        name = f"{user.first_name} {user.last_name}".strip() or user.username
    return {
        "user_id": user.id if user else None,
        "employee_id": employee.id if employee else None,
        "name": name or email or "Unknown",
        "email": email or "",
        "department": employee.department if employee else "",
        "designation": employee.designation if employee else "",
        "is_active": employee.is_active if employee else (user.is_active if user else True),
    }


def _sync_all_jira_for_range(date_from, date_to):
    """Best-effort sync of every connected Jira account into the local table."""
    creds = list(
        JiraCredential.objects.select_related("auth_user_id")
        .exclude(domain__isnull=True)
        .exclude(domain="")
        .exclude(api_token__isnull=True)
        .exclude(api_token="")
    )
    errors = []

    def _one(cred):
        from django.db import close_old_connections
        close_old_connections()
        user = cred.auth_user_id
        if not user:
            return None
        count, err = sync_user_worklogs_from_jira(user, date_from, date_to)
        return {"user_id": user.id, "synced": count, "error": err}

    max_workers = min(8, max(len(creds), 1))
    with ThreadPoolExecutor(max_workers=max_workers) as pool:
        futures = [pool.submit(_one, c) for c in creds]
        for fut in as_completed(futures):
            try:
                result = fut.result()
            except Exception as exc:
                errors.append({"error": str(exc)})
                continue
            if result and result.get("error"):
                errors.append(result)
    return errors


def _week_bucket(day: date) -> str:
    if day.day <= 7:
        return "W1"
    if day.day <= 14:
        return "W2"
    if day.day <= 21:
        return "W3"
    if day.day <= 28:
        return "W4"
    return "W5"


def _hours(value) -> float:
    return round((int(value or 0) / 3600), 3)


def _clip(text, limit=60):
    value = " ".join(str(text or "").split())
    if len(value) <= limit:
        return value
    return value[: max(limit - 1, 0)].rstrip() + "…"


def _autosize(ws, widths: dict[str, int]):
    for col, width in widths.items():
        ws.column_dimensions[col].width = width


def _style_cell(cell, *, fill=None, bold=False, color="1F2937", align="left", size=10):
    cell.font = Font(bold=bold, color=color, size=size, name="Calibri")
    cell.alignment = Alignment(horizontal=align, vertical="center", wrap_text=False)
    cell.border = THIN_BORDER
    if fill:
        cell.fill = PatternFill("solid", fgColor=fill)


def _fetch_jira_display_name(cred: JiraCredential) -> str:
    """Best-effort fetch of Jira displayName; persists when found."""
    if not cred or not cred.domain or not cred.email or not cred.api_token:
        return (cred.display_name if cred else "") or ""
    if cred.display_name:
        return cred.display_name
    try:
        import requests
        from .services import get_jira_headers

        domain, headers = get_jira_headers(cred.email, cred.api_token, cred.domain)
        r = requests.get(f"{domain}/rest/api/3/myself", headers=headers, timeout=8)
        if r.status_code == 200:
            name = (r.json().get("displayName") or "").strip()
            if name:
                JiraCredential.objects.filter(pk=cred.pk).update(display_name=name)
                cred.display_name = name
                return name
    except Exception:
        pass
    return ""


def _resolve_export_names(rows):
    """
    Map user_id -> Jira display name (preferred) for Responsible / Employee columns.
    Falls back to employee name / system name / email.
    """
    from employeeDashboard.models import Employee

    user_ids = {r.user_id for r in rows if r.user_id}
    employees = {
        e.user_id: e
        for e in Employee.objects.filter(user_id__in=user_ids)
    }
    creds = {
        c.auth_user_id_id: c
        for c in JiraCredential.objects.filter(auth_user_id_id__in=user_ids)
    }

    # Refresh missing Jira display names in parallel
    missing = [c for c in creds.values() if not (c.display_name or "").strip()]
    if missing:
        with ThreadPoolExecutor(max_workers=min(8, max(len(missing), 1))) as pool:
            list(pool.map(_fetch_jira_display_name, missing))

    names = {}
    for uid in user_ids:
        cred = creds.get(uid)
        emp = employees.get(uid)
        jira_name = (cred.display_name if cred else "") or ""
        emp_name = (emp.name if emp else "") or ""
        # Prefer Jira username/display name for the sheet
        names[uid] = jira_name or emp_name or (cred.email if cred else "") or "Unknown"
    return names


def _build_worklog_export_workbook(*, settings_obj, rows, date_from, date_to):
    """
    Compact review-friendly workbook:
      1) Summary  — project + employee weekly totals (W1..W5 + MD)
      2) Month Grid — one row per employee, columns = day numbers
      3) Tickets   — aggregated ticket hours (not every daily line)
    """
    wb = Workbook()
    summary_ws = wb.active
    summary_ws.title = "Summary"
    grid_ws = wb.create_sheet("Month Grid")
    tickets_ws = wb.create_sheet("Tickets")

    month_label = date_from.strftime("%B %Y")
    project_name = settings_obj.project_name or "Project"
    project_number = settings_obj.project_number or "—"
    week_keys = ["W1", "W2", "W3", "W4", "W5"]
    days_in_month = calendar.monthrange(date_from.year, date_from.month)[1]
    name_by_user = _resolve_export_names(rows)

    project_totals = {k: 0.0 for k in week_keys}
    employee_week = defaultdict(lambda: {k: 0.0 for k in week_keys + ["MD"]})
    employee_day = defaultdict(lambda: defaultdict(float))
    tickets = {}

    for row in rows:
        user = row.user
        day = row.started.date() if row.started else None
        if not user or not day:
            continue
        employee_name = name_by_user.get(user.id) or (
            f"{user.first_name} {user.last_name}".strip()
            or getattr(user, "username", "")
            or "Unknown"
        )
        hours = _hours(row.time_spent_seconds)
        week_key = _week_bucket(day)

        project_totals[week_key] += hours
        employee_week[employee_name][week_key] += hours
        employee_week[employee_name]["MD"] += hours
        employee_day[employee_name][day.day] += hours

        ticket_key = (row.issue_key or "—", employee_name)
        if ticket_key not in tickets:
            tickets[ticket_key] = {
                "ticket_no": row.issue_key or "—",
                "description": _clip(row.summary, 70),
                "responsible": employee_name,
                "hours": 0.0,
            }
        tickets[ticket_key]["hours"] += hours
        if row.summary and not tickets[ticket_key]["description"]:
            tickets[ticket_key]["description"] = _clip(row.summary, 70)

    employee_names = sorted(employee_week.keys())
    project_md = round(sum(project_totals.values()), 3)

    # ─── Summary ─────────────────────────────────────────────────────
    summary_ws.merge_cells("A1:H1")
    summary_ws["A1"] = f"Timesheet Summary — {month_label}"
    summary_ws["A1"].font = Font(bold=True, size=13, color="FFFFFF", name="Calibri")
    summary_ws["A1"].fill = PatternFill("solid", fgColor="1E3A5F")
    summary_ws["A1"].alignment = Alignment(horizontal="left", vertical="center")
    summary_ws.row_dimensions[1].height = 22

    summary_ws.merge_cells("A2:H2")
    summary_ws["A2"] = f"Project: {project_name}   |   Project No: {project_number}"
    summary_ws["A2"].font = Font(bold=True, size=10, color="1E3A5F", name="Calibri")
    summary_ws["A2"].fill = PatternFill("solid", fgColor="EAF3FF")
    summary_ws.row_dimensions[2].height = 18

    for idx, label in enumerate(["Project", "Project No."] + week_keys + ["MD"], start=1):
        _style_cell(summary_ws.cell(4, idx, label), fill="DCEBFF", bold=True, color="1E3A5F", align="center")

    for idx, value in enumerate(
        [project_name, project_number] + [round(project_totals[k], 3) for k in week_keys] + [project_md],
        start=1,
    ):
        _style_cell(
            summary_ws.cell(5, idx, value),
            fill="F8FBFF",
            bold=idx <= 2,
            align="center" if idx >= 3 else "left",
        )

    for idx in range(1, 9):
        cell = summary_ws.cell(6, idx)
        if idx == 1:
            cell.value = "Total"
        elif idx == 8:
            cell.value = project_md
        elif idx >= 3:
            cell.value = round(project_totals[week_keys[idx - 3]], 3)
        _style_cell(cell, fill="E8F3E8", bold=True, color="14532D", align="center" if idx >= 3 else "left")

    for idx, label in enumerate(["Employee"] + week_keys + ["MD"], start=1):
        _style_cell(summary_ws.cell(8, idx, label), fill="DCEBFF", bold=True, color="1E3A5F", align="center")

    r = 9
    week_running = {k: 0.0 for k in week_keys + ["MD"]}
    for name in employee_names:
        vals = employee_week[name]
        for k in week_running:
            week_running[k] += vals[k]
        row_vals = [name] + [round(vals[k], 3) for k in week_keys] + [round(vals["MD"], 3)]
        fill = "FFFFFF" if r % 2 else "F8FBFF"
        for idx, value in enumerate(row_vals, start=1):
            _style_cell(summary_ws.cell(r, idx, value), fill=fill, align="center" if idx >= 2 else "left")
        summary_ws.row_dimensions[r].height = 16
        r += 1

    total_vals = ["Total"] + [round(week_running[k], 3) for k in week_keys] + [round(week_running["MD"], 3)]
    for idx, value in enumerate(total_vals, start=1):
        _style_cell(
            summary_ws.cell(r, idx, value),
            fill="E8F3E8",
            bold=True,
            color="14532D",
            align="center" if idx >= 2 else "left",
        )

    _autosize(summary_ws, {"A": 28, "B": 18, "C": 8, "D": 8, "E": 8, "F": 8, "G": 8, "H": 9})
    summary_ws.freeze_panes = "A4"
    summary_ws.page_setup.orientation = "landscape"
    summary_ws.page_setup.fitToPage = True
    summary_ws.page_setup.fitToWidth = 1
    summary_ws.page_setup.fitToHeight = 1

    # ─── Month Grid (1 row per employee) ─────────────────────────────
    last_col = days_in_month + 2
    grid_ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=last_col)
    grid_ws["A1"] = f"Monthly Hours Grid — {month_label}  ·  {project_name} ({project_number})"
    grid_ws["A1"].font = Font(bold=True, size=12, color="FFFFFF", name="Calibri")
    grid_ws["A1"].fill = PatternFill("solid", fgColor="1E3A5F")
    grid_ws["A1"].alignment = Alignment(horizontal="left", vertical="center")
    grid_ws.row_dimensions[1].height = 22

    _style_cell(grid_ws.cell(2, 1, "Employee"), fill="DCEBFF", bold=True, color="1E3A5F", align="center")
    for day_num in range(1, days_in_month + 1):
        d = date(date_from.year, date_from.month, day_num)
        weekend = d.weekday() >= 5
        _style_cell(
            grid_ws.cell(2, day_num + 1, day_num),
            fill="F3E8FF" if weekend else "DCEBFF",
            bold=True,
            color="1E3A5F",
            align="center",
            size=9,
        )
    _style_cell(grid_ws.cell(2, last_col, "Total"), fill="DCEBFF", bold=True, color="1E3A5F", align="center")

    day_column_totals = {d: 0.0 for d in range(1, days_in_month + 1)}
    r = 3
    for name in employee_names:
        fill = "FFFFFF" if r % 2 else "F8FBFF"
        _style_cell(grid_ws.cell(r, 1, name), fill=fill, bold=True, align="left", size=9)
        row_total = 0.0
        for day_num in range(1, days_in_month + 1):
            h = round(employee_day[name].get(day_num, 0.0), 3)
            row_total += h
            day_column_totals[day_num] += h
            d = date(date_from.year, date_from.month, day_num)
            weekend = d.weekday() >= 5
            if h:
                cell_fill = "F5F0FF" if weekend else "EEF6FF"
            else:
                cell_fill = "F8F5FF" if weekend else fill
            cell = grid_ws.cell(r, day_num + 1, h if h else "")
            _style_cell(cell, fill=cell_fill, align="center", size=8)
        _style_cell(
            grid_ws.cell(r, last_col, round(row_total, 3)),
            fill="E8F3E8",
            bold=True,
            color="14532D",
            align="center",
            size=9,
        )
        grid_ws.row_dimensions[r].height = 15
        r += 1

    _style_cell(grid_ws.cell(r, 1, "Total"), fill="E8F3E8", bold=True, color="14532D", align="left", size=9)
    grand = 0.0
    for day_num in range(1, days_in_month + 1):
        h = round(day_column_totals[day_num], 3)
        grand += h
        _style_cell(
            grid_ws.cell(r, day_num + 1, h if h else ""),
            fill="E8F3E8",
            bold=True,
            color="14532D",
            align="center",
            size=8,
        )
    _style_cell(
        grid_ws.cell(r, last_col, round(grand, 3)),
        fill="C8E6C9",
        bold=True,
        color="14532D",
        align="center",
        size=9,
    )

    grid_ws.column_dimensions["A"].width = 24
    for day_num in range(1, days_in_month + 1):
        grid_ws.column_dimensions[grid_ws.cell(2, day_num + 1).column_letter].width = 3.6
    grid_ws.column_dimensions[grid_ws.cell(2, last_col).column_letter].width = 8
    grid_ws.freeze_panes = "B3"
    grid_ws.page_setup.orientation = "landscape"
    grid_ws.page_setup.fitToPage = True
    grid_ws.page_setup.fitToWidth = 1
    grid_ws.page_setup.fitToHeight = 1
    grid_ws.print_title_rows = "1:2"
    grid_ws.print_title_cols = "A:A"

    # ─── Tickets (aggregated) ────────────────────────────────────────
    tickets_ws.merge_cells("A1:D1")
    tickets_ws["A1"] = f"Ticket Summary — {month_label}  ·  {project_name} ({project_number})"
    tickets_ws["A1"].font = Font(bold=True, size=12, color="FFFFFF", name="Calibri")
    tickets_ws["A1"].fill = PatternFill("solid", fgColor="1E3A5F")
    tickets_ws["A1"].alignment = Alignment(horizontal="left", vertical="center")
    tickets_ws.row_dimensions[1].height = 22

    for idx, label in enumerate(["Ticket no.", "Ticket Description", "No. of hours", "Responsible"], start=1):
        _style_cell(tickets_ws.cell(2, idx, label), fill="DCEBFF", bold=True, color="1E3A5F", align="center")

    ticket_rows = sorted(tickets.values(), key=lambda t: (-t["hours"], t["ticket_no"], t["responsible"]))
    r = 3
    ticket_hours_total = 0.0
    for item in ticket_rows:
        fill = "FFFFFF" if r % 2 else "F8FBFF"
        hours = round(item["hours"], 3)
        ticket_hours_total += hours
        values = [item["ticket_no"], item["description"], hours, item["responsible"]]
        for idx, value in enumerate(values, start=1):
            _style_cell(
                tickets_ws.cell(r, idx, value),
                fill=fill,
                align="center" if idx == 3 else "left",
                size=9,
            )
        tickets_ws.row_dimensions[r].height = 15
        r += 1

    for idx in range(1, 5):
        cell = tickets_ws.cell(r, idx)
        if idx == 1:
            cell.value = "Total"
        elif idx == 3:
            cell.value = round(ticket_hours_total, 3)
        _style_cell(cell, fill="E8F3E8", bold=True, color="14532D", align="center" if idx == 3 else "left")

    _autosize(tickets_ws, {"A": 14, "B": 42, "C": 12, "D": 24})
    tickets_ws.freeze_panes = "A3"
    tickets_ws.auto_filter.ref = f"A2:D{max(tickets_ws.max_row, 2)}"
    tickets_ws.page_setup.orientation = "landscape"
    tickets_ws.page_setup.fitToPage = True
    tickets_ws.page_setup.fitToWidth = 1
    tickets_ws.page_setup.fitToHeight = 0

    return wb


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def worklog_analytics_overview(request):
    if not _is_admin_user(request.user):
        return Response({"success": False, "message": "Admin access required."}, status=403)

    from employeeDashboard.models import Employee

    date_from, date_to = _parse_analytics_range(request)
    fetch_errors = _sync_all_jira_for_range(date_from, date_to)

    User = get_user_model()
    rows = list(worklogs_in_range(date_from, date_to).select_related("user", "jira_credential"))

    user_ids = {r.user_id for r in rows if r.user_id}
    # Also include users who only have credentials (zero after sync still ok to skip)
    employees = {
        e.user_id: e
        for e in Employee.objects.filter(user_id__in=user_ids)
    }
    users = {u.id: u for u in User.objects.filter(id__in=user_ids)}

    by_employee = {}
    daily = defaultdict(lambda: {"seconds": 0, "entries": 0})
    issues = defaultdict(lambda: {"seconds": 0, "entries": 0, "summary": ""})
    total_seconds = 0
    entry_count = 0

    for row in rows:
        user = row.user or users.get(row.user_id)
        if not user:
            continue
        key = user.id
        if key not in by_employee:
            by_employee[key] = {
                **_owner_from_user(user, employees.get(key), row.jira_credential),
                "total_seconds": 0,
                "entries": 0,
                "issues": set(),
                "days": set(),
                "manual_entries": 0,
                "jira_entries": 0,
            }

        bucket = by_employee[key]
        secs = int(row.time_spent_seconds or 0)
        day = row.started.date().isoformat() if row.started else ""
        issue_key = row.issue_key or "—"

        bucket["total_seconds"] += secs
        bucket["entries"] += 1
        bucket["issues"].add(issue_key)
        if day:
            bucket["days"].add(day)
        if row.source == Worklog.SOURCE_MANUAL:
            bucket["manual_entries"] += 1
        else:
            bucket["jira_entries"] += 1

        total_seconds += secs
        entry_count += 1
        if day:
            daily[day]["seconds"] += secs
            daily[day]["entries"] += 1
        issues[issue_key]["seconds"] += secs
        issues[issue_key]["entries"] += 1
        if row.summary:
            issues[issue_key]["summary"] = row.summary

    employees_out = []
    for row in by_employee.values():
        if row["entries"] == 0:
            continue
        hours = seconds_to_hours(row["total_seconds"])
        employees_out.append({
            "user_id": row["user_id"],
            "employee_id": row["employee_id"],
            "name": row["name"],
            "email": row["email"],
            "department": row["department"],
            "designation": row["designation"],
            "is_active": row["is_active"],
            "total_seconds": row["total_seconds"],
            "total_hours": hours,
            "day_units": seconds_to_day_units(row["total_seconds"]),
            "hours_per_day": HOURS_PER_DAY,
            "entries": row["entries"],
            "manual_entries": row["manual_entries"],
            "jira_entries": row["jira_entries"],
            "unique_issues": len(row["issues"]),
            "days_logged": len(row["days"]),
            "days": seconds_to_day_units(row["total_seconds"]),
        })
    employees_out.sort(key=lambda x: x["total_seconds"], reverse=True)

    day_span = max((date_to - date_from).days + 1, 1)
    daily_trend = [
        {
            "date": d,
            "seconds": v["seconds"],
            "hours": seconds_to_hours(v["seconds"]),
            "day_units": seconds_to_day_units(v["seconds"]),
            "entries": v["entries"],
        }
        for d, v in sorted(daily.items())
    ]

    top_issues = sorted(
        [
            {
                "issue_key": k,
                "summary": v["summary"] or "",
                "seconds": v["seconds"],
                "hours": seconds_to_hours(v["seconds"]),
                "entries": v["entries"],
            }
            for k, v in issues.items()
        ],
        key=lambda x: x["seconds"],
        reverse=True,
    )[:10]

    return Response({
        "success": True,
        "data": {
            "range": {"from": date_from.isoformat(), "to": date_to.isoformat()},
            "source": "database",
            "hours_per_day": HOURS_PER_DAY,
            "summary": {
                "total_seconds": total_seconds,
                "total_hours": seconds_to_hours(total_seconds),
                "total_day_units": seconds_to_day_units(total_seconds),
                "total_entries": entry_count,
                "unique_issues": len(issues),
                "active_loggers": len(employees_out),
                "avg_hours_per_day": seconds_to_hours(total_seconds / day_span),
            },
            "by_employee": employees_out,
            "daily_trend": daily_trend,
            "top_issues": top_issues,
            "fetch_errors": fetch_errors[:20],
        },
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def worklog_analytics_employee(request, user_id):
    if not _is_admin_user(request.user):
        return Response({"success": False, "message": "Admin access required."}, status=403)

    from employeeDashboard.models import Employee

    User = get_user_model()
    try:
        target_user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return Response({"success": False, "message": "User not found."}, status=404)

    date_from, date_to = _parse_analytics_range(request)

    # Sync this user's Jira into DB when possible
    sync_error = None
    try:
        _, sync_error = sync_user_worklogs_from_jira(target_user, date_from, date_to)
    except Exception as exc:
        sync_error = str(exc)

    employee = Employee.objects.filter(user=target_user).first()
    cred = JiraCredential.objects.filter(auth_user_id=target_user).first()
    owner = _owner_from_user(target_user, employee, cred)

    rows = list(worklogs_in_range(date_from, date_to, user=target_user))
    total_seconds = sum(int(r.time_spent_seconds or 0) for r in rows)
    days = {r.started.date().isoformat() for r in rows if r.started}
    issues = {r.issue_key for r in rows if r.issue_key}

    entries_out = [serialize_worklog_row(r) for r in rows]

    return Response({
        "success": True,
        "data": {
            "range": {"from": date_from.isoformat(), "to": date_to.isoformat()},
            "source": "database",
            "hours_per_day": HOURS_PER_DAY,
            "employee": owner,
            "summary": {
                "total_seconds": total_seconds,
                "total_hours": seconds_to_hours(total_seconds),
                "day_units": seconds_to_day_units(total_seconds),
                "entries": len(rows),
                "unique_issues": len(issues),
                "days_logged": len(days),
            },
            "entries": entries_out,
            "sync_error": sync_error,
        },
    })


@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def worklog_export_settings_view(request):
    if not _is_admin_user(request.user):
        return Response({"success": False, "message": "Admin access required."}, status=403)

    settings_obj = WorklogExportSettings.get_solo()
    if request.method == "GET":
        return Response(
            {
                "success": True,
                "data": {
                    "project_name": settings_obj.project_name,
                    "project_number": settings_obj.project_number,
                    "updated_at": settings_obj.updated_at.isoformat() if settings_obj.updated_at else None,
                },
            }
        )

    project_name = (request.data.get("project_name") or "").strip()
    project_number = (request.data.get("project_number") or "").strip()
    if not project_name:
        return Response({"success": False, "message": "Project name is required."}, status=400)
    if not project_number:
        return Response({"success": False, "message": "Project number is required."}, status=400)

    settings_obj.project_name = project_name[:255]
    settings_obj.project_number = project_number[:255]
    settings_obj.save()
    return Response(
        {
            "success": True,
            "message": "Export settings saved.",
            "data": {
                "project_name": settings_obj.project_name,
                "project_number": settings_obj.project_number,
                "updated_at": settings_obj.updated_at.isoformat() if settings_obj.updated_at else None,
            },
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def worklog_analytics_export(request):
    if not _is_admin_user(request.user):
        return Response({"success": False, "message": "Admin access required."}, status=403)

    date_from, date_to = _month_bounds_for_export(request)
    _sync_all_jira_for_range(date_from, date_to)
    rows = list(worklogs_in_range(date_from, date_to).select_related("user", "jira_credential"))
    settings_obj = WorklogExportSettings.get_solo()
    wb = _build_worklog_export_workbook(
        settings_obj=settings_obj,
        rows=rows,
        date_from=date_from,
        date_to=date_to,
    )

    stream = BytesIO()
    wb.save(stream)
    stream.seek(0)
    filename = f"timesheet_{date_from.strftime('%Y_%m')}.xlsx"
    response = HttpResponse(
        stream.getvalue(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response
