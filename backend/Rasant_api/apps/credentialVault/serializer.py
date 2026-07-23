from rest_framework import serializers
from .models import CredentialStore,SharedCredential
from employeeDashboard.models import Employee
import base64
class CredentialSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_display = serializers.SerializerMethodField(read_only=True)
    shared_with = serializers.SerializerMethodField(read_only=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)  # ADD THIS LINE

    class Meta:
        model = CredentialStore
        fields = ['id', 'name', 'link', 'username', 'email', 'password', 'password_display', 'description', 'shared_with', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_username(self, value):
        """Check if username is unique"""
        if self.instance:
            # For update operations, exclude current instance
            if CredentialStore.objects.filter(username=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("This username is already taken. Please use a different username.")
        else:
            # For create operations
            if CredentialStore.objects.filter(username=value).exists():
                raise serializers.ValidationError("This username is already taken. Please use a different username.")
        return value

    def validate_email(self, value):
        """Check if email is unique"""
        if value:  # Only validate if email is provided
            if self.instance:
                if CredentialStore.objects.filter(email=value).exclude(id=self.instance.id).exists():
                    raise serializers.ValidationError("This email is already registered. Please use a different email.")
            else:
                if CredentialStore.objects.filter(email=value).exists():
                    raise serializers.ValidationError("This email is already registered. Please use a different email.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        encoded_password = base64.b64encode(password.encode()).decode()
        credential = CredentialStore.objects.create(
            password=encoded_password,
            **validated_data
        )
        return credential

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            encoded_password = base64.b64encode(password.encode()).decode()
            instance.password = encoded_password

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def get_password_display(self, obj):
        try:
            return base64.b64decode(obj.password).decode()
        except:
            return obj.password

    def get_shared_with(self, obj):
        shares = SharedCredential.objects.filter(credential=obj)
        employee_ids = [s.employee_id for s in shares]

        if not employee_ids:
            return []

        employees = Employee.objects.filter(id__in=employee_ids)
        employee_map = {emp.id: emp for emp in employees}

        result = []
        for share in shares:
            emp = employee_map.get(share.employee_id)
            result.append({
                'employee_id': share.employee_id,
                'employee_username': getattr(emp, 'username', None) if emp else None,
                'employee_email': getattr(emp, 'email', None) if emp else None,
            })
        return result

class SharedCredentialSerializer(serializers.ModelSerializer):
    credential_name = serializers.CharField(source='credential.name', read_only=True)
    employee_username = serializers.CharField(source='employee.username', read_only=True)
    employee_email = serializers.CharField(source='employee.email', read_only=True)

    class Meta:
        model = SharedCredential
        fields = [
            'id',
            'credential',
            'credential_name',
            'employee',
            'employee_username',
            'employee_email',
            'shared_at'
        ]
        read_only_fields = ['shared_at']


class ShareCredentialSerializer(serializers.Serializer):
    credential_id = serializers.IntegerField()
    employee_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )