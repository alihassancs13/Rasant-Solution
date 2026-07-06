from django.urls import path
from rest_framework.views import APIView
from .views import CVSubmissionView, CVDownloadView, JobCreateView, JobListView, JobUpdateView, SendCandidateEmailView

urlpatterns = [
    path('submit-cv/', CVSubmissionView.as_view(), name='submit-cv'),
    path('cv/<int:pk>/download/', CVDownloadView.as_view()),
    path('job-openings/create/', JobCreateView.as_view(), name='create_job_opening'),
    path('job-openings/', JobListView.as_view(), name='job_list'),
    path('job-openings/<int:pk>/update/', JobUpdateView.as_view(), name='update_job_opening'),
    path('send-email/', SendCandidateEmailView.as_view(), name='send_candidate_email'),
    path('cv/<int:pk>/delete/', CVSubmissionView.as_view(), name='delete_cv_submission'),
]