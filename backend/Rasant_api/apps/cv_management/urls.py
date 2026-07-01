from django.urls import path
from rest_framework.views import APIView
from .views import CVSubmissionView, CVDownloadView, JobCreateView

urlpatterns = [
    path('submit-cv/', CVSubmissionView.as_view(), name='submit-cv'),
    path('cv/<int:pk>/download/', CVDownloadView.as_view()),
    path('job-openings/create/', JobCreateView.as_view(), name='create_job_opening'),
]