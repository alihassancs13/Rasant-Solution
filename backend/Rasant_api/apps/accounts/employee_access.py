"""Helpers to keep employee role + sidebar modules in sync."""
from __future__ import annotations

EMPLOYEE_MODULES = [
    {
        "name": "Overview",
        "icon": "fa-solid fa-house",
        "link": "/employee/overview",
    },
    {
        "name": "Attendance",
        "icon": "fa-solid fa-calendar-check",
        "link": "/employee/attendance",
    },
    {
        "name": "Leave",
        "icon": "fa-solid fa-umbrella-beach",
        "link": "/employee/leave",
    },
    {
        "name": "Vault",
        "icon": "fa-solid fa-shield-halved",
        "link": "/employee/credentialsvault",
    },
    {
        "name": "Documents",
        "icon": "fa-solid fa-folder",
        "link": "/admin/documents",
    },
    {
        "name": "Jira",
        "icon": "fa-brands fa-jira",
        "link": "/admin/jira",
    },
    {
        "name": "Inbox",
        "icon": "fa-solid fa-comments",
        "link": "/admin/inbox",
    },
    {
        "name": "Worklogs",
        "icon": "fa-solid fa-clock",
        "link": "/admin/worklogs",
    },
]


def get_or_create_employee_role():
    from .models import Role

    role, _ = Role.objects.get_or_create(name="employee")
    return role


def ensure_employee_modules():
    """
    Ensure the standard employee sidebar modules exist for role=employee.
    Safe to call on every employee create/update.
    """
    from .models import Module

    role = get_or_create_employee_role()
    created = []
    wanted_names = {spec["name"] for spec in EMPLOYEE_MODULES}

    for spec in EMPLOYEE_MODULES:
        matches = list(Module.objects.filter(name=spec["name"], role=role).order_by("id"))
        if matches:
            obj = matches[0]
            # Remove accidental duplicates for the same name/role
            if len(matches) > 1:
                Module.objects.filter(id__in=[m.id for m in matches[1:]]).delete()
            was_created = False
        else:
            obj = Module.objects.create(
                name=spec["name"],
                role=role,
                icon=spec["icon"],
                link=spec["link"],
            )
            was_created = True

        updates = []
        if obj.link != spec["link"]:
            obj.link = spec["link"]
            updates.append("link")
        if obj.icon != spec["icon"] and spec["icon"]:
            obj.icon = spec["icon"]
            updates.append("icon")
        if updates:
            obj.save(update_fields=updates)
        if was_created:
            created.append(obj.name)

    # Drop employee modules that are not in the allowed set
    Module.objects.filter(role=role).exclude(name__in=wanted_names).delete()

    return role, created


def ensure_admin_leave_module():
    """Ensure Leave Requests appears under admin Employees sidebar."""
    from .models import Module, Role

    admin_role = (
        Role.objects.filter(name__iexact="admin").first()
        or Role.objects.filter(name__iexact="administrator").first()
    )
    if not admin_role:
        return None

    obj, _ = Module.objects.get_or_create(
        name="Leave Requests",
        role=admin_role,
        defaults={
            "icon": "fa-solid fa-umbrella-beach",
            "link": "/admin/employees/leave",
        },
    )
    updates = []
    if obj.link != "/admin/employees/leave":
        obj.link = "/admin/employees/leave"
        updates.append("link")
    if obj.icon != "fa-solid fa-umbrella-beach":
        obj.icon = "fa-solid fa-umbrella-beach"
        updates.append("icon")
    if updates:
        obj.save(update_fields=updates)
    return obj


def ensure_user_is_employee(user):
    """Assign the employee role on a User linked to an Employee record."""
    if not user:
        return None
    role = get_or_create_employee_role()
    if user.role_id != role.id:
        user.role = role
        user.save(update_fields=["role"])
    ensure_employee_modules()
    return user


def _module_dict(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "icon": row.get("icon") or "",
        "link": row.get("link") or "",
        "role_id": row.get("role_id"),
        "section": "main",
        "children": None,
    }


def _is_account_module(row):
    link = (row.get("link") or "").lower()
    name = (row.get("name") or "").lower()
    return (
        "/account" in link
        or "/settings" in link
        or "manage account" in name
        or "manage profile" in name
    )


def _is_employees_parent(row):
    return (row.get("name") or "").strip().lower() == "employees"


def _is_hr_child_module(row):
    """Modules that nest under the Employees parent in the admin sidebar."""
    if _is_employees_parent(row):
        return False
    link = row.get("link") or ""
    name = (row.get("name") or "").strip()
    if link.startswith("/admin/employees/"):
        return True
    # Careers lives at /admin/career but belongs under Employees in the UI
    if name.lower() == "careers":
        return True
    return False


def build_sidebar_modules_for_role(role):
    """
    Build sidebar payload from DB modules for a role.
    Nesting / account splitting is decided here so the frontend stays dynamic.
    """
    from .models import Module

    if not role:
        return {"modules": [], "account_modules": [], "project_modules": []}

    rows = list(
        Module.objects.filter(role=role)
        .order_by("id")
        .values("id", "name", "icon", "link", "role_id")
    )

    main = []
    nested = []
    account = []

    for row in rows:
        item = _module_dict(row)
        if _is_account_module(row):
            item["section"] = "account"
            account.append(item)
        elif _is_hr_child_module(row):
            item["section"] = "nested"
            nested.append(item)
        else:
            main.append(item)

    employees = next((m for m in main if _is_employees_parent(m)), None)
    if employees and nested:
        employees["children"] = nested
    elif nested:
        # No Employees parent (typical for employee role) — show as top-level
        for child in nested:
            child["section"] = "main"
            main.append(child)

    # Employee sidebar: keep Overview first (and match EMPLOYEE_MODULES order)
    role_name = (getattr(role, "name", None) or "").lower()
    if role_name == "employee":
        order = {spec["name"].lower(): index for index, spec in enumerate(EMPLOYEE_MODULES)}
        main.sort(key=lambda m: order.get((m.get("name") or "").lower(), 999))

    return {
        "modules": main,
        "account_modules": account,
        "project_modules": [],
    }
