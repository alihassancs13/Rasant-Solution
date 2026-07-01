from django.urls import path
from .views import parse_cv_api

urlpatterns = [
    path('parse_cv/', parse_cv_api, name='parse_cv'),

]