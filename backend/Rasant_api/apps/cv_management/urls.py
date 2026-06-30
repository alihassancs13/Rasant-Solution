from django.urls import path
from .views import CVSubmissionView, CVDownloadView

urlpatterns = [
    path('submit-cv/', CVSubmissionView.as_view(), name='submit-cv'),
    path('cv/<int:pk>/download/', CVDownloadView.as_view()),
]