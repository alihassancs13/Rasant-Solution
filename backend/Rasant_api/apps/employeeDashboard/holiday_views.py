"""Admin company holiday APIs."""
from __future__ import annotations

from datetime import date

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .holidays import apply_holiday_attendance, clear_holiday_attendance
from .models import CompanyHoliday


def _is_admin(user) -> bool:
    role_name = (user.role.name if getattr(user, "role", None) else "") or ""
    return (
        role_name.lower() in ("admin", "administrator")
        or user.is_superuser
        or user.is_staff
    )


def _serialize(row: CompanyHoliday) -> dict:
    return {
        "id": row.id,
        "date": str(row.date),
        "name": row.name,
        "note": row.note or "",
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "created_by": (
            (f"{row.created_by.first_name} {row.created_by.last_name}".strip()
             or row.created_by.username)
            if row.created_by_id else None
        ),
    }


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def company_holidays(request):
    """List or create company holidays (admin)."""
    if not _is_admin(request.user):
        return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

    if request.method == "GET":
        year = request.query_params.get("year")
        rows = CompanyHoliday.objects.all()
        if year:
            try:
                rows = rows.filter(date__year=int(year))
            except (TypeError, ValueError):
                return Response({"error": "Invalid year."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(
            {
                "success": True,
                "holidays": [_serialize(r) for r in rows[:500]],
            },
            status=status.HTTP_200_OK,
        )

    date_raw = request.data.get("date")
    name = (request.data.get("name") or "Holiday").strip()[:255] or "Holiday"
    note = (request.data.get("note") or "").strip()[:2000]

    if not date_raw:
        return Response({"error": "date is required (YYYY-MM-DD)."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        holiday_date = date.fromisoformat(str(date_raw)[:10])
    except ValueError:
        return Response({"error": "Invalid date format."}, status=status.HTTP_400_BAD_REQUEST)

    if CompanyHoliday.objects.filter(date=holiday_date).exists():
        return Response(
            {"error": "A holiday is already set for this date."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    row = CompanyHoliday.objects.create(
        date=holiday_date,
        name=name,
        note=note,
        created_by=request.user,
    )
    marked = apply_holiday_attendance(holiday_date)

    return Response(
        {
            "success": True,
            "message": f"Holiday saved. Attendance marked for {marked} employee(s).",
            "holiday": _serialize(row),
            "employees_marked": marked,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def company_holiday_detail(request, pk):
    if not _is_admin(request.user):
        return Response({"error": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

    try:
        row = CompanyHoliday.objects.get(pk=pk)
    except CompanyHoliday.DoesNotExist:
        return Response({"error": "Holiday not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        holiday_date = row.date
        row.delete()
        cleared = clear_holiday_attendance(holiday_date)
        return Response(
            {
                "success": True,
                "message": f"Holiday removed. Cleared {cleared} holiday attendance row(s).",
                "cleared": cleared,
            },
            status=status.HTTP_200_OK,
        )

    # PUT — update name/note (date change: re-apply)
    name = request.data.get("name")
    note = request.data.get("note")
    date_raw = request.data.get("date")

    old_date = row.date
    if date_raw:
        try:
            new_date = date.fromisoformat(str(date_raw)[:10])
        except ValueError:
            return Response({"error": "Invalid date format."}, status=status.HTTP_400_BAD_REQUEST)
        if new_date != old_date and CompanyHoliday.objects.filter(date=new_date).exclude(pk=pk).exists():
            return Response(
                {"error": "A holiday is already set for this date."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        row.date = new_date

    if name is not None:
        row.name = (str(name).strip()[:255] or "Holiday")
    if note is not None:
        row.note = str(note).strip()[:2000]
    row.save()

    if row.date != old_date:
        clear_holiday_attendance(old_date)
        marked = apply_holiday_attendance(row.date)
    else:
        marked = apply_holiday_attendance(row.date)

    return Response(
        {
            "success": True,
            "message": "Holiday updated.",
            "holiday": _serialize(row),
            "employees_marked": marked,
        },
        status=status.HTTP_200_OK,
    )
