from rest_framework import serializers
from .models import Folder, File,SharedDocument
from employeeDashboard.models import Employee

class FolderSerializer(serializers.ModelSerializer):
    subfolder_count = serializers.SerializerMethodField()
    file_count = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    is_root = serializers.SerializerMethodField()
    shared_with = serializers.SerializerMethodField()   # NEW

    class Meta:
        model = Folder
        fields = [
            'id',
            'name',
            'user',
            'parent',
            'subfolder_count',
            'file_count',
            'full_path',
            'is_root',
            'shared_with',   # NEW
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_subfolder_count(self, obj):
        return obj.subfolders.count()

    def get_file_count(self, obj):
        return obj.files.count()

    def get_full_path(self, obj):
        return obj.full_path

    def get_is_root(self, obj):
        return obj.is_root

    def get_shared_with(self, obj):
        shares = SharedDocument.objects.filter(folder=obj)
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

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Folder name cannot be empty")
        if len(value) > 255:
            raise serializers.ValidationError("Folder name cannot exceed 255 characters")
        return value.strip()

    def validate(self, data):
        user = self.context.get('request').user
        parent = data.get('parent')
        name = data.get('name')

        if Folder.objects.filter(
            user=user,
            parent=parent,
            name__iexact=name
        ).exists():
            raise serializers.ValidationError(
                f"A folder with name '{name}' already exists in this location"
            )

        return data

    def create(self, validated_data):
        user = self.context.get('request').user
        validated_data['user'] = user
        return super().create(validated_data)


class FileSerializer(serializers.ModelSerializer):
    size_formatted = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    shared_with = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = [
            'id',
            'folder',
            'user',
            'name',
            'extension',
            'content',
            'size',
            'size_formatted',
            'mime_type',
            'full_name',
            'shared_with',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['user', 'size', 'created_at', 'updated_at']

    def get_size_formatted(self, obj):
        return obj.size_formatted

    def get_full_name(self, obj):
        return obj.full_name

    def get_shared_with(self, obj):
        shares = SharedDocument.objects.filter(file=obj)
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

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("File name cannot be empty")
        if len(value) > 255:
            raise serializers.ValidationError("File name cannot exceed 255 characters")
        return value.strip()

    def validate(self, data):
        folder = data.get('folder')
        name = data.get('name')
        request = self.context.get('request')
        user = request.user if request else None
        query = File.objects.filter(name__iexact=name)

        if folder:
            query = query.filter(folder=folder)
        else:
            query = query.filter(folder__isnull=True, user=user)

        if self.instance:
            query = query.exclude(id=self.instance.id)

        if query.exists():
            location = f"folder '{folder.name}'" if folder else "root"
            raise serializers.ValidationError(
                f"A file with name '{name}' already exists in {location}"
            )

        return data

    def create(self, validated_data):
        user = self.context.get('request').user
        validated_data['user'] = user
        return super().create(validated_data)