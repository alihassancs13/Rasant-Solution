from django.urls import path
from .views import CVSubmissionView

urlpatterns = [
    path('submit-cv/', CVSubmissionView.as_view(), name='submit-cv'),
]