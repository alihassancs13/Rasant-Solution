from rest_framework import serializers
from .models import (
    Employee,
    CVSubmission,
    JobType,
    JobStatus,
    JobOpening,
    IncrementType,
    CycleTiming,
    ApplicationMode,
    IncrementPolicy,
    SalaryIncrementHistory,
    EmployeePolicyAssignment,
    Attendance,
)
import calendar
from datetime import date
from .utils import calculate_status

def calculate_next_effective_date(cycle_code, from_date=None):
    base = from_date or date.today()
    months_to_add = {'monthly': 1, 'quarterly': 3, 'annually': 12}.get(cycle_code, 1)

    month = base.month - 1 + months_to_add
    year = base.year + month // 12
    month = month % 12 + 1
    day = min(base.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


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
        return value


class EmployeeListSerializer(serializers.ModelSerializer):
    """
    Used ONLY for GET /employees/ – excludes all file fields.
    """
    raise_count = serializers.SerializerMethodField()
    net_salary = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            "id", "user", "employee_number", "full_name", "email", "phone_number",
            "department", "designation", "status",
            "is_active", "salary", "joined_date",
            "created_at", "updated_at",
            'name',
            'cnic',
            "insurance_amount",
            "tax",
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
            'net_salary',
            'raise_count',
            'increment_applied_on',
            'is_increment_pending',
            'password',
        ]
        read_only_fields = ["employee_number", "created_at", "updated_at"]

    def get_raise_count(self, obj):
        return SalaryIncrementHistory.objects.filter(employee=obj).count()

    def get_net_salary(self, obj):
        latest_deduction = obj.deduction_history.first()
        return latest_deduction.net_salary if latest_deduction else None


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
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        help_text="Password to update (leave blank to keep current)"
    )
    class Meta:
        model = Employee
        fields = [
            "full_name", "email", "phone_number", "department",
            "designation", "is_active", "salary", "status",
            "joined_date", "tax","insurance_amount",
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
            'password',
        ]
        read_only_fields = ['employee_number']

    def validate_cnic(self, value):
        if not value:
            return None

        qs = Employee.objects.filter(cnic=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Employee with this CNIC already exists.")
        return value

    def validate_password(self, value):
        """Hash password if provided and not empty"""
        if value:
            from django.contrib.auth.hashers import make_password
            return make_password(value)
        return None  # Return None to indicate no update needed

    def update(self, instance, validated_data):
        # Remove password if it's None (meaning no update needed)
        if 'password' in validated_data and validated_data['password'] is None:
            validated_data.pop('password', None)
        return super().update(instance, validated_data)

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
    cycle_timing_code = serializers.CharField(source='cycle_timing.code', read_only=True)
    application_mode_name = serializers.CharField(source='application_mode.name', read_only=True)
    application_mode_code = serializers.CharField(source='application_mode.code', read_only=True)

    class Meta:
        model = IncrementPolicy
        fields = [
            'id', 'policy_name',
            'increment_type', 'increment_type_name', 'increment_type_code',
            'amount',
            'cycle_timing', 'cycle_timing_name', 'cycle_timing_code',
            'next_effective_date',
            'application_mode', 'application_mode_name', 'application_mode_code',
            'is_active', 'description',
            'last_run_date', 'created_at', 'updated_at',
        ]

        read_only_fields = ['id', 'next_effective_date', 'last_run_date', 'created_at', 'updated_at']
        extra_kwargs = {
            'description': {'required': False, 'allow_null': True, 'allow_blank': True},
        }

    def create(self, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            validated_data['created_by'] = user

        cycle_timing = validated_data.get('cycle_timing')
        validated_data['next_effective_date'] = calculate_next_effective_date(cycle_timing.code)

        return IncrementPolicy.objects.create(**validated_data)

    def update(self, instance, validated_data):
        new_cycle = validated_data.get('cycle_timing')
        if new_cycle and new_cycle.id != instance.cycle_timing_id:
            validated_data['next_effective_date'] = calculate_next_effective_date(new_cycle.code)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class EmployeePolicyAssignmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)  # field name confirm karna hai
    policy_name = serializers.CharField(source='policy.policy_name', read_only=True)

    class Meta:
        model = EmployeePolicyAssignment
        fields = ['id', 'employee', 'employee_name', 'policy', 'policy_name', 'assigned_at']
        read_only_fields = ['id', 'assigned_at']

class EmployeeAttendanceSerializer(serializers.ModelSerializer):
    emp_no = serializers.IntegerField(source='attendance_id', read_only=True)
    dept = serializers.CharField(source='department', read_only=True)
    pct = serializers.SerializerMethodField()
    synced = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ['id', 'name', 'emp_no', 'dept', 'pct', 'synced', 'status']

    def get_pct(self, employee):
        records = employee.attendance_records.all()
        total = records.count()
        if total == 0:
            return 0
        present_count = records.filter(status__in=['present', 'late']).count()
        return round((present_count / total) * 100)

    def get_synced(self, employee):
        latest = employee.attendance_records.order_by('-date').first()
        return str(latest.date) if latest else None

    def get_status(self, employee):
        latest = employee.attendance_records.order_by('-date').first()
        return latest.status if latest else None


class AttendanceBulkRowSerializer(serializers.Serializer):
    emp_no = serializers.SlugRelatedField(
        source='employee',
        slug_field='attendance_id',
        queryset=Employee.objects.all(),
        error_messages={'does_not_exist': 'No employee found with attendance ID {value}.'},
    )
    date = serializers.DateField()
    timetable = serializers.CharField(required=False, allow_blank=True)
    clock_in = serializers.TimeField(required=False, allow_null=True)
    clock_out = serializers.TimeField(required=False, allow_null=True)

    def to_internal_value(self, data):
        data = data.copy()
        if data.get('clock_in') == '':
            data['clock_in'] = None
        if data.get('clock_out') == '':
            data['clock_out'] = None
        return super().to_internal_value(data)

    def create(self, validated_data):
        employee = validated_data['employee']
        timetable_text = validated_data.get('timetable', '')
        clock_in = validated_data.get('clock_in')

        attendance, _ = Attendance.objects.update_or_create(
            employee=employee,
            date=validated_data['date'],
            defaults={
                'timetable': timetable_text,
                'clock_in': clock_in,
                'clock_out': validated_data.get('clock_out'),
                'status': calculate_status(clock_in, timetable_text),
            },
        )
        return attendance


class AttendanceBulkUploadSerializer(serializers.Serializer):
    rows = AttendanceBulkRowSerializer(many=True)

    def validate_rows(self, value):
        if not value:
            raise serializers.ValidationError("No rows to upload.")
        return value
class AttendanceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ['id', 'date', 'timetable', 'clock_in', 'clock_out', 'status']
        read_only_fields = ['id', 'date']