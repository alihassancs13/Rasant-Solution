from rest_framework import serializers
from .models import User, Role, ContactMessage, EmailSettings
from django.core.validators import EmailValidator, MinLengthValidator, MaxLengthValidator
from django.core.exceptions import ValidationError
import re


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        required=False,
        allow_blank=True,
        max_length=50,
        validators=[EmailValidator(message="Please enter a valid email address (e.g., abc@gmail.com)")]
    )
    username = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=32,
        min_length=1
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        max_length=50
    )

    def validate_email(self, value):
        if value:
            if len(value) > 50:
                raise serializers.ValidationError("Email cannot exceed 50 characters")
            try:
                EmailValidator(message="Please enter a valid email address (e.g., abc@gmail.com)")(value)
            except ValidationError as e:
                raise serializers.ValidationError("Please enter a valid email address (e.g., abc@gmail.com)")
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, value):
                raise serializers.ValidationError("Please enter a valid email address (e.g., abc@gmail.com)")

        return value

    def validate_username(self, value):
        if value:
            if len(value) > 32:
                raise serializers.ValidationError("Username cannot exceed 32 characters")
            if len(value) < 1:
                raise serializers.ValidationError("Username must be at least 1 character")
        return value

    def validate_password(self, value):
        if value:
            if len(value) < 8:
                raise serializers.ValidationError("Password must be at least 8 characters long")
            if len(value) > 50:
                raise serializers.ValidationError("Password cannot exceed 50 characters")

        return value

    def validate(self, data):
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        if not password:
            raise serializers.ValidationError({
                "password": "Password is required"
            })
        if not email and not username:
            raise serializers.ValidationError({
                "non_field_errors": "Either email or username is required"
            })
        return data


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data response"""
    role_name = serializers.SerializerMethodField()
    role_id = serializers.SerializerMethodField()
    has_avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role_name',
            'role_id',
            'is_active',
            'date_joined',
            'has_avatar',
        ]

    def get_role_name(self, obj):
        return obj.role.name if obj.role else None

    def get_role_id(self, obj):
        return obj.role_id if obj.role_id else None

    def get_has_avatar(self, obj):
        return bool(obj.avatar)


class ProfileUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)

    def validate_email(self, value):
        if not value:
            return value
        user = self.context['request'].user
        if User.objects.filter(email__iexact=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError('This email is already in use.')
        return value

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data


class RoleSerializer(serializers.ModelSerializer):
    """Serializer for roles"""
    class Meta:
        model = Role
        fields = ['id', 'name']


class ContactMessageSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='status.code', read_only=True)
    status_label = serializers.CharField(source='status.name', read_only=True)

    class Meta:
        model = ContactMessage
        fields = ['id', 'full_name', 'email', 'phone', 'message', 'status', 'status_label', 'created_at']
        read_only_fields = ['id', 'created_at']



class EmailSettingsSerializer(serializers.ModelSerializer):
    smtp_password = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
        style={'input_type': 'password'},
    )
    has_password = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = EmailSettings
        fields = [
            'id',
            'smtp_host',
            'smtp_port',
            'smtp_username',
            'smtp_password',
            'has_password',
            'use_ssl',
            'use_tls',
            'from_name',
            'from_email',
            'admin_notification_email',
            'is_active',
            'updated_at',
        ]
        read_only_fields = ['id', 'updated_at', 'has_password']

    def get_has_password(self, obj):
        return bool(obj.smtp_password)

    def update(self, instance, validated_data):
        password = validated_data.pop('smtp_password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password is not None and password != '':
            instance.smtp_password = password
        instance.save()
        return instance
