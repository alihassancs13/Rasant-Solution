from django.urls import path
from . import views

urlpatterns = [
    path('add_employee/', views.add_employee, name='add-employee'),
    path('get_employees/', views.list_employees, name='list-employees'),
    path('update_employee/<int:pk>/', views.update_employee, name='update-employee'),
    path('send_invitation/', views.send_invitation_email, name='send_invitation'),
    path('submit-cv/', views.cv_submission_view, name='submit-cv'),
    path('cv/<int:pk>/download/', views.cv_download_view, name='cv-download'),
    path('cv/<int:pk>/status/', views.cv_submission_view, name='update_cv_status'),
    path('cv/<int:pk>/delete/', views.cv_submission_view, name='delete_cv_submission'),
    path('send-email/', views.send_candidate_email_view, name='send_candidate_email'),
    path('job-openings/create/', views.job_create_view, name='create_job_opening'),
    path('job-openings/', views.job_list_view, name='job_list'),
    path('job-openings/<int:pk>/update/', views.job_update_view, name='update_job_opening'),
    path('job-types/', views.job_types_view, name='job_types_list'),
    path('job-status/', views.job_status_view, name='job_status_list'),
    path('salaries/policies/', views.increment_policy_view, name='increment-policy-list'),
    path('salaries/policies/<int:pk>/', views.increment_policy_view, name='increment-policy-detail'),
    path('salaries/lookups/', views.increment_lookups_view, name='increment-lookups'),
    path('salaries/assignments/', views.policy_assignments_view, name='policy-assignments-list'),
    path('salaries/policies/<int:policy_id>/assign/', views.sync_policy_assignments_view, name='policy-assign'),
    path('salaries/force-increment/', views.force_increment_view, name='force-increment'),
    path('salaries/increment-due-today/', views.increments_due_today_view, name='force-increment'),
    path('salaries/get_employee_detail/<int:pk>/', views.get_employee_detail, name='employee_detail'),
    path('salaries/recalculate-insurance/', views.check_insurance_renewals_view, name='recalculate_insurance')

]