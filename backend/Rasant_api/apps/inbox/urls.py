from django.urls import path
from . import views


urlpatterns = [
    path('conversations/direct/', views.create_direct_conversation, name='create-direct-conversation'),
    path('conversations/group/', views.create_group_conversation, name='create-group-conversation'),
    path('conversations/', views.list_conversations, name='list-conversations'),
    path('users/', views.list_chat_users, name='list-chat-users'),
    path('messages/send/', views.send_message, name='send-message'),
    path('messages/<int:conversation_id>/', views.get_messages, name='get-messages'),
    path('messages/<int:conversation_id>/mark-read/', views.mark_messages_read, name='mark-messages-read'),
    path('sse/stream/', views.inbox_sse_stream, name='inbox-sse-stream'),
    path('messages/<int:message_id>/delete-for-me/', views.delete_message_for_me, name='delete-message-for-me'),
    path('messages/<int:message_id>/delete-for-everyone/', views.delete_message_for_everyone, name='delete-message-for-everyone'),
    path('conversations/<int:conversation_id>/clear/', views.clear_chat, name='clear-chat'),
    path('conversations/<int:conversation_id>/avatar/', views.update_group_avatar, name='update-group-avatar'),
    path('conversations/<int:conversation_id>/avatar/image/', views.get_group_avatar, name='get-group-avatar'),
    path('conversations/<int:conversation_id>/leave/', views.leave_group, name='leave-group'),
    path('conversations/<int:conversation_id>/add-members/', views.add_group_members, name='add-group-members'),
    path('messages/attachments/<int:attachment_id>/', views.get_attachment, name='get-attachment'),
    path('mark-offline/', views.mark_offline, name='mark-offline'),
]