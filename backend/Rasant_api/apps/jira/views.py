import requests
from datetime import datetime,timezone,timedelta
import base64
from django.http import JsonResponse, HttpResponse,StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.apps import apps
import json
import subprocess
import tempfile
import json as json_module
from .services import (
    get_jira_headers,
    get_jira_creds,
    get_jira_worklog,
    fetch_worklogs,
    create_jira_worklog,
    update_jira_worklog,
    fetch_recent_jira_projects,
    delete_jira_worklog,
    _get_current_account_id,
    _fetch_all_worklogs_for_issue,
    fetch_issue_types,
    fetch_statuses,
    get_issue_detail_service,
)
from .models import JiraCredential, JiraTask, Source, Worklog
from .worklog_storage import (
    create_manual_worklog,
    group_worklogs_by_date,
    serialize_worklog_row,
    sync_user_worklogs_from_jira,
    worklogs_for_user_month,
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# LOGIN TO JIRA
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def connect_jira(request):
    email = request.data.get('email')
    api_token = request.data.get('api_token')
    domain = request.data.get('domain')

    if not all([email, api_token, domain]):
        return JsonResponse({'error': 'email, api_token and domain are required'}, status=400)

    # Build auth from user's credentials
    full_domain, headers = get_jira_headers(email, api_token, domain)

    # Verify + fetch their info from Jira
    r = requests.get(f'{full_domain}/rest/api/3/myself', headers=headers)

    if r.status_code != 200:
        try:
            jira_msg = r.json().get('message', 'Something went wrong')
        except:
            jira_msg = r.text.strip() or 'Something went wrong'

        return JsonResponse({'error': jira_msg}, status=r.status_code)

    user = r.json()

    JiraCredential.objects.update_or_create(
        auth_user_id=request.user,
        defaults={
            'email': email,
            'api_token': api_token,
            'domain': domain,
            'account_id': user.get('accountId'),
            'display_name': (user.get('displayName') or '').strip(),
        }
    )

    return JsonResponse({
        'success':    True,
        'name':       user.get('displayName'),
        'email':      user.get('emailAddress'),
        'account_id': user.get('accountId'),
        'avatar':     user.get('avatarUrls', {}).get('48x48'),
        'timezone':   user.get('timeZone'),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_jira_connection(request):
    try:
        domain, headers = get_jira_creds(request.user)

        if not domain or not headers:
            return Response({
                "connected": False,
                "expired": False
            })

        r = requests.get(f"{domain}/rest/api/3/myself", headers=headers)

        try:
            creds = JiraCredential.objects.get(auth_user_id=request.user)
        except JiraCredential.DoesNotExist:
            return Response({"connected": False, "expired": False})

        if r.status_code == 200:
            me = r.json()
            display_name = (me.get("displayName") or "").strip()
            if display_name and display_name != (creds.display_name or ""):
                creds.display_name = display_name
                creds.save(update_fields=["display_name"])
            return Response({
                "connected": True,
                "expired": False,
                "email": creds.email,
                "domain": creds.domain,
                "account_id": creds.account_id,
                "display_name": creds.display_name or display_name,
            })

        try:
            error = r.json()
        except Exception:
            error = r.text

        return Response({
            "connected": False,
            "expired": True,
            "email": creds.email,
            "domain": creds.domain,
            "jira_error": error
        })

    except requests.exceptions.RequestException as e:
        return Response({
            "connected": False,
            "expired": True,
            "jira_error": str(e)
        })

# ISSUES LIST FOR SPECIFIC USER
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_issues(request):
    domain, headers = get_jira_creds(request.user)

    if not domain:
        return Response({'error': 'Jira not connected. Please connect first.'}, status=400)

    account_id = request.GET.get('account_id')

    if not account_id:
        return Response({'error': 'account_id is required'}, status=400)

    jql = f'assignee={account_id}'

    all_issues = []
    next_page_token = None

    while True:
        params = {
            'jql': jql,
            'maxResults': 100,
            'fields': 'summary,status,priority,issuetype,duedate,project'
        }
        if next_page_token:
            params['nextPageToken'] = next_page_token

        r = requests.get(
            f'{domain}/rest/api/3/search/jql',
            headers=headers,
            params=params
        )

        if r.status_code != 200:
            try:
                jira_errors = r.json().get('errors', {})
                jira_msgs   = r.json().get('errorMessages', [])
            except Exception:
                jira_errors, jira_msgs = {}, []
            return JsonResponse({
                'error':         'Failed to fetch issues',
                'jira_errors':   jira_errors,
                'jira_messages': jira_msgs,
            }, status=r.status_code)

        data = r.json()
        all_issues.extend(data.get('issues', []))

        if data.get('isLast', True):
            break

        next_page_token = data.get('nextPageToken')
        if not next_page_token:
            break

    result = [
        {
            'issue_key': issue.get('key'),
            'issue_id': issue.get('id'),
            'issue_url': issue.get('self'),

            'summary': issue['fields'].get('summary'),
            'issue_type': issue['fields']['issuetype'].get('name'),
            'issue_type_description': issue['fields']['issuetype'].get('description'),
            'issue_type_icon': issue['fields']['issuetype'].get('iconUrl'),

            'status': issue['fields']['status'].get('name'),
            'status_category': issue['fields']['status']['statusCategory'].get('name'),
            'status_color': issue['fields']['status']['statusCategory'].get('colorName'),

            'project_key': issue['fields']['project'].get('key'),
            'project_name': issue['fields']['project'].get('name'),
            'project_type': issue['fields']['project'].get('projectTypeKey'),
            'project_avatar': issue['fields']['project']['avatarUrls'].get('48x48'),

            'priority': issue['fields']['priority'].get('name') if issue['fields'].get('priority') else None,
            'due_date': issue['fields'].get('duedate'),
        }
        for issue in all_issues
    ]
    return JsonResponse({
        'success': True,
        'is_last': True,
        'issues':  result,
    }, status=200)

# GET INDIVIDUAL ISSUES
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_issue_detail(request, issue_key):
    result, status_code = get_issue_detail_service(request.user, issue_key)
    return JsonResponse(result, status=status_code)

# CREATE JIRA ISSUE
def create_jira_issue_service(data, user,attachments, source, created_by_id=None):
    domain, headers = get_jira_creds(user)
    if not domain:
        return {'error': 'Jira not connected'}, 400

    project_key = data.get('project_key')
    summary = data.get('summary')
    description = data.get('description', '')
    team_id = data.get('team_id')
    e2e_responsible_id = data.get('e2e_responsible_id')
    status_name = data.get('status')
    issue_type = data.get('issue_type', 'Task')
    original_estimate = data.get('original_estimate')
    start_date = data.get('start_date')
    sprint_id = data.get('sprint_id')
    flagged = str(data.get('flagged', 'false')).lower() == 'true'
    priority = data.get('priority')
    assignee_id = data.get('assignee_id')
    reporter_id = data.get('reporter_id')
    issue_color = data.get('issue_color')
    due_date = data.get('due_date')
    story_points = data.get('story_points')
    parent_key = data.get('parent_key')
    fix_versions = data.get('fix_versions', [])
    labels = data.get('labels', [])
    linked_issues = data.get('linked_issues', [])

    payload = {
        'fields': {
            'project': {'id': project_key} if project_key.isdigit() else {'key': project_key},
            'summary': summary,
            'issuetype': {'name': issue_type},
        }
    }

    fix_versions = [v for v in fix_versions if v.strip()]
    if fix_versions:
        payload['fields']['fixVersions'] = [{'name': v} for v in fix_versions]

    if team_id:
        payload['fields']['customfield_10001'] = team_id
    if issue_color:
        payload['fields']['customfield_10017'] = issue_color
    if e2e_responsible_id:
        payload['fields']['customfield_10080'] = [{'id': e2e_responsible_id}]
    if original_estimate:
        payload['fields']['timetracking'] = {'originalEstimate': original_estimate}
    if start_date:
        payload['fields']['customfield_10015'] = start_date
    if sprint_id:
        payload['fields']['customfield_10020'] = int(sprint_id)
    if flagged:
        payload['fields']['customfield_10021'] = [{'value': 'Impediment'}]
    if description:
        payload['fields']['description'] = {
            'type': 'doc', 'version': 1,
            'content': [{'type': 'paragraph', 'content': [{'type': 'text', 'text': description}]}]
        }
    if priority:
        payload['fields']['priority'] = {'id': priority}
    if assignee_id:
        payload['fields']['assignee'] = {'id': assignee_id}
    if reporter_id:
        payload['fields']['reporter'] = {'id': reporter_id}
    if labels:
        labels = [l for l in labels if l.strip()]
        if labels:
            payload['fields']['labels'] = labels
    if due_date:
        payload['fields']['duedate'] = due_date
    if story_points:
        payload['fields']['customfield_10016'] = int(story_points)

    ISSUE_TYPES_WITHOUT_PARENT = {'epic'}
    if parent_key and issue_type.lower() not in ISSUE_TYPES_WITHOUT_PARENT:
        payload['fields']['parent'] = {'key': parent_key}


    r = requests.post(
        f'{domain}/rest/api/3/issue',
        headers=headers,
        json=payload
    )

    if r.status_code not in (200, 201):
        return r.json(), r.status_code

    created = r.json()
    issue_key = created.get('key')

    # Status transition
    if status_name:
        trans_res = requests.get(
            f'{domain}/rest/api/3/issue/{issue_key}/transitions',
            headers=headers
        )
        if trans_res.status_code == 200:
            transitions = trans_res.json().get('transitions', [])
            match = next(
                (t for t in transitions if t['name'].lower() == status_name.lower()), None
            )
            if match:
                requests.post(
                    f'{domain}/rest/api/3/issue/{issue_key}/transitions',
                    headers=headers,
                    json={"transition": {"id": match['id']}}
                )

    # Attachments
    attachment_results = []

    if attachments:

        attachment_headers = {
            'Authorization': headers['Authorization'],
            'X-Atlassian-Token': 'no-check'
        }

        for file in attachments:
            file_response = requests.post(
                f'{domain}/rest/api/3/issue/{issue_key}/attachments',
                headers=attachment_headers,
                files={'file': (file.name, file.read(), file.content_type)}
            )

            if file_response.status_code == 200:
                attachment_results.append({
                    'name': file.name,
                    'status': 'uploaded',
                    'url': file_response.json()[0].get('content')
                })
            else:
                delete_response = requests.delete(
                    f'{domain}/rest/api/3/issue/{issue_key}',
                    headers=headers
                )

                return {
                    'success': False,
                    'error': f'Attachment upload failed for {file.name}',
                    'attachment_error': file_response.text,
                    'issue_deleted': delete_response.status_code in (200, 204)
                }, 400

    # Linked issue
    if linked_issues:
        for link in linked_issues:
            api_name = link.get('api_name')
            direction = link.get('direction')
            issue_key2 = link.get('issue_key')
            if not all([api_name, direction, issue_key2]):
                continue
            link_payload = {
                "type": {"name": api_name},
                "inwardIssue": {"key": issue_key if direction == 'inward' else issue_key2},
                "outwardIssue": {"key": issue_key2 if direction == 'inward' else issue_key}
            }
            requests.post(f'{domain}/rest/api/3/issueLink', headers=headers, json=link_payload)

    try:
        creds = JiraCredential.objects.get(auth_user_id=user)
        JiraTask.objects.create(
            jira_credential=creds,
            issue_key=issue_key,
            summary=summary,
            source=source,
            created_by_id=created_by_id,
        )
    except JiraCredential.DoesNotExist:
        pass

    return {
        'success': True,
        'issue_id': created.get('id'),
        'issue_key': issue_key,
        'url': f"{domain}/browse/{issue_key}",
    }, 201

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_jira_issue(request):
    app_name = apps.get_containing_app_config(__name__).name
    source = Source.objects.filter(code=app_name, is_active=True).first()
    print("FILES:", request.FILES.getlist('attachments'))

    result, status_code = create_jira_issue_service(
        data=request.data,
        attachments=request.FILES.getlist('attachments'),
        user=request.user,
        source=source,
        created_by_id=request.user.id,
    )
    return JsonResponse(result, status=status_code)

# FETCHING TEAMS
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_teams(request):
    domain, headers = get_jira_creds(request.user)
    if not domain:
        return Response({'error': 'Jira not connected. Please connect first.'}, status=400)

    # For GraphQL we only need hostname and not the http
    hostname = domain.replace('https://', '').replace('http://', '')

    # Step 1: orgId
    org_res = requests.post(
        f'{domain}/gateway/api/graphql',
        headers=headers,
        json={"query": f'query {{ tenantContexts(hostNames:["{hostname}"]) {{ orgId }} }}'}
    )

    if org_res.status_code != 200:
        try:
            return JsonResponse(org_res.json(), status=org_res.status_code)
        except:
            return JsonResponse({'error': org_res.text}, status=org_res.status_code)

    try:
        org_id = org_res.json()['data']['tenantContexts'][0]['orgId']
    except (KeyError, IndexError):
        return JsonResponse({'error': 'Could not parse orgId'}, status=500)

    # Step 2: Teams
    all_teams = []
    params = {'size': 300}

    while True:
        res = requests.get(
            f'{domain}/gateway/api/public/teams/v1/org/{org_id}/teams',
            headers=headers,
            params=params
        )

        if res.status_code != 200:
            try:
                return JsonResponse(res.json(), status=res.status_code)
            except:
                return JsonResponse({'error': res.text}, status=res.status_code)

        data = res.json()
        all_teams.extend(data.get('entities', []))

        cursor = data.get('cursor')
        if not cursor:
            break
        params['cursor'] = cursor

    return JsonResponse({'teams': all_teams}, status=200)

# GET LIST OF ATTACHMENTS PER ISSUE
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_jira_attachments(request):
    domain, headers = get_jira_creds(request.user)
    if not domain:
        return Response({'error': 'Jira not connected. Please connect first.'}, status=400)

    issue_key = request.data.get('issue_key')

    if not issue_key:
        return Response({'error': 'issue_key is required'}, status=400)

    r = requests.get(
        f'{domain}/rest/api/3/issue/{issue_key}?fields=attachment',
        headers=headers
    )

    if r.status_code != 200:
        try:
            return JsonResponse(r.json(), status=r.status_code)
        except:
            return JsonResponse({'error': r.text}, status=r.status_code)

    attachments = r.json().get('fields', {}).get('attachment', [])

    result = []
    for att in attachments:
        result.append({
            'id':        att['id'],
            'filename':  att['filename'],
            'size':      att['size'],
            'mimeType':  att['mimeType'],
            'content':   att['content'],
            'created':   att['created'],
        })

    return JsonResponse({'attachments': result}, status=200)

# DELETE JIRA ATTACHMENTS
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_jira_attachment(request):
    domain, headers = get_jira_creds(request.user)
    if not domain:
        return Response({'error': 'Jira not connected. Please connect first.'}, status=400)

    attachment_id = request.data.get('attachment_id')

    r = requests.delete(
        f'{domain}/rest/api/3/attachment/{attachment_id}',
        headers=headers
    )

    if r.status_code == 204:
        return JsonResponse({'success': True, 'deleted_id': attachment_id})

    try:
        return JsonResponse(r.json(), status=r.status_code)
    except:
        return JsonResponse({'error': r.text}, status=r.status_code)

# DOWNLOAD JIRA ATTACHMENT
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def download_jira_attachment(request):
    domain, headers = get_jira_creds(request.user)
    if not domain:
        return Response({'error': 'Jira not connected. Please connect first.'}, status=400)

    attachment_id = request.data.get('attachment_id')
    filename   = request.data.get('filename', 'attachment')

    if not attachment_id:
        return Response({'error': 'attachment_id is required'}, status=400)

    r = requests.get(
        f'{domain}/rest/api/3/attachment/content/{attachment_id}',
        headers=headers,
        stream=True
    )

    if r.status_code == 200:
        response = HttpResponse(
            r.content,
            content_type=r.headers.get('Content-Type', 'application/octet-stream')
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    else:
        return Response({'error': 'Download failed', 'details': r.text}, status=r.status_code)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def proxy_attachment(request, attachment_id):
    print('USER:', request.user)
    print('AUTH:', request.auth)
    domain, headers = get_jira_creds(request.user)
    print("HEADER:", headers)
    print("DOMAIN:", domain)

    r = requests.get(
        f'{domain}/rest/api/3/attachment/content/{attachment_id}',
        headers=headers,
        stream=True
    )

    return StreamingHttpResponse(
        r.iter_content(chunk_size=8192),
        content_type=r.headers.get('Content-Type', 'application/octet-stream')
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_jira_link_types(request):
    domain, headers = get_jira_creds(request.user)
    if not domain:
        return Response({'error': 'Jira not connected. Please connect first.'}, status=400)

    r = requests.get(
        f'{domain}/rest/api/3/issueLinkType',
        headers=headers
    )

    if r.status_code != 200:
        try:
            return JsonResponse(r.json(), status=r.status_code)
        except:
            return JsonResponse({'error': r.text}, status=r.status_code)

    link_types = []
    for lt in r.json().get('issueLinkTypes', []):

        link_types.append({
            'api_name':  lt['name'],
            'label':     lt['outward'],
            'direction': 'outward'
        })
        link_types.append({
            'api_name':  lt['name'],
            'label':     lt['inward'],
            'direction': 'inward'
        })

    return JsonResponse({'link_types': link_types})

# GET ALL ASSIGNEES FOR DROP DOWN
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_assignees(request):
    domain, headers = get_jira_creds(request.user)
    if not domain:
        return Response({'error': 'Jira not connected. Please connect first.'}, status=400)

    project_key = request.GET.get('project_key')
    query = request.GET.get('query', '')
    max_results = request.GET.get('max_results', 10)

    if not project_key:
        return Response({'error': 'project_key is required'}, status=400)

    params = {
        'project': project_key,
        'maxResults': max_results,
    }

    if query:
        params['query'] = query

    r = requests.get(
        f'{domain}/rest/api/3/user/assignable/search',
        headers=headers,
        params=params
    )

    if r.status_code != 200:
        try:
            return JsonResponse(r.json(), status=r.status_code)
        except:
            return JsonResponse({'error': r.text}, status=r.status_code)

    users = r.json()

    assignees = [
        {
            'accountId': user.get('accountId'),
            'displayName': user.get('displayName'),
            'email': user.get('emailAddress'),
            'avatar': user.get('avatarUrls', {}).get('24x24'),
            'active': user.get('active'),
        }
        for user in users
        if user.get('active')
    ]

    return JsonResponse({
        'success': True,
        'assignees': assignees
    }, status=200)

# GET RECENT JIRA PROJECTS FOR DROP DOWN
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_recent_jira_projects(request):

    projects = fetch_recent_jira_projects(request.user)

    return JsonResponse({
        'success':  True,
        'projects': projects,
    }, status=200)

# GET ISSUE TYPES FOR DROPDOWN
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_issue_types(request):

    issue_types = fetch_issue_types(
        request.user,
        request.data.get("project_id")
    )

    return JsonResponse({
        'success':     True,
        'issue_types': issue_types,
    }, status=200)

# GET STATUSES DROPDOWN
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_statuses(request):

    statuses = fetch_statuses(
        request.user,
        request.data.get("project_key")
    )

    return JsonResponse({
        'success':  True,
        'statuses': statuses,
    }, status=200)

# GET ALL SPRINTS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_sprints(request):
    domain, headers = get_jira_creds(request.user)
    if not domain:
        return Response({'error': 'Jira not connected. Please connect first.'}, status=400)

    # Step 1 — get all boards
    boards_r = requests.get(
        f'{domain}/rest/agile/1.0/board',
        headers=headers,
    )

    if boards_r.status_code != 200:
        try:
            return JsonResponse(boards_r.json(), status=boards_r.status_code)
        except:
            return JsonResponse({'error': boards_r.text}, status=boards_r.status_code)

    boards = boards_r.json().get('values', [])

    # Step 2 — get sprints for each board
    all_sprints = []
    for board in boards:
        board_id   = board.get('id')
        board_name = board.get('name')

        sprints_r = requests.get(
            f'{domain}/rest/agile/1.0/board/{board_id}/sprint',
            headers=headers,
            params={'state': 'active,future'}
        )

        if sprints_r.status_code != 200:
            continue  # skip boards with no sprints

        for s in sprints_r.json().get('values', []):
            all_sprints.append({
                'id':         s.get('id'),
                'name':       s.get('name'),
                'state':      s.get('state'),
                'board_id':   board_id,
                'board_name': board_name,
            })

    return JsonResponse({
        'success':     True,
        'sprints':     all_sprints,
        'total':       len(all_sprints),
    }, status=200)

# GET SPECIFIC PROJECT SPRINTS
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_project_sprints(request):
    domain, headers = get_jira_creds(request.user)
    if not domain:
        return Response({'error': 'Jira not connected. Please connect first.'}, status=400)

    project_key = request.data.get('project_key')

    if not project_key:
        return Response({'error': 'project_key is required'}, status=400)

    # Step 1 — get board for this project
    boards_r = requests.get(
        f'{domain}/rest/agile/1.0/board',
        headers=headers,
        params={'projectKeyOrId': project_key}
    )

    if boards_r.status_code != 200:
        return JsonResponse({
            'error':   'Failed to fetch board',
            'details': boards_r.text
        }, status=boards_r.status_code)

    boards = boards_r.json().get('values', [])

    if not boards:
        return JsonResponse({
            'error': f'No board found for project {project_key}'
        }, status=404)

    board_id   = boards[0].get('id')
    board_name = boards[0].get('name')

    # Step 2 — get sprints for that board
    sprints_r = requests.get(
        f'{domain}/rest/agile/1.0/board/{board_id}/sprint',
        headers=headers,
        params={'state': 'active,future'}
    )

    if sprints_r.status_code != 200:
        return JsonResponse({
            'error':   'Failed to fetch sprints',
            'details': sprints_r.text
        }, status=sprints_r.status_code)

    sprints = [
        {
            'id':         s.get('id'),
            'name':       s.get('name'),
            'state':      s.get('state'),
            'start':      s.get('createdDate'),
            'board_id':   board_id,
            'board_name': board_name,
        }
        for s in sprints_r.json().get('values', [])
    ]

    return JsonResponse({
        'success':  True,
        'sprints':  sprints,
        'total':    len(sprints),
    }, status=200)

# DELETE ISSUE
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_jira_issue(request):
    domain, headers = get_jira_creds(request.user)
    if not domain:
        return Response({'error': 'Jira not connected. Please connect first.'}, status=400)

    issue_key = request.data.get('issue_key')
    delete_subtasks = request.data.get('delete_subtasks', 'False')

    if not issue_key:
        return Response({'error': 'issue_key is required'}, status=400)

    params = {}
    if delete_subtasks:
        params['deleteSubtasks'] = 'true'

    r = requests.delete(
        f'{domain}/rest/api/3/issue/{issue_key}',
        headers=headers,
        params=params
    )

    if r.status_code == 204:
        return Response({'success': True, 'message': f'Issue {issue_key} deleted successfully'})

    return Response(r.json(), status=r.status_code)

# ADDING ATTACHMENTS IN ISSUE
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_attachment(request):
    domain, headers = get_jira_creds(request.user)
    if not domain:
        return Response({'error': 'Jira not connected. Please connect first.'}, status=400)

    issue_key = request.data.get('issue_key')
    file = request.FILES.get('file')

    if not all([issue_key, file]):
        return Response({'error': 'issue_key and file are required'}, status=400)

    # attachment needs this extra header
    headers['X-Atlassian-Token'] = 'no-check'

    # remove Content-Type so requests sets multipart automatically
    headers.pop('Content-Type', None)

    r = requests.post(
        f'{domain}/rest/api/3/issue/{issue_key}/attachments',
        headers=headers,
        files={'file': (file.name, file.read(), file.content_type)}
    )

    if r.status_code != 200:
        try:
            return JsonResponse(r.json(), status=r.status_code)
        except:
            return JsonResponse({'error': r.text}, status=r.status_code)

    attachments = [
        {
            'id':        a.get('id'),
            'filename':  a.get('filename'),
            'size':      a.get('size'),
            'mime_type': a.get('mimeType'),
            'url':       a.get('content'),    # download URL
            'thumbnail': a.get('thumbnail'),  # for images
            'created':   a.get('created'),
        }
        for a in r.json()
    ]

    return JsonResponse({
        'success':     True,
        'attachments': attachments,
    }, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_calendar_worklogs(request, year, month):
    """
    Sync Jira worklogs into local DB (when connected), then return month from DB
    (includes both Jira-synced and manual entries).
    """
    try:
        year = int(year)
        month = int(month)
    except (TypeError, ValueError):
        return JsonResponse({"success": False, "message": "Invalid year/month."}, status=400)

    import calendar as cal
    start = datetime(year, month, 1).date()
    end = datetime(year, month, cal.monthrange(year, month)[1]).date()

    synced = 0
    sync_error = None
    domain, _headers = get_jira_creds(request.user)
    if domain:
        synced, sync_error = sync_user_worklogs_from_jira(request.user, start, end)

    qs = worklogs_for_user_month(request.user, year, month)
    logs_by_date = group_worklogs_by_date(qs)

    return JsonResponse(
        {
            "success": True,
            "logs": logs_by_date,
            "synced_from_jira": synced,
            "jira_sync_error": sync_error,
            "source": "database",
        },
        status=200,
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_worklog_view(request):
    user = request.user

    source = (request.data.get("source") or "").strip().lower()
    is_manual = source == "manual" or str(request.data.get("manual", "")).lower() in ("1", "true", "yes")

    issue_key = (request.data.get("issue_key") or "").strip()
    start_date = request.data.get("start_date")   # "07/22/2026"
    start_time = request.data.get("start_time")    # "8:00 am"
    end_date = request.data.get("end_date")        # "07/22/2026"
    end_time = request.data.get("end_time")         # "4:00 pm"
    comment = request.data.get("worklog_description", "")
    summary = (request.data.get("summary") or "").strip()

    if is_manual and not issue_key:
        issue_key = "MANUAL"

    if not all([issue_key, start_date, start_time, end_date, end_time]):
        return Response({"success": False, "message": "Issue, start and end time are required."}, status=400)

    try:
        started_dt = datetime.strptime(f"{start_date} {start_time}", "%m/%d/%Y %I:%M %p")
        ended_dt = datetime.strptime(f"{end_date} {end_time}", "%m/%d/%Y %I:%M %p")
    except ValueError:
        return Response({"success": False, "message": "Invalid date/time format."}, status=400)

    if ended_dt <= started_dt:
        return Response({"success": False, "message": "End time can not be before the start time."}, status=400)

    pk_tz = timezone(timedelta(hours=5))
    started_dt = started_dt.replace(tzinfo=pk_tz)
    ended_dt = ended_dt.replace(tzinfo=pk_tz)
    time_spent_seconds = int((ended_dt - started_dt).total_seconds())

    if is_manual:
        try:
            row = create_manual_worklog(
                user=user,
                issue_key=issue_key,
                started=started_dt,
                ended=ended_dt,
                comment=comment,
                summary=summary or issue_key,
                created_by=user,
            )
        except ValueError as exc:
            return Response({"success": False, "message": str(exc)}, status=400)
        return Response(
            {
                "success": True,
                "status": 201,
                "message": "Manual worklog saved.",
                "data": serialize_worklog_row(row),
            },
            status=201,
        )

    domain, headers = get_jira_creds(user)
    if not domain:
        return Response({"success": False, "message": "Jira is not connected. Please connect first."}, status=400)

    started = started_dt.strftime("%Y-%m-%dT%H:%M:%S.000%z")

    result = create_jira_worklog(
        user=user,
        issue_key=issue_key,
        started=started,
        time_spent_seconds=time_spent_seconds,
        comment=comment,
    )

    if result.get("success"):
        result["data"]["ended"] = ended_dt.isoformat()
        data = result.get("data", {})

        jira_credential = JiraCredential.objects.filter(
            auth_user_id=user
        ).first()

        Worklog.objects.update_or_create(
            jira_credential=jira_credential,
            worklog_id=str(data.get("id") or ""),
            defaults={
                "user": user,
                "source": Worklog.SOURCE_JIRA,
                "issue_key": issue_key,
                "issue_id": data.get("issueId") or "",
                "summary": summary or request.data.get("summary", ""),
                "started": started_dt,
                "ended": ended_dt,
                "time_spent_seconds": data.get("timeSpentSeconds") or time_spent_seconds,
                "comment": comment,
                "created_by": user,
            },
        )
    return Response(result, status=result.get("status", 200))

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_worklog_view(request, worklog_id):
    user = request.user

    issue_key = request.data.get("issue_key")
    start_date = request.data.get("start_date")
    start_time = request.data.get("start_time")
    end_date = request.data.get("end_date")
    end_time = request.data.get("end_time")
    comment = request.data.get("worklog_description", "")
    summary = (request.data.get("summary") or "").strip()

    if not all([issue_key, start_date, start_time, end_date, end_time]):
        return Response({"success": False, "message": "Issue, start and end date are required"}, status=400)

    try:
        started_dt = datetime.strptime(f"{start_date} {start_time}", "%m/%d/%Y %I:%M %p")
        ended_dt = datetime.strptime(f"{end_date} {end_time}", "%m/%d/%Y %I:%M %p")
    except ValueError:
        return Response({"success": False, "message": "Invalid date/time format."}, status=400)

    if ended_dt <= started_dt:
        return Response({"success": False, "message": "End time can not be before start time."}, status=400)

    time_spent_seconds = int((ended_dt - started_dt).total_seconds())
    pk_tz = timezone(timedelta(hours=5))
    started_dt = started_dt.replace(tzinfo=pk_tz)
    ended_dt = ended_dt.replace(tzinfo=pk_tz)

    local = Worklog.objects.filter(
        user=user,
        worklog_id=worklog_id,
        source=Worklog.SOURCE_MANUAL,
    ).first()
    if local or str(worklog_id).startswith("manual-"):
        row = local or Worklog.objects.filter(user=user, worklog_id=worklog_id).first()
        if not row:
            return Response({"success": False, "message": "Worklog not found."}, status=404)
        row.issue_key = issue_key
        row.summary = summary or row.summary
        row.started = started_dt
        row.ended = ended_dt
        row.time_spent_seconds = time_spent_seconds
        row.comment = comment
        row.save()
        return Response(
            {
                "success": True,
                "status": 200,
                "message": "Manual worklog updated.",
                "data": serialize_worklog_row(row),
            },
            status=200,
        )

    domain, headers = get_jira_creds(user)
    if not domain:
        return Response({"success": False, "message": "Jira is not connected. Please connect first."}, status=400)

    started = started_dt.strftime("%Y-%m-%dT%H:%M:%S.000+0000")

    result = update_jira_worklog(
        user=user,
        issue_key=issue_key,
        worklog_id=worklog_id,
        started=started,
        time_spent_seconds=time_spent_seconds,
        comment=comment,
    )

    if result.get("success"):
        result["data"]["ended"] = ended_dt.isoformat()
        data = result.get("data", {})
        jira_credential = JiraCredential.objects.filter(auth_user_id=user).first()
        if jira_credential:
            Worklog.objects.filter(
                jira_credential=jira_credential,
                worklog_id=worklog_id,
            ).update(
                user=user,
                source=Worklog.SOURCE_JIRA,
                issue_key=issue_key,
                issue_id=data.get("issueId") or "",
                summary=summary or request.data.get("summary", ""),
                started=started_dt,
                ended=ended_dt,
                time_spent_seconds=data.get("timeSpentSeconds") or time_spent_seconds,
                comment=comment,
            )
    return Response(result, status=result.get("status", 200))


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_worklog_view(request, worklog_id):
    user = request.user

    local = Worklog.objects.filter(user=user, worklog_id=worklog_id, source=Worklog.SOURCE_MANUAL).first()
    if local or str(worklog_id).startswith("manual-"):
        row = local or Worklog.objects.filter(user=user, worklog_id=worklog_id).first()
        if not row:
            return Response({"success": False, "message": "Worklog not found."}, status=404)
        row.delete()
        return Response({"success": True, "message": "Manual worklog deleted."}, status=200)

    domain, headers = get_jira_creds(user)
    if not domain:
        return Response({"success": False, "message": "Jira is not connected. Please connect first."}, status=400)

    issue_key = request.query_params.get("issue_key")
    if not issue_key:
        return Response({"success": False, "message": "issue_key query param is required."}, status=400)

    result = delete_jira_worklog(user=user, issue_key=issue_key, worklog_id=worklog_id)

    if result.get("success"):
        jira_credential = JiraCredential.objects.filter(auth_user_id=user).first()
        if jira_credential:
            Worklog.objects.filter(
                jira_credential=jira_credential,
                worklog_id=worklog_id,
            ).delete()
        Worklog.objects.filter(user=user, worklog_id=worklog_id).delete()

    return Response(result, status=result.get("status", 200))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_worklog_view(request, worklog_id):
    user = request.user

    local = Worklog.objects.filter(user=user, worklog_id=worklog_id).first()
    if local:
        return Response(
            {
                "success": True,
                "status": 200,
                "data": serialize_worklog_row(local),
            },
            status=200,
        )

    domain, headers = get_jira_creds(user)
    if not domain:
        return Response(
            {
                "success": False,
                "message": "Jira is not connected. Please connect first."
            },
            status=400
        )

    issue_key = request.query_params.get("issue_key")
    if not issue_key:
        return Response(
            {
                "success": False,
                "message": "issue_key query parameter is required."
            },
            status=400
        )

    result = get_jira_worklog(
        user=user,
        issue_key=issue_key,
        worklog_id=worklog_id,
    )

    return Response(result, status=result.get("status", 200))
