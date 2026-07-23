import requests
import base64
import calendar
from datetime import date,timedelta,datetime
from dateutil.relativedelta import relativedelta
from .models import JiraCredential, JiraTask, Source
from django.http import JsonResponse, HttpResponse,StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# GET JIRA HEADERS FOR URL
def get_jira_headers(email, api_token, domain):
    if not domain.startswith('http'):
        domain = f"https://{domain}"

    credentials = f"{email}:{api_token}"
    auth_header = "Basic " + base64.b64encode(credentials.encode()).decode()

    headers = {
        'Authorization': auth_header,
        'Accept':        'application/json',
        'Content-Type': 'application/json',
    }

    return domain, headers

def get_jira_creds(user):
    try:
        cred = JiraCredential.objects.get(auth_user_id=user)
        domain, headers = get_jira_headers(cred.email, cred.api_token, cred.domain)
        return domain, headers
    except JiraCredential.DoesNotExist:
        return None, None

def _extract_text_from_adf(adf_node):
    if not adf_node:
        return ""

    parts = []

    def walk(node):
        if isinstance(node, dict):
            if node.get("type") == "text":
                parts.append(node.get("text", ""))
            for child in node.get("content", []):
                walk(child)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(adf_node)
    return " ".join(parts).strip()

def fetch_issue_comments(user, issue_key):
    domain, headers = get_jira_creds(user)

    if not domain:
        return []

    r = requests.get(
        f"{domain}/rest/api/3/issue/{issue_key}/comment",
        headers=headers,
    )

    if r.status_code != 200:
        return []

    return [
        {
            "id": c.get("id"),
            "author": c.get("author", {}).get("displayName"),
            "avatar_url": c.get("author", {}).get("avatarUrls", {}).get("48x48"),
            "body": _extract_text_from_adf(c.get("body")),
            "created": c.get("created"),
            "updated": c.get("updated"),
        }
        for c in r.json().get("comments", [])
    ]

def fetch_recent_jira_projects(user):
    domain, headers = get_jira_creds(user)

    if not domain:
        return []

    r = requests.get(
        f"{domain}/rest/api/3/project/recent",
        headers=headers,
    )

    if r.status_code != 200:
        return []

    return [
        {
            "key": p.get("key"),
            "id": p.get("id"),
            "name": p.get("name"),
            "display": f"{p.get('name')} ({p.get('key')})",
            "type": p.get("projectTypeKey"),
            'avatar_url': p.get('avatarUrls', {}).get('48x48'),
        }
        for p in r.json()
    ]

def fetch_issue_types(user, project_id):
    domain, headers = get_jira_creds(user)

    if not domain:
        raise ValueError("Jira not connected. Please connect first.")

    if not project_id:
        raise ValueError("project_id is required")

    r = requests.get(
        f"{domain}/rest/api/3/issuetype/project",
        headers=headers,
        params={"projectId": project_id},
    )

    if r.status_code != 200:
        try:
            raise Exception(r.json())
        except Exception:
            raise Exception(r.text)

    return [
        {
            "id": it.get("id"),
            "name": it.get("name"),
            "description": it.get("description"),
            "icon_url": it.get("iconUrl"),
            "subtask": it.get("subtask"),
        }
        for it in r.json()
    ]

def fetch_statuses(user, project_key):
    domain, headers = get_jira_creds(user)

    if not domain:
        raise ValueError("Jira not connected. Please connect first.")

    if not project_key:
        raise ValueError("project_key is required")

    r = requests.get(
        f"{domain}/rest/api/3/project/{project_key}/statuses",
        headers=headers,
    )

    if r.status_code != 200:
        try:
            raise Exception(r.json())
        except Exception:
            raise Exception(r.text)

    statuses_set = {}

    for issue_type in r.json():
        for status in issue_type.get("statuses", []):
            statuses_set[status.get("id")] = {
                "id": status.get("id"),
                "name": status.get("name"),
                "self": status.get("self"),
            }

    return list(statuses_set.values())

def get_issue_detail_service(user, issue_key):
    domain, headers = get_jira_creds(user)

    if not domain:
        return {'error': 'Jira not connected. Please connect first.'}, 400

    r = requests.get(
        f'{domain}/rest/api/3/issue/{issue_key}',
        headers=headers,
        params={
            'fields': 'summary,status,priority,issuetype,duedate,project,description,assignee,reporter,comment,attachment,subtasks,labels,components'
        }
    )

    if r.status_code != 200:
        try:
            jira_errors = r.json().get('errors', {})
            jira_msgs = r.json().get('errorMessages', [])
        except Exception:
            jira_errors, jira_msgs = {}, []
        return {
            'error': 'Failed to fetch issue detail',
            'jira_errors': jira_errors,
            'jira_messages': jira_msgs,
        }, r.status_code

    issue = r.json()
    fields = issue.get('fields', {})

    result = {
        'issue_key': issue.get('key'),
        'issue_id': issue.get('id'),
        'issue_url': issue.get('self'),
        'summary': fields.get('summary'),
        'issue_type': fields['issuetype'].get('name'),
        'issue_type_description': fields['issuetype'].get('description'),
        'issue_type_icon': fields['issuetype'].get('iconUrl'),
        'status': fields['status'].get('name'),
        'status_category': fields['status']['statusCategory'].get('name'),
        'status_color': fields['status']['statusCategory'].get('colorName'),
        'project_key': fields['project'].get('key'),
        'project_name': fields['project'].get('name'),
        'project_type': fields['project'].get('projectTypeKey'),
        'project_avatar': fields['project']['avatarUrls'].get('48x48'),
        'priority': fields['priority'].get('name') if fields.get('priority') else None,
        'due_date': fields.get('duedate'),
        'created': fields.get('created'),
        'updated': fields.get('updated'),
        'assignee': {
            'name': fields['assignee'].get('displayName'),
            'email': fields['assignee'].get('emailAddress'),
            'avatar': fields['assignee']['avatarUrls'].get('48x48'),
        } if fields.get('assignee') else None,
        'reporter': {
            'name': fields['reporter'].get('displayName'),
            'email': fields['reporter'].get('emailAddress'),
            'avatar': fields['reporter']['avatarUrls'].get('48x48'),
        } if fields.get('reporter') else None,
        'description': fields.get('description'),
        'comments': [
            {
                'id': c.get('id'),
                'body': c.get('body'),
                'created': c.get('created'),
                'updated': c.get('updated'),
                'author': {
                    'name': c['author'].get('displayName'),
                    'email': c['author'].get('emailAddress'),
                    'avatar': c['author']['avatarUrls'].get('48x48'),
                } if c.get('author') else None,
            }
            for c in fields.get('comment', {}).get('comments', [])
        ],
        'attachments': [
            {
                'id': a.get('id'),
                'filename': a.get('filename'),
                'content': a.get('content'),
                'mime_type': a.get('mimeType'),
                'size': a.get('size'),
                'created': a.get('created'),
            }
            for a in fields.get('attachment', [])
        ],
        'subtasks': [
            {
                'issue_key': s.get('key'),
                'summary': s['fields'].get('summary'),
                'status': s['fields']['status'].get('name'),
                'issue_type_icon': s['fields']['issuetype'].get('iconUrl'),
            }
            for s in fields.get('subtasks', [])
        ],
        'labels': fields.get('labels', []),
        'components': [c.get('name') for c in fields.get('components', [])],
    }

    jira_task = JiraTask.objects.filter(issue_key=issue_key).select_related('source').first()
    result['source'] = {
        'code': jira_task.source.code,
        'name': jira_task.source.name,
    } if jira_task and jira_task.source else None

    return {'success': True, 'issue': result}, 200


def _get_current_account_id(user):
    try:
        cred = JiraCredential.objects.get(auth_user_id=user)
        return cred.account_id
    except JiraCredential.DoesNotExist:
        return None


def _fetch_all_worklogs_for_issue(domain, headers, issue_key):
    r = requests.get(
        f'{domain}/rest/api/3/issue/{issue_key}/worklog',
        headers=headers,
        params={'maxResults': 1000}
    )
    if r.status_code != 200:
        return []
    return r.json().get('worklogs', [])

# Get last years whole work logs

def fetch_worklogs_for_range(user, date_from, date_to):
    """
    Fetch the authenticated user's own worklogs from Jira for [date_from, date_to].
    Returns a flat list of worklog dicts (not grouped by date).
    """
    domain, headers = get_jira_creds(user)

    if not domain:
        raise ValueError("Jira not connected. Please connect first.")

    if isinstance(date_from, str):
        date_from = datetime.strptime(date_from, "%Y-%m-%d").date()
    if isinstance(date_to, str):
        date_to = datetime.strptime(date_to, "%Y-%m-%d").date()

    if date_to < date_from:
        date_from, date_to = date_to, date_from

    jql = (
        f'worklogAuthor = currentUser() '
        f'AND worklogDate >= "{date_from}" '
        f'AND worklogDate <= "{date_to}"'
    )

    account_id = _get_current_account_id(user)
    entries = []
    next_page_token = None

    while True:
        params = {
            "jql": jql,
            "fields": "summary,worklog,issuetype",
            "maxResults": 100,
        }

        if next_page_token:
            params["nextPageToken"] = next_page_token

        r = requests.get(
            f"{domain}/rest/api/3/search/jql",
            headers=headers,
            params=params,
        )

        if r.status_code != 200:
            try:
                raise Exception(r.json())
            except Exception:
                raise Exception(r.text)

        data = r.json()

        for issue in data.get("issues", []):
            issue_key = issue.get("key")
            summary = issue["fields"].get("summary")
            issue_type = issue["fields"].get("issuetype", {})
            issue_type_icon = issue_type.get("iconUrl")

            worklog_data = issue["fields"].get("worklog", {})
            worklogs = worklog_data.get("worklogs", [])

            if worklog_data.get("total", 0) > len(worklogs):
                worklogs = _fetch_all_worklogs_for_issue(
                    domain,
                    headers,
                    issue_key,
                )

            for wl in worklogs:
                if wl.get("author", {}).get("accountId") != account_id:
                    continue

                date_str = (wl.get("started") or "")[:10]
                if not date_str or not (str(date_from) <= date_str <= str(date_to)):
                    continue

                started_str = wl.get("started")
                try:
                    started_dt = datetime.strptime(
                        started_str,
                        "%Y-%m-%dT%H:%M:%S.000%z",
                    )
                except (TypeError, ValueError):
                    # Fallback for slight format differences from Jira
                    try:
                        started_dt = datetime.fromisoformat(
                            started_str.replace("Z", "+00:00")
                        )
                    except Exception:
                        continue

                seconds = int(wl.get("timeSpentSeconds") or 0)
                ended_dt = started_dt + timedelta(seconds=seconds)

                entries.append({
                    "worklog_id": wl.get("id"),
                    "issue_key": issue_key,
                    "issue_id": issue.get("id"),
                    "summary": summary,
                    "issue_type_icon": issue_type_icon,
                    "time_spent": wl.get("timeSpent"),
                    "time_spent_seconds": seconds,
                    "comment": _extract_text_from_adf(wl.get("comment")),
                    "started": started_str,
                    "ended": ended_dt.strftime("%Y-%m-%dT%H:%M:%S.000%z"),
                    "date": date_str,
                })

        if data.get("isLast", True):
            break

        next_page_token = data.get("nextPageToken")
        if not next_page_token:
            break

    return entries


def fetch_worklogs(user, month=None, year=None):
    """
    Get worklogs for a month/year, grouped by date (calendar UI shape).
    """
    today = date.today()

    if not month:
        month = today.month
    else:
        month = int(month)

    if not year:
        year = today.year
    else:
        year = int(year)

    start_date = date(year, month, 1)
    end_date = date(year, month, calendar.monthrange(year, month)[1])

    entries = fetch_worklogs_for_range(user, start_date, end_date)

    logs_by_date = {}
    for entry in entries:
        date_str = entry.get("date") or (entry.get("started") or "")[:10]
        row = {k: v for k, v in entry.items() if k != "date"}
        logs_by_date.setdefault(date_str, []).append(row)

    return logs_by_date


def create_jira_worklog(user, issue_key, started, time_spent_seconds, comment=""):
    domain, headers = get_jira_creds(user)
    if not domain:
        return {
            "success": False,
            "status": 400,
            "message": "Jira is not connected."
        }

    url = f"{domain}/rest/api/3/issue/{issue_key}/worklog"

    payload = {
        "started": started,
        "timeSpentSeconds": time_spent_seconds,
    }

    if comment:
        payload["comment"] = {
            "type": "doc",
            "version": 1,
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": comment
                        }
                    ]
                }
            ]
        }

    try:
        response = requests.post(url, headers=headers, json=payload)

        data = response.json() if response.content else {}

        if response.status_code in (200, 201):
            return {
                "success": True,
                "status": response.status_code,
                "message": "Worklog created successfully.",
                "data": data
            }

        return {
            "success": False,
            "status": response.status_code,
            "message": data.get("errorMessages", ["Failed to create worklog."])[0],
            "errors": data
        }

    except requests.RequestException as e:
        return {
            "success": False,
            "status": 500,
            "message": str(e)
        }


def update_jira_worklog(user, issue_key, worklog_id, started, time_spent_seconds, comment=""):
    domain, headers = get_jira_creds(user)
    if not domain:
        return {
            "success": False,
            "status": 400,
            "message": "Jira is not connected."
        }

    url = f"{domain}/rest/api/3/issue/{issue_key}/worklog/{worklog_id}"

    payload = {
        "started": started,
        "timeSpentSeconds": time_spent_seconds,
    }

    if comment:
        payload["comment"] = {
            "type": "doc",
            "version": 1,
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": comment
                        }
                    ]
                }
            ]
        }

    try:
        response = requests.put(url, headers=headers, json=payload)
        data = response.json() if response.content else {}

        if response.status_code == 200:
            return {
                "success": True,
                "status": response.status_code,
                "message": "Worklog updated successfully.",
                "data": data
            }

        return {
            "success": False,
            "status": response.status_code,
            "message": data.get("errorMessages", ["Failed to update worklog."])[0],
            "errors": data
        }

    except requests.RequestException as e:
        return {
            "success": False,
            "status": 500,
            "message": str(e)
        }


def delete_jira_worklog(user, issue_key, worklog_id):
    domain, headers = get_jira_creds(user)
    if not domain:
        return {
            "success": False,
            "status": 400,
            "message": "Jira is not connected."
        }

    url = f"{domain}/rest/api/3/issue/{issue_key}/worklog/{worklog_id}"

    try:
        response = requests.delete(url, headers=headers)

        if response.status_code == 204:
            return {
                "success": True,
                "status": 200,  # override 204 -> 200 so the success message body isn't stripped
                "message": "Worklog deleted successfully."
            }

        if response.status_code == 404:
            return {
                "success": False,
                "status": 404,
                "message": "Worklog already deleted or does not exist."
            }

        data = response.json() if response.content else {}
        return {
            "success": False,
            "status": response.status_code,
            "message": data.get("errorMessages", ["Failed to delete worklog."])[0],
            "errors": data
        }

    except requests.RequestException as e:
        return {
            "success": False,
            "status": 500,
            "message": str(e)
        }


def get_jira_worklog(user, issue_key, worklog_id):
    domain, headers = get_jira_creds(user)

    if not domain:
        return {
            "success": False,
            "status": 400,
            "message": "Jira is not connected."
        }

    url = f"{domain}/rest/api/3/issue/{issue_key}/worklog/{worklog_id}"

    response = requests.get(url, headers=headers)

    try:
        data = response.json()
    except Exception:
        data = response.text

    if response.status_code == 200:
        return {
            "success": True,
            "status": 200,
            "message": "Worklog fetched successfully.",
            "data": data,
        }

    return {
        "success": False,
        "status": response.status_code,
        "message": data.get("errorMessages", ["Failed to fetch worklog."])[0]
        if isinstance(data, dict)
        else "Failed to fetch worklog.",
        "data": data,
    }