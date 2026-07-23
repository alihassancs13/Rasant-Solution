"""Leave request APIs: employee submit + admin approve/reject."""
from __future__ import annotations

from datetime import date, timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.email_service import send_leave_requested, send_leave_decision
from accounts.notifications import notify_admins, notify_users

from .models import Attendance, LeaveRequest, PayrollSettings


def _resolve_employee_for_user(request_user):
    """Avoid circular import: resolve employee linked to auth user."""
    from .models import Employee

    if not request_user or not getattr(request_user, "is_authenticated", False):
        return None
    emp = Employee.objects.filter(user=request_user).select_related("status").first()
    if emp:
        return emp
    email = getattr(request_user, "email", None)
    if email:
        return Employee.objects.filter(email__iexact=email).select_related("status").first()
    return None


def _is_admin(user) -> bool:
    role_name = (user.role.name if getattr(user, "role", None) else "") or ""
    return (
        role_name.lower() in ("admin", "administrator")
        or user.is_superuser
        or user.is_staff
    )


def _truthy(value) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    return str(value).strip().lower() in ("1", "true", "yes", "on")


def _serialize_leave(row: LeaveRequest) -> dict:
    return {
        "id": row.id,
        "employee_id": row.employee_id,
        "employee_name": row.employee.name,
        "employee_number": row.employee.employee_number,
        "department": row.employee.department or "",
        "designation": row.employee.designation or "",
        "start_date": str(row.start_date),
        "end_date": str(row.end_date),
        "is_half_day": bool(row.is_half_day),
        "half_day_period": row.half_day_period or "",
        "duration_days": row.duration_days,
        "duration_label": row.duration_label,
        "subject": row.subject,
        "reason": row.reason,
        "status": row.status,
        "admin_note": row.admin_note or "",
        "reviewed_by": (
            (f"{row.reviewed_by.first_name} {row.reviewed_by.last_name}".strip()
             or row.reviewed_by.username)
            if row.reviewed_by_id else None
        ),
        "reviewed_at": row.reviewed_at.isoformat() if row.reviewed_at else None,
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }


def _daterange(start: date, end: date):
    cur = start
    while cur <= end:
        yield cur
        cur += timedelta(days=1)


def _mark_attendance_on_leave(employee, start: date, end: date, *, is_half_day: bool = False):
    """
    Mark attendance for approved leave.
    Full-day: status on_leave, clear punches.
    Half-day: flag is_half_day (0.5 leave), keep punches so employee can work the other half.
    """
    settings_obj = PayrollSettings.get_settings()
    timetable = settings_obj.default_timetable or "10 - 7"
    marked = 0
    for day in _daterange(start, end):
        record, _ = Attendance.objects.get_or_create(
            employee=employee,
            date=day,
            defaults={
                "status": "on_leave",
                "timetable": timetable,
                "is_paid": True,
            },
        )
        record.timetable = record.timetable or timetable
        record.is_paid = True
        if is_half_day:
            record.is_half_day = True
            # Only force on_leave when they have not punched yet for the working half
            if not record.clock_in:
                record.status = "on_leave"
            record.save()
        else:
            record.is_half_day = False
            record.status = "on_leave"
            record.clock_in = None
            record.clock_out = None
            record.late_minutes = 0
            record.overtime_hours = 0
            record.save()
        marked += 1
    return marked


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def my_leave_requests(request):
    """Employee: list own leave requests or submit a new one."""
    employee = _resolve_employee_for_user(request.user)
    if not employee:
        return Response(
            {"error": "No employee profile is linked to this account."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        rows = (
            LeaveRequest.objects.filter(employee=employee)
            .select_related("employee", "reviewed_by")
            .order_by("-created_at")
        )
        status_filter = (request.query_params.get("status") or "").strip().lower()
        if status_filter and status_filter != "all":
            rows = rows.filter(status=status_filter)
        return Response(
            {"success": True, "requests": [_serialize_leave(r) for r in rows]},
            status=status.HTTP_200_OK,
        )

    start_raw = request.data.get("start_date")
    end_raw = request.data.get("end_date")
    subject = (request.data.get("subject") or "Leave request").strip()[:255]
    reason = (request.data.get("reason") or "").strip()
    is_half_day = _truthy(request.data.get("is_half_day"))
    half_day_period = (request.data.get("half_day_period") or "").strip().lower()

    if not start_raw or not end_raw:
        return Response(
            {"error": "Start date and end date are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        start = date.fromisoformat(str(start_raw)[:10])
        end = date.fromisoformat(str(end_raw)[:10])
    except ValueError:
        return Response({"error": "Invalid date format."}, status=status.HTTP_400_BAD_REQUEST)

    if is_half_day:
        end = start
        if half_day_period not in (
            LeaveRequest.HALF_DAY_MORNING,
            LeaveRequest.HALF_DAY_AFTERNOON,
        ):
            return Response(
                {"error": "Please choose morning or afternoon for half-day leave."},
                status=status.HTTP_400_BAD_REQUEST,
            )
    else:
        half_day_period = ""

    if end < start:
        return Response(
            {"error": "End date cannot be before start date."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if start < date.today():
        return Response(
            {"error": "Leave cannot start in the past."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not reason or len(reason) < 20:
        return Response(
            {"error": "Please write a proper leave proposal (at least 20 characters)."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if len(reason) > 5000:
        return Response(
            {"error": "Reason is too long (max 5000 characters)."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    overlap = LeaveRequest.objects.filter(
        employee=employee,
        status__in=[LeaveRequest.STATUS_PENDING, LeaveRequest.STATUS_APPROVED],
        start_date__lte=end,
        end_date__gte=start,
    ).exists()
    if overlap:
        return Response(
            {"error": "You already have a pending or approved leave overlapping these dates."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    row = LeaveRequest.objects.create(
        employee=employee,
        start_date=start,
        end_date=end,
        is_half_day=is_half_day,
        half_day_period=half_day_period,
        subject=subject or "Leave request",
        reason=reason,
        status=LeaveRequest.STATUS_PENDING,
    )

    try:
        notify_admins(
            type="leave",
            title=f"Leave request from {employee.name}",
            body=f"{start} → {end} ({row.duration_label}): {subject}",
            link="/admin/employees/leave",
            actor=request.user,
            payload={"leave_id": row.id},
        )
    except Exception as err:
        print(f"Leave request notify failed: {err}")

    try:
        send_leave_requested(row)
    except Exception as err:
        print(f"Leave request email failed: {err}")

    return Response(
        {
            "success": True,
            "message": "Leave request submitted. Admin will review it shortly.",
            "request": _serialize_leave(row),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_leave_requests(request):
    """Admin: list all leave requests (filter by status)."""
    if not _is_admin(request.user):
        return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

    rows = LeaveRequest.objects.select_related("employee", "reviewed_by").order_by("-created_at")
    status_filter = (request.query_params.get("status") or "pending").strip().lower()
    if status_filter and status_filter != "all":
        rows = rows.filter(status=status_filter)

    pending_count = LeaveRequest.objects.filter(status=LeaveRequest.STATUS_PENDING).count()
    approved_count = LeaveRequest.objects.filter(status=LeaveRequest.STATUS_APPROVED).count()
    rejected_count = LeaveRequest.objects.filter(status=LeaveRequest.STATUS_REJECTED).count()

    return Response(
        {
            "success": True,
            "stats": {
                "pending": pending_count,
                "approved": approved_count,
                "rejected": rejected_count,
            },
            "requests": [_serialize_leave(r) for r in rows[:200]],
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def decide_leave_request(request, pk):
    """Admin approve or reject a leave request."""
    if not _is_admin(request.user):
        return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

    try:
        row = LeaveRequest.objects.select_related("employee", "employee__user").get(pk=pk)
    except LeaveRequest.DoesNotExist:
        return Response({"error": "Leave request not found."}, status=status.HTTP_404_NOT_FOUND)

    if row.status != LeaveRequest.STATUS_PENDING:
        return Response(
            {"error": f"This request was already {row.status}."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    decision = (request.data.get("decision") or request.data.get("status") or "").strip().lower()
    admin_note = (request.data.get("admin_note") or "").strip()[:2000]

    if decision not in ("approved", "approve", "rejected", "reject"):
        return Response(
            {"error": "decision must be approved or rejected."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    approved = decision in ("approved", "approve")
    row.status = LeaveRequest.STATUS_APPROVED if approved else LeaveRequest.STATUS_REJECTED
    row.admin_note = admin_note
    row.reviewed_by = request.user
    row.reviewed_at = timezone.now()
    row.save(update_fields=["status", "admin_note", "reviewed_by", "reviewed_at", "updated_at"])

    days_marked = 0
    if approved:
        days_marked = _mark_attendance_on_leave(
            row.employee,
            row.start_date,
            row.end_date,
            is_half_day=bool(row.is_half_day),
        )

    emp_user = row.employee.user
    decision_label = "approved" if approved else "rejected"
    try:
        if emp_user:
            notify_users(
                emp_user,
                type="leave",
                title=f"Leave request {decision_label}",
                body=(
                    f"Your leave ({row.duration_label}: {row.start_date}"
                    + (f" → {row.end_date}" if not row.is_half_day else "")
                    + f") was {decision_label}."
                    + (f" Note: {admin_note}" if admin_note else "")
                ),
                link="/employee/leave",
                actor=request.user,
                payload={"leave_id": row.id, "status": row.status},
            )
    except Exception as err:
        print(f"Leave decision notify failed: {err}")

    try:
        send_leave_decision(row, approved=approved)
    except Exception as err:
        print(f"Leave decision email failed: {err}")

    leave_units = row.duration_days
    return Response(
        {
            "success": True,
            "message": (
                f"Leave approved. Attendance updated for {leave_units} day(s)."
                if approved
                else "Leave request rejected. Employee has been notified."
            ),
            "request": _serialize_leave(row),
            "days_marked": days_marked,
        },
        status=status.HTTP_200_OK,
    )
