from rest_framework import serializers
from .models import User, Role,ContactMessage

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')

        if not email and not username:
            raise serializers.ValidationError(
                "Either email or username is required"
            )

        if not password:
            raise serializers.ValidationError(
                "Password is required"
            )

        return data

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data response"""
    role_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role_name',
            'is_active',
            'date_joined'
        ]

    def get_role_name(self, obj):
        return obj.role.name if obj.role else None

class RoleSerializer(serializers.ModelSerializer):
    """Serializer for roles"""
    class Meta:
        model = Role
        fields = ['id', 'name']
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'full_name', 'email', 'phone', 'message', 'created_at']
        read_only_fields =  ['id', 'created_at']