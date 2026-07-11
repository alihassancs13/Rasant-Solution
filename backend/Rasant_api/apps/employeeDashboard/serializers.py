from rest_framework import serializers
from .models import (
    Employee, CVSubmission, JobType, JobOpening, JobStatus,
    IncrementType, IncrementPolicy, CycleTiming, ApplicationMode,
)


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['employee_number']
        extra_kwargs = {
            'cnic_scan': {'required': False},
            'emergency_cnic_scan': {'required': False},
            'matric_certificate': {'required': False},
            'fsc_certificate': {'required': False},
            'university_degree': {'required': False},
            # other_course remains optional
        }

    def validate_email(self, value):
        if Employee.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Employee with this email already exists.")
        return value

    def validate_cnic(self, value):
        if Employee.objects.filter(cnic=value).exists():
            raise serializers.ValidationError("Employee with this CNIC already exists.")
        if not value.isdigit() or len(value) != 13:
            raise serializers.ValidationError("CNIC must be 13 digits.")
        return value


class EmployeeListSerializer(serializers.ModelSerializer):
    """
    Used ONLY for GET /employees/ – excludes all file fields.
    """
    class Meta:
        model = Employee
        fields = [
            "id", "employee_number", "full_name", "email", "phone_number",
            "department", "designation", "status",
            "is_active", "salary", "joined_date",
            "created_at", "updated_at",
            'name',
            'cnic',
            'present_address',
            'permanent_address',
            'gender',
            'emergency_name',
            'emergency_relation',
            'emergency_cnic',
            'emergency_phone',
            'emergency_address',
            'bank_name',
            'branch_name',
            'account_number',
        ]
        read_only_fields = ["employee_number", "created_at", "updated_at"]


class EmployeeCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['employee_number']


class UpdateEmployeeSerializer(serializers.ModelSerializer):
    """
    Used ONLY for updating employee text fields.
    File fields are excluded – they cannot be updated via this endpoint.
    """
    class Meta:
        model = Employee
        fields = [
            "full_name", "email", "phone_number", "department",
            "designation", "is_active", "salary", "status",
            "joined_date",
            'name',
            'cnic',
            'present_address',
            'permanent_address',
            'gender',
            'emergency_name',
            'emergency_relation',
            'emergency_cnic',
            'emergency_phone',
            'emergency_address',
            'bank_name',
            'branch_name',
            'branch_code',
            'account_number',
        ]
        read_only_fields = ['employee_number']


ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
MAX_SIZE = 10 * 1024 * 1024


class CVSubmissionSerializer(serializers.ModelSerializer):
    cv_file = serializers.FileField(write_only=True)
    job_title = serializers.CharField(source='job.job_title', read_only=True, default=None)

    class Meta:
        model = CVSubmission
        fields = [
            'id', 'full_name', 'email', 'phone', 'desired_position',
            'cv_file', 'cv_file_name', 'cv_file_type', 'cv_file_size',
            'submitted_at', 'cover_letter', 'application_status',
            'job', 'job_title',
        ]
        read_only_fields = ['id', 'submitted_at', 'cv_file_name', 'cv_file_type', 'cv_file_size']
        extra_kwargs = {
            'job': {'required': False, 'allow_null': True},
        }

    def validate_cv_file(self, value):
        if value.content_type not in ALLOWED_TYPES:
            raise serializers.ValidationError("Only PDF, DOC, DOCX files are allowed.")
        if value.size > MAX_SIZE:
            raise serializers.ValidationError("File size must not exceed 10MB.")
        return value

    def create(self, validated_data):
        uploaded_file = validated_data.pop('cv_file', None)
        if not uploaded_file:
            raise serializers.ValidationError({'cv_file': 'CV file is required.'})

        validated_data['cv_file'] = uploaded_file.read()
        validated_data['cv_file_name'] = uploaded_file.name
        validated_data['cv_file_type'] = uploaded_file.content_type
        validated_data['cv_file_size'] = uploaded_file.size

        if not validated_data.get('application_status'):
            validated_data['application_status_id'] = 1

        return CVSubmission.objects.create(**validated_data)

    def update(self, instance, validated_data):
        uploaded_file = validated_data.pop('cv_file', None)
        if uploaded_file:
            instance.cv_file = uploaded_file.read()
            instance.cv_file_name = uploaded_file.name
            instance.cv_file_type = uploaded_file.content_type
            instance.cv_file_size = uploaded_file.size

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class JobTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobType
        fields = ['id', 'name']


class JobStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobStatus
        fields = ['id', 'name']


class JobOpeningSerializer(serializers.ModelSerializer):
    job_type_name = serializers.CharField(source='job_type.name', read_only=True)

    class Meta:
        model = JobOpening
        fields = [
            'id',
            'job_title',
            'job_type',
            'status',
            'job_type_name',
            'department',
            'location',
            'salary_range',
            'description',
            'requirements',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class IncrementTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncrementType
        fields = ['id', 'name', 'code']


class CycleTimingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CycleTiming
        fields = ['id', 'name', 'code']


class ApplicationModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationMode
        fields = ['id', 'name', 'code']


class IncrementPolicySerializer(serializers.ModelSerializer):
    increment_type_name = serializers.CharField(source='increment_type.name', read_only=True)
    increment_type_code = serializers.CharField(source='increment_type.code', read_only=True)
    cycle_timing_name = serializers.CharField(source='cycle_timing.name', read_only=True)
    application_mode_name = serializers.CharField(source='application_mode.name', read_only=True)
    application_mode_code = serializers.CharField(source='application_mode.code', read_only=True)

    class Meta:
        model = IncrementPolicy
        fields = [
            'id', 'policy_name',
            'increment_type', 'increment_type_name', 'increment_type_code',
            'amount',
            'cycle_timing', 'cycle_timing_name',
            'next_effective_date',
            'application_mode', 'application_mode_name', 'application_mode_code',
            'is_active', 'description',
            'last_run_date', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'last_run_date', 'created_at', 'updated_at']
        extra_kwargs = {
            'description': {'required': False, 'allow_null': True, 'allow_blank': True},
            'next_effective_date': {'required': False, 'allow_null': True},
        }

    def create(self, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            validated_data['created_by'] = user
        return IncrementPolicy.objects.create(**validated_data)