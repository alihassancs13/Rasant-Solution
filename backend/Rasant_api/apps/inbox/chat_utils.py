# chat_utils.py
#
# Shared helper functions used by both views.py (SSE stream) and
# serializers.py (REST "last_message" field), so the two never drift
# apart. Before this, views.py had its own private copy of
# _get_last_message_for_user which the serializer did NOT use — that
# mismatch was the root cause of the "deleted message still shows as
# last message after refresh" bug.

from .models import Message


def get_last_message_for_user(conv, user):
    """
    Returns the most recent message in `conv` that has NOT been
    soft-deleted (delete-for-me) for `user`. Returns None if there is
    no such message (e.g. all messages were deleted for this user, or
    the conversation is empty) so the frontend can show
    "No messages yet".
    """
    last = Message.objects.filter(conversation=conv).exclude(
        deleted_for__user=user
    ).order_by('-created_at').prefetch_related('attachments').first()

    if not last:
        return None

    return {
        'id': last.id,
        'content': last.content,
        'sender_id': last.sender_id,
        'created_at': last.created_at.isoformat(),
        'deleted_for_everyone': last.deleted_for_everyone,
       
        'attachments': [
            {'file_name': a.file_name, 'media_type': a.media_type}
            for a in last.attachments.all()
        ],
    }