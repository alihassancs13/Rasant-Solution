from rest_framework import serializers
from .models import Employee,CVSubmission , JobType, JobOpening
class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['employee_number',]
        extra_kwargs = {
            'cnic_scan': {'required': True},
            'emergency_cnic_scan': {'required': True},
            'matric_certificate': {'required': True},
            'fsc_certificate': {'required': True},
            'university_degree': {'required': True},
            # other_course remains optional
        }

    def validate_email(self, value):
        if Employee.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Employee with this email already exists.")
        return value
    department_name = serializers.CharField(source="department.name", read_only=True)

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
            "department", "designation","status",
            "is_active", "salary", "joined_date",
             "created_at", "updated_at","status",
            'id',
            'employee_number',
            'name',
            'email',
            'cnic',
            'present_address',
            'permanent_address',
            'phone_number',
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
            'created_at',
            'updated_at'
        ]
        read_only_fields = ["emp_id", "created_at", "updated_at"]

class EmployeeCreateUpdateSerializer(serializers.ModelSerializer):
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
            "designation", "is_active", "salary","status",
            "joined_date",
            'name',
            'email',
            'cnic',
            'present_address',
            'permanent_address',
            'phone_number',
            'gender',
            'emergency_name',
            'emergency_relation',
            'emergency_cnic',
            'emergency_phone',
            'emergency_address',
            'bank_name',
            'branch_name',
            'branch_code',
            'iban_number',
            'account_number',
        ]
        read_only_fields = ['employee_number']


ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
MAX_SIZE = 10 * 1024 * 1024  # 10MB


class CVSubmissionSerializer(serializers.ModelSerializer):
    #  Upload ke liye normal FileField — write_only, DB mein direct nahi jaati
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

        validated_data['cv_file']      = uploaded_file.read()   #  raw bytes
        validated_data['cv_file_name'] = uploaded_file.name
        validated_data['cv_file_type'] = uploaded_file.content_type
        validated_data['cv_file_size'] = uploaded_file.size

        return CVSubmission.objects.create(**validated_data)

class JobTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobType
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