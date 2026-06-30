from rest_framework import serializers
from .models import CVSubmission

ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
MAX_SIZE = 10 * 1024 * 1024  # 10MB


class CVSubmissionSerializer(serializers.ModelSerializer):
    # ✅ Upload ke liye normal FileField — write_only, DB mein direct nahi jaati
    cv_file = serializers.FileField(write_only=True)

    class Meta:
        model = CVSubmission
        fields = [
            'id', 'full_name', 'email', 'phone', 'desired_position',
            'cv_file', 'cv_file_name', 'cv_file_type', 'cv_file_size',
            'submitted_at', 'cover_letter',
        ]
        read_only_fields = ['id', 'submitted_at', 'cv_file_name', 'cv_file_type', 'cv_file_size']

    def validate_cv_file(self, value):
        if value.content_type not in ALLOWED_TYPES:
            raise serializers.ValidationError("Only PDF, DOC, DOCX files are allowed.")
        if value.size > MAX_SIZE:
            raise serializers.ValidationError("File size must not exceed 10MB.")
        return value

    def create(self, validated_data):
        uploaded_file = validated_data.pop('cv_file')

        validated_data['cv_file']      = uploaded_file.read()   # ✅ raw bytes
        validated_data['cv_file_name'] = uploaded_file.name
        validated_data['cv_file_type'] = uploaded_file.content_type
        validated_data['cv_file_size'] = uploaded_file.size

        return CVSubmission.objects.create(**validated_data)