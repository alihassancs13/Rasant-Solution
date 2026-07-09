from django.urls import path
from . import views
urlpatterns = [
          path('add_employee/', views.add_employee, name='add-employee'),
          path('get_employees/', views.list_employees, name='list-employees'),
          path('get_employee/<int:pk>/', views.get_employee_detail, name='employee-detail'),
          path('update_employee/<int:pk>/', views.update_employee, name='update-employee'),
          path('submit-cv/', views.cv_submission_view, name='submit-cv'),
          path('cv/<int:pk>/download/', views.cv_download_view),
          path('job-openings/create/', views.job_create_view, name='create_job_opening'),
          path('job-openings/', views.job_list_view, name='job_list'),
          path('job-openings/<int:pk>/update/', views.job_update_view, name='update_job_opening'),
          path('send-email/', views.send_candidate_email_view, name='send_candidate_email'),
          path('cv/<int:pk>/status/', views.cv_submission_view, name='delete_cv_submission'),
          path('send_invitation/', views.send_invitation_email, name='send_invitation'),
]