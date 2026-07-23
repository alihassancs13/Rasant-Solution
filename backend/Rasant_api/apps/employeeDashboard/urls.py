from django.urls import path
from . import views
from . import leave_views
from . import holiday_views

urlpatterns = [
    path('add_employee/', views.add_employee, name='add-employee'),
    path('get_employees/', views.list_employees, name='list-employees'),
    path('update_employee/<int:pk>/', views.update_employee, name='update-employee'),
    path('send_invitation/', views.send_invitation_email, name='send-invitation'),
    path('submit-cv/', views.cv_submission_view, name='submit-cv'),
    path('cv/<int:pk>/download/', views.cv_download_view, name='cv-download'),
    path('cv/<int:pk>/status/', views.cv_submission_view, name='update_cv_status'),
    path('cv/<int:pk>/delete/', views.cv_submission_view, name='delete_cv_submission'),
    path('send-email/', views.send_candidate_email_view, name='send-candidate-email'),
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
    path('salaries/employees/<int:pk>/bonus/', views.update_employee_monthly_bonus, name='employee-monthly-bonus'),
    path('salaries/recalculate-insurance/', views.check_insurance_renewals_view, name='recalculate_insurance'),
    path('employment-statuses/', views.employment_status_list, name='employment-statuses'),

    path('attendance/bulk-upload/', views.attendance_bulk_upload, name='attendance-bulk-upload'),
    path('attendance/employees/', views.employee_attendance_list, name='employee-attendance-list'),
    path('attendance/employees/<int:id>/history/', views.employee_attendance_history, name='employee-attendance-history'),
    path('attendance/<int:id>/', views.attendance_record_update, name='attendance-record-update'),

    path('attendance/me/today/', views.my_attendance_today, name='my-attendance-today'),
    path('attendance/me/check-in/', views.my_attendance_check_in, name='my-attendance-check-in'),
    path('attendance/me/check-out/', views.my_attendance_check_out, name='my-attendance-check-out'),
    path('attendance/me/overview/', views.my_attendance_overview, name='my-attendance-overview'),
    path('attendance/me/history/', views.my_attendance_history, name='my-attendance-history'),
    path('attendance/me/work-from-home/', views.my_work_from_home, name='my-work-from-home'),
    path('attendance/me/work-update/', views.my_daily_work_update, name='my-daily-work-update'),
    path('attendance/office-location/', views.set_office_location, name='set-office-location'),

    path('leave/me/', leave_views.my_leave_requests, name='my-leave-requests'),
    path('leave/', leave_views.admin_leave_requests, name='admin-leave-requests'),
    path('leave/<int:pk>/decide/', leave_views.decide_leave_request, name='decide-leave-request'),

    path('holidays/', holiday_views.company_holidays, name='company-holidays'),
    path('holidays/<int:pk>/', holiday_views.company_holiday_detail, name='company-holiday-detail'),

    path('salaries/payroll-settings/', views.payroll_settings_view, name='payroll-settings'),
]
