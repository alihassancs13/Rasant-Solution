from django.conf import settings
from django.db import models
from django.utils import timezone

class Conversation(models.Model):

    TYPE_CHOICES = (
        ('direct', 'Direct'),
        ('group', 'Group'),
    )

    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    name = models.CharField(max_length=100, blank=True, null=True)
    avatar = models.BinaryField(null=True, blank=True)
    avatar_content_type = models.CharField(max_length=50, null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_conversations',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'conversations'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.type == 'direct':
            self.name = None
            self.avatar = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name or f'Conversation #{self.pk}'

    def get_display_name(self, current_user):
        if self.type == 'group':
            return self.name
        other_member = self.members.exclude(user=current_user).select_related('user').first()
        return other_member.user.username if other_member else 'Unknown'


class ConversationMember(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('member', 'Member'),
    )

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='members',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversation_memberships',
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    cleared_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = 'conversation_members'  # Table name
        unique_together = ('conversation', 'user')
        indexes = [
            models.Index(fields=['conversation', 'user']),
        ]

    def __str__(self):
        return f'{self.user} in {self.conversation} ({self.role})'

    @property
    def is_active_member(self):
        return self.left_at is None

    def get_message_cutoff(self):
        cutoff = self.joined_at
        if self.cleared_at and self.cleared_at > cutoff:
            cutoff = self.cleared_at
        return cutoff

    def leave(self):
        self.left_at = timezone.now()
        self.save(update_fields=['left_at'])

    def rejoin(self):
        self.left_at = None
        self.joined_at = timezone.now()
        self.save(update_fields=['left_at', 'joined_at'])

    def clear_chat(self,delete_chat=False):
        self.cleared_at = timezone.now()
        self.is_deleted = delete_chat
        self.save(update_fields=['cleared_at','is_deleted'])

    def unhide(self):
        if self.is_deleted:
            self.is_deleted = False
            self.save(update_fields=['is_deleted'])


class Message(models.Model):

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_for_everyone = models.BooleanField(default=False)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
        ]

    def __str__(self):
        return f'Msg #{self.pk} in {self.conversation_id} by {self.sender_id}'

    def soft_delete_for_everyone(self):
        self.content = 'This message was deleted'
        self.deleted_for_everyone = True
        self.save(update_fields=['content', 'deleted_for_everyone'])


class MessageReceipt(models.Model):
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='receipts',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='message_receipts',
    )
    is_delivered = models.BooleanField(default=False)
    delivered_at = models.DateTimeField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'message_receipts'
        unique_together = ('message', 'user')
        indexes = [
            models.Index(fields=['message', 'user']),
        ]

    def mark_delivered(self):
        if not self.is_delivered:
            self.is_delivered = True
            self.delivered_at = timezone.now()
            self.save(update_fields=['is_delivered', 'delivered_at'])

    def mark_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            if not self.is_delivered:
                self.is_delivered = True
                self.delivered_at = self.read_at
            self.save(update_fields=['is_read', 'read_at', 'is_delivered', 'delivered_at'])


class MessageDeleteFor(models.Model):
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='deleted_for',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='deleted_messages',
    )
    deleted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'message_delete_for'
        unique_together = ('message', 'user')
        indexes = [
            models.Index(fields=['message', 'user']),
        ]

    def __str__(self):
        return f'Msg #{self.message_id} hidden for {self.user_id}'