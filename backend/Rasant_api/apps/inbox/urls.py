# urls.py
from django.urls import path
from . import views


urlpatterns = [
    path('conversations/direct/', views.create_direct_conversation, name='create-direct-conversation'),
    path('conversations/group/', views.create_group_conversation, name='create-group-conversation'),
    path('sse/stream/', views.inbox_sse_stream, name='inbox-sse-stream'),
]