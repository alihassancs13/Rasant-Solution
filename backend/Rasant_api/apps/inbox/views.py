# views.py
import json
import time
import logging
import hashlib
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from .models import Conversation, ConversationMember, Message, MessageReceipt, MessageDeleteFor, MessageAttachment
from .serializers import ConversationSerializer,ConversationCreateSerializer, MessageSerializer, MessageAttachmentSerializer
from .chat_utils import get_last_message_for_user
from django.core.cache import cache
from django.http import StreamingHttpResponse, HttpResponseForbidden, HttpResponse
from django.views.decorators.http import require_GET
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


logger = logging.getLogger(__name__)

User = get_user_model()
MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024

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
        ConversationMember.objects.filter(
            conversation=existing, user=sender, is_deleted=True
        ).update(is_deleted=False)
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

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_chat_users(request):
    users = User.objects.exclude(id=request.user.id).select_related('role')

    data = []
    for user in users:
        full_name = f"{user.first_name} {user.last_name}".strip() or user.username
        data.append({
            'id': user.id,
            'full_name': full_name,
            'username': user.username,
            'email': user.email,
            'role': user.role.name if hasattr(user, 'role') and user.role else None,
            'has_avatar': bool(user.avatar),
        })

    return Response(data)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_conversations(request):
    conversations = Conversation.objects.filter(
        members__user=request.user,
        members__left_at__isnull=True,
        members__is_deleted=False,
    ).distinct().order_by('-created_at')

    return Response(
        ConversationSerializer(conversations, many=True, context={'request': request}).data
    )


def _deleted_for_me_ids(conv, user):
    return frozenset(
        MessageDeleteFor.objects.filter(
            message__conversation=conv, user=user
        ).values_list('message_id', flat=True)
    )


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def send_message(request):
    sender = request.user
    conversation_id = request.data.get('conversation_id')
    content = (request.data.get('content') or '').strip()
    files = request.FILES.getlist('files')

    if not conversation_id:
        return Response(
            {'error': 'conversation_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not content and not files:
        return Response(
            {'error': 'Message must have content or at least one attachment'},
            status=status.HTTP_400_BAD_REQUEST
        )

    for f in files:
        if f.size > MAX_ATTACHMENT_SIZE:
            return Response(
                {'error': f'"{f.name}" exceeds the 50MB limit'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if f.size == 0:
            return Response(
                {'error': f'"{f.name}" is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    membership = ConversationMember.objects.filter(
        conversation=conv, user=sender
    ).first()

    if not membership:
        return Response(
            {'error': "You don't have access to this chat"},
            status=status.HTTP_403_FORBIDDEN
        )

    if membership.left_at is not None:
        return Response(
            {'error': 'You have left this conversation'},
            status=status.HTTP_403_FORBIDDEN
        )

    msg = Message.objects.create(conversation=conv, sender=sender, content=content)

    for f in files:
        content_type = f.content_type or 'application/octet-stream'
        MessageAttachment.objects.create(
            message=msg,
            file_data=f.read(),
            file_name=f.name,
            content_type=content_type,
            media_type=MessageAttachment.detect_media_type(content_type, file_name=f.name),
            file_size=f.size,
        )
    other_members = ConversationMember.objects.filter(
        conversation=conv, left_at__isnull=True
    ).exclude(user=sender).select_related('user')

    receipts_to_create = []
    for member in other_members:
        is_online = _is_user_online(member.user_id)
        receipts_to_create.append(MessageReceipt(
            message=msg,
            user=member.user,
            is_delivered=is_online,
            delivered_at=timezone.now() if is_online else None,
        ))

    if receipts_to_create:
        MessageReceipt.objects.bulk_create(receipts_to_create)

    ConversationMember.objects.filter(
        conversation=conv, is_deleted=True
    ).update(is_deleted=False)

    try:
        from accounts.notifications import notify_users
        preview = (content or '').strip()
        if len(preview) > 120:
            preview = preview[:120] + '…'
        sender_name = (
            f'{sender.first_name or ""} {sender.last_name or ""}'.strip()
            or sender.username
            or 'Someone'
        )
        recipients = [m.user for m in other_members]
        notify_users(
            recipients,
            type='inbox',
            title=f'New message from {sender_name}',
            body=preview,
            link='/admin/inbox',
            actor=sender,
            payload={'conversation_id': conv.id, 'message_id': msg.id},
        )
    except Exception as notify_err:
        print(f'Inbox notification failed: {notify_err}')

    return Response(
        MessageSerializer(msg, context={'request': request}).data,
        status=status.HTTP_201_CREATED
    )

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_attachment(request, attachment_id):
    try:
        attachment = MessageAttachment.objects.select_related('message__conversation').get(id=attachment_id)
    except MessageAttachment.DoesNotExist:
        return Response({'error': 'Attachment not found'}, status=status.HTTP_404_NOT_FOUND)

    membership = ConversationMember.objects.filter(
        conversation=attachment.message.conversation, user=request.user
    ).first()

    if not membership:
        return Response({'error': "You don't have access to this chat"}, status=status.HTTP_403_FORBIDDEN)

    response = HttpResponse(bytes(attachment.file_data), content_type=attachment.content_type)
    response['Content-Disposition'] = f'inline; filename="{attachment.file_name}"'
    return response

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_messages(request, conversation_id):
    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response(
            {'error': 'Conversation does not exist'},
            status=status.HTTP_404_NOT_FOUND
        )

    membership = ConversationMember.objects.filter(
        conversation=conv, user=request.user
    ).first()

    if not membership:
        return Response(
            {'error': "You don't have access to this chat"},
            status=status.HTTP_403_FORBIDDEN
        )

    if membership.left_at is not None:
        return Response(
            {'error': 'You have left this conversation'},
            status=status.HTTP_403_FORBIDDEN
        )

    msgs = Message.objects.filter(
        conversation=conv
    ).exclude(
        deleted_for__user=request.user
    ).select_related('sender').prefetch_related('receipts').order_by('created_at')

    cutoff = membership.get_message_cutoff()
    msgs = msgs.filter(created_at__gt=cutoff)

    return Response(MessageSerializer(msgs, many=True, context={'request': request}).data)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, conversation_id):
    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response(
            {'error': 'Conversation not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    membership = ConversationMember.objects.filter(
        conversation=conv, user=request.user
    ).first()

    if not membership:
        return Response(
            {'error': "You don't have access to this chat"},
            status=status.HTTP_403_FORBIDDEN
        )

    if membership.left_at is not None:
        return Response(
            {'error': 'You have left this conversation'},
            status=status.HTTP_403_FORBIDDEN
        )

    updated_count = MessageReceipt.objects.filter(
        message__conversation=conv,
        user=request.user,
        is_read=False
    ).update(is_read=True, read_at=timezone.now(), is_delivered=True, delivered_at=timezone.now())

    return Response({
        'status': True,
        'message': f'{updated_count} messages marked as read'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_message_for_me(request, message_id):
    try:
        msg = Message.objects.get(id=message_id)
    except Message.DoesNotExist:
        return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

    membership = ConversationMember.objects.filter(
        conversation=msg.conversation, user=request.user
    ).first()

    if not membership:
        return Response({'error': "You don't have access to this chat"}, status=status.HTTP_403_FORBIDDEN)
    if membership.left_at is not None:
        return Response({'error': 'You have left this conversation'}, status=status.HTTP_403_FORBIDDEN)

    MessageDeleteFor.objects.get_or_create(message=msg, user=request.user)

    return Response({
        'status': True,
        'message': 'Message deleted for you',
        'last_message': get_last_message_for_user(msg.conversation, request.user),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_message_for_everyone(request, message_id):
    try:
        msg = Message.objects.get(id=message_id)
    except Message.DoesNotExist:
        return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

    if msg.sender_id != request.user.id:
        return Response(
            {'error': 'You can only delete your own messages for everyone'},
            status=status.HTTP_403_FORBIDDEN
        )

    membership = ConversationMember.objects.filter(
        conversation=msg.conversation, user=request.user
    ).first()
    if not membership or membership.left_at is not None:
        return Response({'error': "You don't have access to this chat"}, status=status.HTTP_403_FORBIDDEN)

    msg.soft_delete_for_everyone()

    return Response(
        MessageSerializer(msg, context={'request': request}).data,
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def clear_chat(request, conversation_id):
    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

    membership = ConversationMember.objects.filter(
        conversation=conv, user=request.user
    ).first()

    if not membership:
        return Response({'error': "You don't have access to this chat"}, status=status.HTTP_403_FORBIDDEN)
    if membership.left_at is not None:
        return Response({'error': 'You have left this conversation'}, status=status.HTTP_403_FORBIDDEN)

    delete_chat = request.data.get('delete_chat', False)
    membership.clear_chat(delete_chat=delete_chat)

    message = 'Chat deleted' if delete_chat else 'Chat cleared'
    return Response({'status': True, 'message': message}, status=status.HTTP_200_OK)

def _mark_user_online(user_id):
    cache.set(f'inbox_sse_active_{user_id}', True, timeout=60)


def _mark_user_offline(user_id):
    cache.delete(f'inbox_sse_active_{user_id}')


def _is_user_online(user_id):
    return bool(cache.get(f'inbox_sse_active_{user_id}'))


def _avatar_hash(avatar_bytes):
    if not avatar_bytes:
        return None
    return hashlib.md5(bytes(avatar_bytes)).hexdigest()


def _members_hash(conv):
    rows = ConversationMember.objects.filter(conversation=conv).order_by('user_id').values_list(
        'user_id', 'role', 'left_at'
    )
    normalized = [(uid, role, left_at.isoformat() if left_at else None) for uid, role, left_at in rows]
    return hashlib.md5(json.dumps(normalized).encode()).hexdigest()


def _current_member_avatars(conv):
    members = ConversationMember.objects.filter(
        conversation=conv, left_at__isnull=True
    ).select_related('user')
    return {m.user_id: _avatar_hash(m.user.avatar) for m in members}


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
    request.user = user

    generation = f"{time.time()}-{id(request)}"
    cache.set(f'inbox_sse_generation_{user.id}', generation, timeout=3600)

    _mark_user_online(user.id)

    MessageReceipt.objects.filter(
        user=user, is_delivered=False
    ).update(is_delivered=True, delivered_at=timezone.now())

    AVATAR_CHECK_EVERY_N = 5  # avatar/member hash checks har 5 seconds mein 1 dafa

    def event_stream():
        last_message_ids = {}
        sent_receipt_updates = set()
        sent_delivery_updates = set()
        sent_deletion_updates = set()
        last_avatar_hashes = {}
        last_members_hash = {}
        last_member_avatar_hashes = {}
        last_deleted_for_me_ids = {}
        heartbeat = 0
        iteration_count = 0

        member_conv_ids = list(
            ConversationMember.objects.filter(
                user=user, left_at__isnull=True
            ).values_list('conversation_id', flat=True)
        )
        known_conv_ids = set(member_conv_ids)

        for conv_id in member_conv_ids:
            last_msg = Message.objects.filter(conversation_id=conv_id).order_by('-id').first()
            if last_msg:
                last_message_ids[conv_id] = last_msg.id

        initial_convs = Conversation.objects.filter(id__in=member_conv_ids).only('id', 'avatar')
        for conv in initial_convs:
            last_avatar_hashes[conv.id] = _avatar_hash(conv.avatar)
            last_members_hash[conv.id] = _members_hash(conv)
            last_member_avatar_hashes[conv.id] = _current_member_avatars(conv)
            last_deleted_for_me_ids[conv.id] = _deleted_for_me_ids(conv, user)

        already_deleted_ids = set(
            Message.objects.filter(
                conversation_id__in=member_conv_ids, deleted_for_everyone=True
            ).values_list('id', flat=True)
        )
        sent_deletion_updates |= already_deleted_ids

        try:
            while True:
                current_generation = cache.get(f'inbox_sse_generation_{user.id}')
                if current_generation != generation:
                    logger.info('Stale SSE connection terminated for user %s', user.id)
                    break

                _mark_user_online(user.id)

                iteration_count += 1
                check_slow_path = (iteration_count % AVATAR_CHECK_EVERY_N == 0)

                current_conv_ids = set(
                    ConversationMember.objects.filter(
                        user=user, left_at__isnull=True
                    ).values_list('conversation_id', flat=True)
                )
                newly_added_ids = current_conv_ids - known_conv_ids
                for new_conv_id in newly_added_ids:
                    known_conv_ids.add(new_conv_id)
                    try:
                        new_conv = Conversation.objects.get(id=new_conv_id)
                        last_msg = Message.objects.filter(conversation_id=new_conv_id).order_by('-id').first()
                        last_message_ids[new_conv_id] = last_msg.id if last_msg else 0
                        last_avatar_hashes[new_conv_id] = _avatar_hash(new_conv.avatar)
                        last_members_hash[new_conv_id] = _members_hash(new_conv)
                        last_member_avatar_hashes[new_conv_id] = _current_member_avatars(new_conv)
                        last_deleted_for_me_ids[new_conv_id] = _deleted_for_me_ids(new_conv, user)
                        data = {
                            'type': 'added_to_conversation',
                            'conversation_id': new_conv_id,
                        }
                        yield f"data: {json.dumps(data)}\n\n"
                    except Conversation.DoesNotExist:
                        continue
                    except Exception:
                        logger.exception('added_to_conversation event failed for conversation %s (user %s)', new_conv_id, user.id)

                member_qs = ConversationMember.objects.filter(
                    user=user, left_at__isnull=True
                ).select_related('conversation')

                for membership in member_qs:
                    conv = membership.conversation
                    last_id = last_message_ids.get(conv.id, 0)

                    # ---------------- FAST PATH ----------------
                    # Naye messages, deletions, aur delivery/read ticks —
                    # ye sabse zaroori/real-time cheezein hain, isliye
                    # inhe avatar/member hashing se PEHLE process karo
                    # taake ticks bina kisi extra overhead ke turant nikal jayein.
                    new_msgs = Message.objects.filter(
                        conversation=conv,
                        id__gt=last_id
                    ).select_related('sender').prefetch_related('attachments').order_by('id')

                    for msg in new_msgs:
                        last_message_ids[conv.id] = msg.id
                        if msg.deleted_for_everyone:
                            sent_deletion_updates.add(msg.id)

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
                            'attachments': [
                                {
                                    'id': a.id,
                                    'file_name': a.file_name,
                                    'content_type': a.content_type,
                                    'media_type': a.media_type,
                                    'file_size': a.file_size,
                                }
                                for a in msg.attachments.all()
                            ],
                        }
                        yield f"data: {json.dumps(data)}\n\n"

                    newly_deleted = Message.objects.filter(
                        conversation=conv, deleted_for_everyone=True
                    ).exclude(id__in=sent_deletion_updates)

                    for msg in newly_deleted:
                        sent_deletion_updates.add(msg.id)
                        data = {
                            'type': 'message_deleted',
                            'id': msg.id,
                            'conversation_id': conv.id,
                            'content': msg.content,
                            'deleted_for_everyone': True,
                        }
                        yield f"data: {json.dumps(data)}\n\n"

                    delivery_receipts = MessageReceipt.objects.filter(
                        message__conversation=conv,
                        message__sender=user,
                        is_delivered=True
                    ).exclude(id__in=sent_delivery_updates).select_related('message', 'user')

                    for receipt in delivery_receipts:
                        sent_delivery_updates.add(receipt.id)
                        data = {
                            'type': 'delivery_receipt',
                            'message_id': receipt.message_id,
                            'conversation_id': conv.id,
                            'receiver_id': receipt.user_id,
                            'receiver_name': receipt.user.get_full_name() or receipt.user.username,
                            'is_delivered': True,
                            'is_read': receipt.is_read,
                        }
                        yield f"data: {json.dumps(data)}\n\n"

                    read_receipts = MessageReceipt.objects.filter(
                        message__conversation=conv,
                        message__sender=user,
                        is_read=True
                    ).exclude(id__in=sent_receipt_updates).select_related('message', 'user')

                    for receipt in read_receipts:
                        sent_receipt_updates.add(receipt.id)
                        sent_delivery_updates.add(receipt.id)
                        data = {
                            'type': 'read_receipt',
                            'message_id': receipt.message_id,
                            'conversation_id': conv.id,
                            'reader_id': receipt.user_id,
                            'reader_name': receipt.user.get_full_name() or receipt.user.username,
                            'is_read': True,
                            'is_delivered': receipt.is_delivered,
                        }
                        yield f"data: {json.dumps(data)}\n\n"

                    # ---------------- SLOW PATH ----------------
                    # Avatar / member-list / deleted-for-me checks — ye
                    # kam frequently badalte hain, is liye har second
                    # nahi, sirf har AVATAR_CHECK_EVERY_N seconds mein
                    # ek dafa chalao. Isse ticks ke fast-path par koi
                    # extra DB/blob-hashing overhead nahi padta.
                    if check_slow_path:
                        try:
                            current_members_hash = _members_hash(conv)
                            previous_members_hash = last_members_hash.get(conv.id)
                            if current_members_hash != previous_members_hash:
                                last_members_hash[conv.id] = current_members_hash
                                members_payload = ConversationSerializer(conv, context={'request': request}).data.get('members', [])
                                data = {
                                    'type': 'members_updated',
                                    'conversation_id': conv.id,
                                    'members': members_payload,
                                }
                                yield f"data: {json.dumps(data)}\n\n"
                        except Exception:
                            logger.exception('members_updated event failed for conversation %s (user %s)', conv.id, user.id)

                        current_hash = _avatar_hash(conv.avatar)
                        previous_hash = last_avatar_hashes.get(conv.id)
                        if current_hash != previous_hash:
                            last_avatar_hashes[conv.id] = current_hash
                            data = {
                                'type': 'group_avatar_updated',
                                'conversation_id': conv.id,
                                'has_avatar': bool(conv.avatar),
                            }
                            yield f"data: {json.dumps(data)}\n\n"

                        try:
                            current_member_avatars = _current_member_avatars(conv)
                            prev_member_avatars = last_member_avatar_hashes.get(conv.id, {})
                            for uid, h in current_member_avatars.items():
                                if prev_member_avatars.get(uid) != h:
                                    data = {
                                        'type': 'member_avatar_updated',
                                        'conversation_id': conv.id,
                                        'user_id': uid,
                                        'has_avatar': bool(h),
                                    }
                                    yield f"data: {json.dumps(data)}\n\n"
                            last_member_avatar_hashes[conv.id] = current_member_avatars
                        except Exception:
                            logger.exception('member_avatar_updated event failed for conversation %s (user %s)', conv.id, user.id)

                        try:
                            current_deleted_ids = _deleted_for_me_ids(conv, user)
                            previous_deleted_ids = last_deleted_for_me_ids.get(conv.id, frozenset())
                            if current_deleted_ids != previous_deleted_ids:
                                last_deleted_for_me_ids[conv.id] = current_deleted_ids
                                data = {
                                    'type': 'last_message_updated',
                                    'conversation_id': conv.id,
                                    'last_message': get_last_message_for_user(conv, user),
                                }
                                yield f"data: {json.dumps(data)}\n\n"
                        except Exception:
                            logger.exception('last_message_updated event failed for conversation %s (user %s)', conv.id, user.id)

                heartbeat += 1
                if heartbeat >= 15:
                    yield ": heartbeat\n\n"
                    heartbeat = 0

                time.sleep(1)
        except Exception:
            logger.exception('Inbox SSE stream error for user %s', user.id)
        finally:
            current_generation = cache.get(f'inbox_sse_generation_{user.id}')
            if current_generation == generation:
                _mark_user_offline(user.id)

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def update_group_avatar(request, conversation_id):
    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

    if conv.type != 'group':
        return Response(
            {'error': 'Only group conversations can have a photo'},
            status=status.HTTP_400_BAD_REQUEST
        )

    membership = ConversationMember.objects.filter(
        conversation=conv, user=request.user
    ).first()

    if not membership:
        return Response({'error': "You don't have access to this chat"}, status=status.HTTP_403_FORBIDDEN)
    if membership.left_at is not None:
        return Response({'error': 'You have left this conversation'}, status=status.HTTP_403_FORBIDDEN)


    avatar_file = request.FILES.get('avatar')
    if not avatar_file:
        return Response({'error': 'No image file provided'}, status=status.HTTP_400_BAD_REQUEST)

    if not avatar_file.content_type.startswith('image/'):
        return Response({'error': 'File must be an image'}, status=status.HTTP_400_BAD_REQUEST)

    max_size = 10 * 1024 * 1024
    if avatar_file.size > max_size:
        return Response({'error': 'Image too large (max 2MB)'}, status=status.HTTP_400_BAD_REQUEST)

    conv.avatar = avatar_file.read()
    conv.avatar_content_type = avatar_file.content_type
    conv.save(update_fields=['avatar', 'avatar_content_type'])

    return Response(
        ConversationSerializer(conv, context={'request': request}).data,
        status=status.HTTP_200_OK
    )
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_group_avatar(request, conversation_id):
    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

    membership = ConversationMember.objects.filter(
        conversation=conv, user=request.user
    ).first()
    if not membership:
        return Response({'error': "You don't have access to this chat"}, status=status.HTTP_403_FORBIDDEN)

    if not conv.avatar:
        return Response({'error': 'No avatar set'}, status=status.HTTP_404_NOT_FOUND)

    return HttpResponse(bytes(conv.avatar), content_type=conv.avatar_content_type or 'image/png')

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def leave_group(request, conversation_id):
    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

    if conv.type != 'group':
        return Response({'error': 'Only group conversations can be left'}, status=status.HTTP_400_BAD_REQUEST)

    membership = ConversationMember.objects.filter(
        conversation=conv, user=request.user
    ).first()

    if not membership:
        return Response({'error': "You don't have access to this chat"}, status=status.HTTP_403_FORBIDDEN)
    if membership.left_at is not None:
        return Response({'error': 'You have already left this group'}, status=status.HTTP_400_BAD_REQUEST)

    membership.leave()

    return Response({'status': True, 'message': 'You have left the group'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_group_members(request, conversation_id):
    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)

    if conv.type != 'group':
        return Response({'error': 'Only group conversations support adding members'}, status=status.HTTP_400_BAD_REQUEST)

    requester_membership = ConversationMember.objects.filter(
        conversation=conv, user=request.user, left_at__isnull=True
    ).first()

    if not requester_membership:
        return Response({'error': "You don't have access to this chat"}, status=status.HTTP_403_FORBIDDEN)

    if requester_membership.role != 'admin':
        return Response({'error': 'Only group admins can add members'}, status=status.HTTP_403_FORBIDDEN)

    member_ids = request.data.get('member_ids', [])
    if not member_ids or not isinstance(member_ids, list):
        return Response({'error': 'member_ids must be a non-empty list'}, status=status.HTTP_400_BAD_REQUEST)

    added_users = []

    for user_id in member_ids:
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            continue

        existing = ConversationMember.objects.filter(conversation=conv, user=target_user).first()

        if existing:
            if existing.left_at is not None:
                existing.rejoin()
                added_users.append(target_user.id)
        else:
            ConversationMember.objects.create(conversation=conv, user=target_user, role='member')
            added_users.append(target_user.id)

    return Response(
        {
            'status': True,
            'added_user_ids': added_users,
            'conversation': ConversationSerializer(conv, context={'request': request}).data,
        },
        status=status.HTTP_200_OK
    )