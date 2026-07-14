from rest_framework import serializers
from .models import Folder, File

class FolderSerializer(serializers.ModelSerializer):
    """Serializer for Folder model"""
    subfolder_count = serializers.SerializerMethodField()
    file_count = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    is_root = serializers.SerializerMethodField()

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
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_subfolder_count(self, obj):
        """Get count of subfolders"""
        return obj.subfolders.count()

    def get_file_count(self, obj):
        """Get count of files in folder"""
        return obj.files.count()

    def get_full_path(self, obj):
        """Get full path of folder"""
        return obj.full_path

    def get_is_root(self, obj):
        """Check if folder is root"""
        return obj.is_root

    def validate_name(self, value):
        """Validate folder name"""
        if not value or not value.strip():
            raise serializers.ValidationError("Folder name cannot be empty")
        if len(value) > 255:
            raise serializers.ValidationError("Folder name cannot exceed 255 characters")
        # Remove leading/trailing spaces
        return value.strip()

    def validate(self, data):
        """Validate folder creation"""
        user = self.context.get('request').user
        parent = data.get('parent')
        name = data.get('name')

        # Check if folder with same name exists in the same parent
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
        """Create folder with user from request"""
        user = self.context.get('request').user
        validated_data['user'] = user
        return super().create(validated_data)


class FileSerializer(serializers.ModelSerializer):
    """Serializer for File model"""
    size_formatted = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

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
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['user', 'size', 'created_at', 'updated_at']

    def get_size_formatted(self, obj):
        """Get formatted file size"""
        return obj.size_formatted

    def get_full_name(self, obj):
        """Get full filename with extension"""
        return obj.full_name

    def validate_name(self, value):
        """Validate file name"""
        if not value or not value.strip():
            raise serializers.ValidationError("File name cannot be empty")
        if len(value) > 255:
            raise serializers.ValidationError("File name cannot exceed 255 characters")
        return value.strip()

    def validate(self, data):
        """Validate file creation"""
        folder = data.get('folder')
        name = data.get('name')

        if File.objects.filter(
                folder=folder,
                name__iexact=name
        ).exists():
            raise serializers.ValidationError(
                f"A file with name '{name}' already exists in this folder"
            )

        return data

    def create(self, validated_data):
        """Create file with user from request"""
        user = self.context.get('request').user
        validated_data['user'] = user
        return super().create(validated_data)


