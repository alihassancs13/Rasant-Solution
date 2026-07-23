"""In-app notification helpers for admin + employee header bell."""
from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()


def get_admin_users():
    return User.objects.filter(
        Q(is_superuser=True)
        | Q(is_staff=True)
        | Q(role__name__iexact="admin")
        | Q(role__name__iexact="administrator")
    ).distinct()


def notify_users(
    recipients,
    *,
    type: str,
    title: str,
    body: str = "",
    link: str = "",
    actor=None,
    payload: dict | None = None,
):
    """Create Notification rows for each recipient (skips actor if present)."""
    from .models import Notification

    users = []
    if recipients is None:
        return []
    if hasattr(recipients, "all"):
        users = list(recipients)
    elif isinstance(recipients, (list, tuple, set)):
        users = list(recipients)
    else:
        users = [recipients]

    created = []
    actor_id = getattr(actor, "id", None)
    for user in users:
        if not user or not getattr(user, "id", None):
            continue
        if actor_id and user.id == actor_id:
            continue
        created.append(
            Notification.objects.create(
                recipient=user,
                actor=actor if actor_id else None,
                type=type,
                title=(title or "")[:255],
                body=(body or "")[:2000],
                link=(link or "")[:255],
                payload=payload or {},
            )
        )
    return created


def notify_admins(*, type: str, title: str, body: str = "", link: str = "", actor=None, payload=None):
    return notify_users(
        get_admin_users(),
        type=type,
        title=title,
        body=body,
        link=link,
        actor=actor,
        payload=payload,
    )


def serialize_notification(row):
    return {
        "id": row.id,
        "type": row.type,
        "title": row.title,
        "body": row.body,
        "link": row.link,
        "is_read": row.is_read,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "payload": row.payload or {},
    }
