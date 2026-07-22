from django.urls import path
from . import views

urlpatterns = [
    path('jira/connect/', views.connect_jira),
    path('jira/create-issue/', views.create_jira_issue),
    path('jira/delete-issue/',  views.delete_jira_issue),
    path('jira/search-assignees/', views.search_assignees, name='search_assignees'),
    path('jira/get-recent-jira-projects/', views.get_recent_jira_projects, name='recent_projects'),
    path('jira/get-issue-types/', views.get_issue_types, name='get_issue_types'),
    path('jira/get-statuses/', views.get_statuses, name='get_statuses'),
    path('jira/get-all-sprints/', views.get_all_sprints, name='get_all_sprints'),
    path('jira/get-project-sprints/', views.get_project_sprints, name='get_project_sprints'),
    path('jira/add-attachment/', views.add_attachment, name='add_attachment'),
    path('jira/get-jira-link-types/', views.get_jira_link_types, name='get_jira_link_types'),
    path('jira/get-user-issues/', views.get_user_issues, name='get_user_issues'),
    path('jira/get-jira-attachments/', views.get_jira_attachments, name='get_jira_attachments'),
    path('jira/delete-jira-attachments/', views.delete_jira_attachment, name='delete_jira_attachments'),
    path('jira/download-jira-attachments/', views.download_jira_attachment, name='download_jira_attachments'),
    path('jira/get-teams/', views.get_teams, name='get_teams'),
    path('jira/issue/<str:issue_key>/', views.get_issue_detail, name='get_issue_detail'),
    path('jira/check-jira-connection/', views.check_jira_connection, name='check-jira-connection'),
    path('jira/attachment/<str:attachment_id>/', views.proxy_attachment , name='get_single_attachment'),
    path('worklogs/calendar/<int:year>/<int:month>/', views.get_calendar_worklogs, name='get_calendar_worklogs_path'),
    path('worklogs/create-worklogs/', views.create_worklog_view, name='create_worklogs'),
    path('worklogs/<str:worklog_id>/update/', views.update_worklog_view, name='update_worklogs'),
    path("worklogs/<str:worklog_id>/delete/", views.delete_worklog_view, name="delete-worklog"),
    path("worklogs/<str:worklog_id>/", views.get_worklog_view, name="get-worklog"),
]