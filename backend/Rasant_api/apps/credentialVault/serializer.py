from rest_framework import serializers
from .models import CredentialStore,SharedCredential
from employeeDashboard.models import Employee
import base64


class CredentialSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=8, max_length=32)
    password_display = serializers.SerializerMethodField(read_only=True)
    shared_with = serializers.SerializerMethodField(read_only=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = CredentialStore
        fields = ['id', 'name', 'link', 'username', 'email', 'password', 'password_display', 'description',
                  'shared_with', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        if not self.instance and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'Password is required.'})
        password = attrs.get('password')
        if password:
            if len(password) < 8:
                raise serializers.ValidationError({'password': 'Password must be at least 8 characters long.'})
            if len(password) > 32:
                raise serializers.ValidationError({'password': 'Password must not exceed 32 characters.'})

            # Check for uppercase, lowercase, number, and special character
            import re
            if not re.search(r'[A-Z]', password):
                raise serializers.ValidationError({'password': 'Password must contain at least one uppercase letter.'})
            if not re.search(r'[a-z]', password):
                raise serializers.ValidationError({'password': 'Password must contain at least one lowercase letter.'})
            if not re.search(r'[0-9]', password):
                raise serializers.ValidationError({'password': 'Password must contain at least one number.'})
            if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]', password):
                raise serializers.ValidationError({'password': 'Password must contain at least one special character.'})

        return attrs

    def validate_name(self, value):
        if value and len(value) > 50:
            raise serializers.ValidationError("Name must not exceed 50 characters.")
        return value

    def validate_username(self, value):
        if value and len(value) > 32:
            raise serializers.ValidationError("Username must not exceed 32 characters.")
        if self.instance:
            if CredentialStore.objects.filter(username=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("This username is already taken. Please use a different username.")
        else:
            if CredentialStore.objects.filter(username=value).exists():
                raise serializers.ValidationError("This username is already taken. Please use a different username.")
        return value

    def validate_email(self, value):
        if value:
            import re
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, value):
                raise serializers.ValidationError("Please enter a valid email address.")
            if len(value) > 32:
                raise serializers.ValidationError("Email must not exceed 32 characters.")
            if self.instance:
                if CredentialStore.objects.filter(email=value).exclude(id=self.instance.id).exists():
                    raise serializers.ValidationError("This email is already registered. Please use a different email.")
            else:
                if CredentialStore.objects.filter(email=value).exists():
                    raise serializers.ValidationError("This email is already registered. Please use a different email.")
        return value

    def validate_link(self, value):
        if value:
            import re
            url_regex = r'^(https?|ftp)://[^\s/$.?#].[^\s]*$'
            if not re.match(url_regex, value):
                raise serializers.ValidationError("Please enter a valid URL format (e.g., https://example.com).")
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
        password = validated_data.pop('password', None)
        if password:
            instance.password = base64.b64encode(password.encode()).decode()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    def get_password_display(self, obj):
        try:
            return base64.b64decode(obj.password).decode()
        except Exception:
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
                'employee_name': getattr(emp, 'name', None) if emp else None,
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