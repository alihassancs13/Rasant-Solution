# views.py
import json
import time
import logging
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from .models import Conversation, ConversationMember, Message, MessageReceipt
from .serializers import ConversationSerializer,ConversationCreateSerializer
from django.core.cache import cache
from django.http import StreamingHttpResponse, HttpResponseForbidden
from django.views.decorators.http import require_GET

logger = logging.getLogger(__name__)

User = get_user_model()


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_direct_conversation(request):
    sender = request.user
    receiver_id = request.data.get('receiver_id')

    if not receiver_id:
        return Response(
            {'error': 'receiver_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if sender.id == receiver.id:
        return Response(
            {'error': 'Cannot create a conversation with yourself'},
            status=status.HTTP_400_BAD_REQUEST
        )

    existing = Conversation.objects.filter(
        type='direct',
        members__user=sender
    ).filter(
        members__user=receiver
    ).distinct().first()

    if existing:
        return Response(
            {
                'message': 'Conversation already exists',
                'conversation': ConversationSerializer(existing, context={'request': request}).data
            },
            status=status.HTTP_200_OK
        )

    conv = Conversation.objects.create(type='direct', created_by=sender)
    ConversationMember.objects.create(conversation=conv, user=sender, role='member')
    ConversationMember.objects.create(conversation=conv, user=receiver, role='member')

    return Response(
        ConversationSerializer(conv, context={'request': request}).data,
        status=status.HTTP_201_CREATED
    )

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_group_conversation(request):
    data = request.data.copy()
    data['type'] = 'group'

    serializer = ConversationCreateSerializer(data=data, context={'request': request})
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    conversation = serializer.save()

    return Response(
        ConversationSerializer(conversation, context={'request': request}).data,
        status=status.HTTP_201_CREATED
    )

def _mark_user_online(user_id):
    cache.set(f'inbox_sse_active_{user_id}', True, timeout=60)


def _mark_user_offline(user_id):
    cache.delete(f'inbox_sse_active_{user_id}')


def _is_user_online(user_id):
    return bool(cache.get(f'inbox_sse_active_{user_id}'))


@require_GET
def inbox_sse_stream(request):
    token = request.GET.get('token')
    if not token:
        return HttpResponseForbidden('Token required')

    try:
        jwt_auth = JWTAuthentication()
        validated = jwt_auth.get_validated_token(token)
        user = jwt_auth.get_user(validated)
    except Exception:
        return HttpResponseForbidden('Invalid token')

    _mark_user_online(user.id)

    def event_stream():
        last_message_ids = {}
        sent_receipt_updates = set()
        heartbeat = 0

        member_conv_ids = list(
            ConversationMember.objects.filter(
                user=user, left_at__isnull=True
            ).values_list('conversation_id', flat=True)
        )

        for conv_id in member_conv_ids:
            last_msg = Message.objects.filter(conversation_id=conv_id).order_by('-id').first()
            if last_msg:
                last_message_ids[conv_id] = last_msg.id

        try:
            while True:
                _mark_user_online(user.id)

                member_qs = ConversationMember.objects.filter(
                    user=user, left_at__isnull=True
                ).select_related('conversation')

                for membership in member_qs:
                    conv = membership.conversation
                    last_id = last_message_ids.get(conv.id, 0)

                    new_msgs = Message.objects.filter(
                        conversation=conv,
                        id__gt=last_id
                    ).select_related('sender').order_by('id')

                    for msg in new_msgs:
                        last_message_ids[conv.id] = msg.id

                        if msg.sender_id != user.id:
                            receipt, _ = MessageReceipt.objects.get_or_create(
                                message=msg, user=user
                            )
                            if not receipt.is_delivered:
                                receipt.mark_delivered()

                        data = {
                            'id': msg.id,
                            'conversation_id': conv.id,
                            'sender': msg.sender_id,
                            'sender_name': msg.sender.get_full_name(),
                            'content': msg.content,
                            'created_at': msg.created_at.isoformat(),
                            'deleted_for_everyone': msg.deleted_for_everyone,
                        }
                        yield f"data: {json.dumps(data)}\n\n"

                    read_receipts = MessageReceipt.objects.filter(
                        message__conversation=conv,
                        message__sender=user,
                        is_read=True
                    ).exclude(id__in=sent_receipt_updates).select_related('message', 'user')

                    for receipt in read_receipts:
                        sent_receipt_updates.add(receipt.id)
                        data = {
                            'type': 'read_receipt',
                            'message_id': receipt.message_id,
                            'conversation_id': conv.id,
                            'reader_id': receipt.user_id,
                            'is_read': True,
                            'is_delivered': receipt.is_delivered,
                        }
                        yield f"data: {json.dumps(data)}\n\n"

                heartbeat += 1
                if heartbeat >= 15:
                    yield ": heartbeat\n\n"
                    heartbeat = 0

                time.sleep(1)
        except Exception:
            logger.exception('Inbox SSE stream error for user %s', user.id)
        finally:
            _mark_user_offline(user.id)

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response