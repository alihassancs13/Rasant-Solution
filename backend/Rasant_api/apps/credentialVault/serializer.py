from rest_framework import serializers
from .models import CredentialStore
import base64
class CredentialSerializer(serializers.ModelSerializer):
    # Override password field to handle encoding/decoding
    password = serializers.CharField(write_only=True, required=True)
    password_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CredentialStore
        fields = ['id', 'name', 'link', 'username', 'email', 'password', 'password_display', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        # Get password and encode it
        password = validated_data.pop('password')
        encoded_password = base64.b64encode(password.encode()).decode()

        # Create credential with encoded password
        credential = CredentialStore.objects.create(
            password=encoded_password,
            **validated_data
        )
        return credential

    def update(self, instance, validated_data):
        # Update password if provided
        if 'password' in validated_data:
            password = validated_data.pop('password')
            encoded_password = base64.b64encode(password.encode()).decode()
            instance.password = encoded_password

        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def get_password_display(self, obj):
        """Return decoded password for display"""
        try:
            return base64.b64decode(obj.password).decode()
        except:
            return obj.password