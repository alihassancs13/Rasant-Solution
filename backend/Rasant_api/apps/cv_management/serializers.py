from rest_framework import serializers
from .models import CVSubmission

class CVSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CVSubmission
        fields = ['id', 'full_name', 'email', 'phone', 'desired_position', 'cv_file', 'submitted_at','cover_letter']
        read_only_fields = ['id', 'submitted_at']

    def validate_cv_file(self, value):
        allowed_types = ['application/pdf', 'application/msword',
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError("Only PDF, DOC, DOCX files are allowed.")
        if value.size > 5 * 1024 * 1024:  # 5MB limit
            raise serializers.ValidationError("File size must not exceed 5MB.")
        return value