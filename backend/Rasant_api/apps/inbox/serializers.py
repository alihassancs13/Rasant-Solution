from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import (
    Conversation,
    ConversationMember,
    Message,
    MessageReceipt,
    MessageDeleteFor,
)

User = get_user_model()


class UserBriefSerializer(serializers.ModelSerializer):

    role_name = serializers.CharField(source='role.name', read_only=True, default=None)
    has_avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role_name', 'has_avatar']

    def get_has_avatar(self, obj):
        return bool(obj.avatar)

class ConversationMemberSerializer(serializers.ModelSerializer):
    user = UserBriefSerializer(read_only=True)
    is_active_member = serializers.BooleanField(read_only=True)

    class Meta:
        model = ConversationMember
        fields = [
            'id',
            'conversation',
            'user',
            'role',
            'joined_at',
            'left_at',
            'cleared_at',
            'is_active_member',
        ]
        read_only_fields = ['joined_at', 'left_at', 'cleared_at']


class MessageReceiptSerializer(serializers.ModelSerializer):
    user = UserBriefSerializer(read_only=True)

    class Meta:
        model = MessageReceipt
        fields = [
            'id',
            'message',
            'user',
            'is_delivered',
            'delivered_at',
            'is_read',
            'read_at',
        ]
        read_only_fields = fields


class MessageDeleteForSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageDeleteFor
        fields = ['id', 'message', 'user', 'deleted_at']
        read_only_fields = fields


class MessageSerializer(serializers.ModelSerializer):
    sender = UserBriefSerializer(read_only=True)
    receipts = MessageReceiptSerializer(many=True, read_only=True)
    is_deleted_for_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id',
            'conversation',
            'sender',
            'content',
            'created_at',
            'deleted_for_everyone',
            'receipts',
            'is_deleted_for_me',
        ]
        read_only_fields = ['sender', 'created_at', 'deleted_for_everyone', 'receipts']

    def get_is_deleted_for_me(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.deleted_for.filter(user=request.user).exists()

    def create(self, validated_data):
        request = self.context['request']
        validated_data['sender'] = request.user
        return super().create(validated_data)


class MessageCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        request = self.context['request']
        validated_data['sender'] = request.user
        return Message.objects.create(**validated_data)


class ConversationSerializer(serializers.ModelSerializer):
    members = ConversationMemberSerializer(many=True, read_only=True)
    display_name = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    has_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id',
            'type',
            'name',
            'created_by',
            'created_at',
            'members',
            'display_name',
            'last_message',
            'unread_count',
            'has_avatar',
        ]
        read_only_fields = ['created_by', 'created_at', 'members']

    def get_display_name(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return obj.name
        return obj.get_display_name(request.user)

    def get_last_message(self, obj):
        request = self.context.get('request')
        last = obj.messages.exclude(
            deleted_for__user=request.user
        ).order_by('-created_at').first() if request else obj.messages.order_by('-created_at').first()
        if not last:
            return None
        return {
            'id': last.id,
            'content': last.content,
            'sender_id': last.sender_id,
            'created_at': last.created_at,
            'deleted_for_everyone': last.deleted_for_everyone,
        }

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        membership = obj.members.filter(user=request.user).first()
        if not membership:
            return 0
        cutoff = membership.get_message_cutoff()
        return obj.messages.filter(
            created_at__gt=cutoff
        ).exclude(
            sender=request.user
        ).exclude(
            deleted_for__user=request.user
        ).exclude(
            receipts__user=request.user, receipts__is_read=True
        ).count()

    def get_has_avatar(self, obj):
        return bool(obj.avatar)


class ConversationCreateSerializer(serializers.ModelSerializer):

    member_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
    )

    class Meta:
        model = Conversation
        fields = ['id', 'type', 'name', 'member_ids']

    def validate(self, attrs):
        conv_type = attrs.get('type')
        member_ids = attrs.get('member_ids', [])
        if conv_type == 'direct' and len(member_ids) != 1:
            raise serializers.ValidationError(
                'A direct conversation requires exactly one other member.'
            )
        if conv_type == 'group' and not attrs.get('name'):
            raise serializers.ValidationError('Group conversations require a name.')
        if conv_type == 'group' and len(member_ids) < 1:
            raise serializers.ValidationError('At least 2 members are required for a group.')
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        member_ids = validated_data.pop('member_ids')
        conversation = Conversation.objects.create(
            created_by=request.user, **validated_data
        )
        ConversationMember.objects.create(
            conversation=conversation, user=request.user, role='admin'
        )
        for user in member_ids:
            ConversationMember.objects.create(conversation=conversation, user=user)
        return conversation
