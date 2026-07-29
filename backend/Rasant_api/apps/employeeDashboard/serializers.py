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
    PayrollSettings,
    SalaryDeductionHistory,
    EmploymentStatus,
    CompanyHoliday,
)
import calendar
from datetime import date
from .utils import calculate_status, calculate_late_and_overtime
from .payroll import resolve_employment_status, default_employment_status

def calculate_next_effective_date(cycle_code, from_date=None):
    base = from_date or date.today()
    months_to_add = {'monthly': 1, 'quarterly': 3, 'annually': 12}.get(cycle_code, 1)

    month = base.month - 1 + months_to_add
    year = base.year + month // 12
    month = month % 12 + 1
    day = min(base.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


class EmploymentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentStatus
        fields = ["id", "name", "code", "apply_payroll_deductions", "sort_order"]


class EmployeeStatusUpdateSerializer(serializers.ModelSerializer):
    status = serializers.PrimaryKeyRelatedField(queryset=EmploymentStatus.objects.all())

    class Meta:
        model = Employee
        fields = ['status', 'feedback']


class FlexibleEmploymentStatusField(serializers.Field):
    """Accept EmploymentStatus id, code, or name from the client."""

    def to_representation(self, value):
        if value is None:
            return None
        return {"id": value.id, "name": value.name, "code": value.code}

    def to_internal_value(self, data):
        if data in (None, ""):
            raise serializers.SkipField()
        resolved = resolve_employment_status(data)
        if not resolved:
            raise serializers.ValidationError("Invalid employment status.")
        return resolved


class EmployeeSerializer(serializers.ModelSerializer):
    status = FlexibleEmploymentStatusField(required=False, allow_null=True)
    source = serializers.CharField(write_only=True, required=False, default='admin_quick')

    class Meta:
        model = Employee
        exclude = [
            'employee_number',
            'user',
            'password',
            'cnic_scan_data', 'cnic_scan_name', 'cnic_scan_mimetype',
            'emergency_cnic_scan_data', 'emergency_cnic_scan_name', 'emergency_cnic_scan_mimetype',
            'matric_certificate_data', 'matric_certificate_name', 'matric_certificate_mimetype',
            'fsc_certificate_data', 'fsc_certificate_name', 'fsc_certificate_mimetype',
            'university_degree_data', 'university_degree_name', 'university_degree_mimetype',
            'other_course_data', 'other_course_name', 'other_course_mimetype',
            'created_at', 'updated_at',
            'is_increment_pending', 'increment_applied_on', 'current_salary',
            'next_insurance_cycle_date', 'increment_policy', 'attendance_id',
        ]
        extra_kwargs = {
            'cnic': {'required': False, 'allow_null': True, 'allow_blank': True},
            'present_address': {'required': False, 'allow_blank': True},
            'permanent_address': {'required': False, 'allow_blank': True},
            'gender': {'required': False, 'allow_null': True, 'allow_blank': True},
            'department': {'required': False, 'allow_blank': True},
            'designation': {'required': False, 'allow_blank': True},
            'salary': {'required': False},
            'tax': {'required': False},
            'insurance_amount': {'required': False},
            'joined_date': {'required': False},
            'phone_number': {'required': True, 'allow_blank': False},
            'emergency_name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'emergency_relation': {'required': False, 'allow_blank': True, 'allow_null': True},
            'emergency_cnic': {'required': False, 'allow_blank': True, 'allow_null': True},
            'emergency_phone': {'required': False, 'allow_blank': True, 'allow_null': True},
            'emergency_address': {'required': False, 'allow_blank': True, 'allow_null': True},
            'bank_name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'branch_name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'branch_code': {'required': False, 'allow_blank': True, 'allow_null': True},
            'account_number': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def validate_email(self, value):
        import re
        if not value:
            raise serializers.ValidationError("Email is required.")
        # Email format validation
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, value):
            raise serializers.ValidationError("Please enter a valid email address.")
        if len(value) > 50:
            raise serializers.ValidationError("Email must not exceed 50 characters.")

        from django.contrib.auth import get_user_model
        UserModel = get_user_model()
        if Employee.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Employee with this email already exists.")
        if UserModel.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user account with this email already exists.")
        return value

    def validate_name(self, value):
        if not value:
            raise serializers.ValidationError("Name is required.")
        if len(value) > 32:
            raise serializers.ValidationError("Name must not exceed 32 characters.")
        return value

    def validate_phone_number(self, value):
        value = (value or '').strip()
        if not value:
            raise serializers.ValidationError("Phone number is required.")
        import re
        if not re.match(r'^\d+$', value):
            raise serializers.ValidationError("Phone number must contain only numbers.")
        if len(value) > 15:
            raise serializers.ValidationError("Phone number must not exceed 15 digits.")
        return value

    def validate_salary(self, value):
        if value is None:
            raise serializers.ValidationError("Salary is required.")
        import re
        str_value = str(value)

        if '.' in str_value:
            str_value = str_value.rstrip('0').rstrip('.')
        if not re.match(r'^\d+$', str_value):
            raise serializers.ValidationError("Salary must contain only numbers.")

        if len(str_value) > 10:
            raise serializers.ValidationError("Salary must not exceed 10 digits.")
        return int(str_value)

    def validate_designation(self, value):
        if not value:
            raise serializers.ValidationError("Designation is required.")
        if len(value) > 32:
            raise serializers.ValidationError("Designation must not exceed 32 characters.")
        return value

    def validate_department(self, value):
        if not value:
            raise serializers.ValidationError("Department is required.")
        if len(value) > 32:
            raise serializers.ValidationError("Department must not exceed 32 characters.")
        return value

    def validate_cnic(self, value):
        if value in (None, ''):
            return None
        import re
        if not re.match(r'^\d+$', str(value)):
            raise serializers.ValidationError("CNIC must contain only numbers.")
        if len(str(value)) != 13:
            raise serializers.ValidationError("CNIC must be exactly 13 digits.")
        if Employee.objects.filter(cnic=value).exists():
            raise serializers.ValidationError("Employee with this CNIC already exists.")
        return value

    def validate_gender(self, value):
        if value in (None, ''):
            return None

        value_lower = value.lower()
        if value_lower not in ['male', 'female', 'other']:
            raise serializers.ValidationError("Gender must be male, female, or other.")

        return value_lower

    def validate_present_address(self, value):
        if value and len(value) > 400:
            raise serializers.ValidationError("Present address must not exceed 400 characters.")
        return value

    def validate_permanent_address(self, value):
        if value and len(value) > 400:
            raise serializers.ValidationError("Permanent address must not exceed 400 characters.")
        return value

    def validate_emergency_name(self, value):
        if value and len(value) > 32:
            raise serializers.ValidationError("Emergency contact name must not exceed 32 characters.")
        return value

    def validate_emergency_relation(self, value):
        if value and len(value) > 32:
            raise serializers.ValidationError("Emergency relation must not exceed 32 characters.")
        return value

    def validate_emergency_phone(self, value):
        if value:
            import re
            if not re.match(r'^\d+$', str(value)):
                raise serializers.ValidationError("Emergency phone number must contain only numbers.")
            if len(str(value)) > 15:
                raise serializers.ValidationError("Emergency phone number must not exceed 15 digits.")
        return value

    def validate_emergency_cnic(self, value):
        if value in (None, ''):
            return None
        import re
        if not re.match(r'^\d+$', str(value)):
            raise serializers.ValidationError("Emergency CNIC must contain only numbers.")
        if len(str(value)) != 13:
            raise serializers.ValidationError("Emergency CNIC must be exactly 13 digits.")
        return value

    def validate_emergency_address(self, value):
        if value and len(value) > 400:
            raise serializers.ValidationError("Emergency address must not exceed 400 characters.")
        return value

    def validate_bank_name(self, value):
        if value and len(value) > 32:
            raise serializers.ValidationError("Bank name must not exceed 32 characters.")
        return value

    def validate_branch_name(self, value):
        if value and len(value) > 32:
            raise serializers.ValidationError("Branch name must not exceed 32 characters.")
        return value

    def validate_account_number(self, value):
        if value and len(value) > 24:
            raise serializers.ValidationError("Account/IBAN number must not exceed 24 characters.")
        return value

    def validate(self, attrs):
        for key in ('cnic', 'emergency_cnic', 'gender'):
            if key in attrs and attrs[key] == '':
                attrs[key] = None

        source = attrs.get('source', 'admin_quick')
        self.context['source'] = source
        if source == 'user_onboarding':
            # CNIC is required for user onboarding
            if not attrs.get('cnic'):
                raise serializers.ValidationError({'cnic': 'CNIC is required.'})

            # Gender is required for user onboarding
            if not attrs.get('gender'):
                raise serializers.ValidationError({'gender': 'Gender is required.'})

            # Present address is required
            if not attrs.get('present_address'):
                raise serializers.ValidationError({'present_address': 'Present address is required.'})
            if attrs.get('present_address') and len(attrs.get('present_address')) > 400:
                raise serializers.ValidationError(
                    {'present_address': 'Present address must not exceed 400 characters.'})

            # Permanent address is required
            if not attrs.get('permanent_address'):
                raise serializers.ValidationError({'permanent_address': 'Permanent address is required.'})
            if attrs.get('permanent_address') and len(attrs.get('permanent_address')) > 400:
                raise serializers.ValidationError(
                    {'permanent_address': 'Permanent address must not exceed 400 characters.'})

            # Emergency contact is required
            if not attrs.get('emergency_name'):
                raise serializers.ValidationError({'emergency_name': 'Emergency contact name is required.'})
            if not attrs.get('emergency_relation'):
                raise serializers.ValidationError({'emergency_relation': 'Emergency relation is required.'})
            if not attrs.get('emergency_phone'):
                raise serializers.ValidationError({'emergency_phone': 'Emergency phone number is required.'})
            if not attrs.get('emergency_address'):
                raise serializers.ValidationError({'emergency_address': 'Emergency address is required.'})

            # Bank details are required
            if not attrs.get('bank_name'):
                raise serializers.ValidationError({'bank_name': 'Bank name is required.'})
            if not attrs.get('branch_name'):
                raise serializers.ValidationError({'branch_name': 'Branch name is required.'})
            if not attrs.get('account_number'):
                raise serializers.ValidationError({'account_number': 'Account/IBAN number is required.'})

        # Set defaults for admin contexts
        if source in ['admin_quick', 'admin_onboarding']:
            if not attrs.get('department'):
                attrs['department'] = 'Unassigned'
            if not attrs.get('designation'):
                attrs['designation'] = 'Unassigned'
            if not attrs.get('status'):
                attrs['status'] = default_employment_status()
            if not attrs.get('joined_date'):
                attrs['joined_date'] = date.today()
        attrs.pop('source', None)

        return attrs


class EmployeeListSerializer(serializers.ModelSerializer):
    """
    Used ONLY for GET /employees/ – excludes all file fields.
    """
    raise_count = serializers.SerializerMethodField()
    net_salary = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    status_id = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            "id", "user", "employee_number", "full_name", "email", "phone_number",
            "department", "designation", "status", "status_id",
            "is_active", "work_from_home", "salary", "joined_date",
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
        ]
        read_only_fields = ["employee_number", "created_at", "updated_at"]

    def get_status(self, obj):
        return obj.status.name if obj.status_id else None

    def get_status_id(self, obj):
        return obj.status_id

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
    status = FlexibleEmploymentStatusField(required=False, allow_null=True)

    class Meta:
        model = Employee
        fields = [
            "email", "phone_number", "department",
            "designation", "is_active", "work_from_home", "salary", "status",
            "joined_date", "tax", "insurance_amount",
            "name",
            "cnic",
            "present_address",
            "permanent_address",
            "gender",
            "emergency_name",
            "emergency_relation",
            "emergency_cnic",
            "emergency_phone",
            "emergency_address",
            "bank_name",
            "branch_name",
            "branch_code",
            "account_number",
            "password",
        ]
        extra_kwargs = {
            "cnic": {"required": False, "allow_null": True, "allow_blank": True},
            "gender": {"required": False, "allow_null": True, "allow_blank": True},
            "joined_date": {"required": False, "allow_null": True},
            "salary": {"required": False},
            "tax": {"required": False},
            "insurance_amount": {"required": False},
            "present_address": {"required": False, "allow_blank": True},
            "permanent_address": {"required": False, "allow_blank": True},
            "emergency_name": {"required": False, "allow_blank": True, "allow_null": True},
            "emergency_relation": {"required": False, "allow_blank": True, "allow_null": True},
            "emergency_cnic": {"required": False, "allow_blank": True, "allow_null": True},
            "emergency_phone": {"required": False, "allow_blank": True, "allow_null": True},
            "emergency_address": {"required": False, "allow_blank": True, "allow_null": True},
            "bank_name": {"required": False, "allow_blank": True, "allow_null": True},
            "branch_name": {"required": False, "allow_blank": True, "allow_null": True},
            "branch_code": {"required": False, "allow_blank": True, "allow_null": True},
            "account_number": {"required": False, "allow_blank": True, "allow_null": True},
        }

    def validate_cnic(self, value):
        if not value:
            return None

        qs = Employee.objects.filter(cnic=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Employee with this CNIC already exists.")
        return value

    def validate_gender(self, value):
        if value in ("", None):
            return None
        return value

    def validate_password(self, value):
        # Keep raw password; hashing/sync is handled in the view
        if value in ("", None):
            return None
        return value

    def validate(self, attrs):
        for key in ("cnic", "emergency_cnic", "gender"):
            if key in attrs and attrs[key] == "":
                attrs[key] = None
        # Keep existing values when blank — joined_date is NOT NULL in DB
        for key in ("salary", "tax", "insurance_amount", "joined_date"):
            if key in attrs and attrs[key] in ("", None):
                attrs.pop(key)
        attrs.pop("password", None)
        return attrs

    def update(self, instance, validated_data):
        validated_data.pop("password", None)
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

    def validate_job_title(self, value):
        if not value:
            raise serializers.ValidationError("Job title is required.")
        if len(value) > 32:
            raise serializers.ValidationError("Job title must not exceed 32 characters.")
        return value

    def validate_job_type(self, value):
        if not value:
            raise serializers.ValidationError("Job type is required.")
        return value

    def validate_department(self, value):
        if not value:
            raise serializers.ValidationError("Department is required.")
        if len(value) > 32:
            raise serializers.ValidationError("Department must not exceed 32 characters.")
        return value

    def validate_location(self, value):
        if not value:
            raise serializers.ValidationError("Location is required.")
        if len(value) > 50:
            raise serializers.ValidationError("Location must not exceed 50 characters.")
        return value

    def validate_salary_range(self, value):
        if value:  # Only validate if value is provided
            import re
            if not re.match(r'^\d+$', str(value)):
                raise serializers.ValidationError("Salary must contain only numbers.")
            if len(str(value)) > 10:
                raise serializers.ValidationError("Salary must not exceed 10 digits.")
        return value

    def validate_description(self, value):
        if not value:
            raise serializers.ValidationError("Description is required.")
        return value

    def validate_requirements(self, value):
        if not value:
            raise serializers.ValidationError("Requirements are required.")
        return value
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

    def validate_policy_name(self, value):
        if not value:
            raise serializers.ValidationError("Policy name is required.")
        if len(value) > 32:
            raise serializers.ValidationError("Policy name must not exceed 32 characters.")
        return value

    def validate_increment_type(self, value):
        if not value:
            raise serializers.ValidationError("Increment type is required.")
        return value

    def validate_amount(self, value):
        if value is None:
            raise serializers.ValidationError("Amount is required.")
        import re
        str_value = str(value)
        if '.' in str_value:
            str_value = str_value.rstrip('0').rstrip('.')
        if not re.match(r'^\d+$', str_value):
            raise serializers.ValidationError("Amount must contain only digits.")
        if len(str_value) > 10:
            raise serializers.ValidationError("Amount must not exceed 10 digits.")
        return value

    def validate_cycle_timing(self, value):
        if not value:
            raise serializers.ValidationError("Cycle timing is required.")
        return value

    def validate_application_mode(self, value):
        if not value:
            raise serializers.ValidationError("Application mode is required.")
        return value

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
    emp_no = serializers.SerializerMethodField()
    dept = serializers.CharField(source='department', read_only=True)
    pct = serializers.SerializerMethodField()
    synced = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    today_date = serializers.SerializerMethodField()
    today_clock_in = serializers.SerializerMethodField()
    today_clock_out = serializers.SerializerMethodField()
    today_status = serializers.SerializerMethodField()
    today_in_office = serializers.SerializerMethodField()
    today_location_label = serializers.SerializerMethodField()
    today_distance_meters = serializers.SerializerMethodField()
    today_address = serializers.SerializerMethodField()
    today_latitude = serializers.SerializerMethodField()
    today_longitude = serializers.SerializerMethodField()
    today_late_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id', 'name', 'emp_no', 'dept', 'pct', 'synced', 'status',
            'work_from_home',
            'today_date', 'today_clock_in', 'today_clock_out', 'today_status',
            'today_in_office', 'today_location_label', 'today_distance_meters', 'today_address',
            'today_latitude', 'today_longitude', 'today_late_minutes',
        ]

    def get_emp_no(self, employee):
        if employee.attendance_id is not None:
            return employee.attendance_id
        return employee.employee_number or employee.id

    def _today_record(self, employee):
        cache = getattr(self, '_today_cache', None)
        if cache is None:
            self._today_cache = {}
            cache = self._today_cache
        if employee.id not in cache:
            from datetime import date as date_cls
            today = date_cls.today()
            # Prefetch may already have records; prefer in-memory filter
            records = list(employee.attendance_records.all())
            match = next((r for r in records if r.date == today), None)
            if match is None:
                match = next(
                    (r for r in records if str(r.date) == str(today)),
                    None,
                )
            cache[employee.id] = match
        return cache[employee.id]

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
        today = self._today_record(employee)
        if today:
            return today.status
        latest = employee.attendance_records.order_by('-date').first()
        return latest.status if latest else None

    def get_today_date(self, employee):
        rec = self._today_record(employee)
        return str(rec.date) if rec else None

    def get_today_clock_in(self, employee):
        rec = self._today_record(employee)
        return str(rec.clock_in)[:8] if rec and rec.clock_in else None

    def get_today_clock_out(self, employee):
        rec = self._today_record(employee)
        return str(rec.clock_out)[:8] if rec and rec.clock_out else None

    def get_today_status(self, employee):
        rec = self._today_record(employee)
        return rec.status if rec else None

    def get_today_in_office(self, employee):
        rec = self._today_record(employee)
        return rec.check_in_in_office if rec else None

    def get_today_location_label(self, employee):
        from .geo import location_presence_label
        rec = self._today_record(employee)
        if not rec:
            return None
        return location_presence_label(
            rec.check_in_in_office,
            bool(getattr(employee, "work_from_home", False)),
        )

    def get_today_distance_meters(self, employee):
        rec = self._today_record(employee)
        return rec.check_in_distance_meters if rec else None

    def get_today_address(self, employee):
        rec = self._today_record(employee)
        return (rec.check_in_address or '') if rec else ''

    def get_today_latitude(self, employee):
        rec = self._today_record(employee)
        return str(rec.check_in_latitude) if rec and rec.check_in_latitude is not None else None

    def get_today_longitude(self, employee):
        rec = self._today_record(employee)
        return str(rec.check_in_longitude) if rec and rec.check_in_longitude is not None else None

    def get_today_late_minutes(self, employee):
        rec = self._today_record(employee)
        return rec.late_minutes if rec else None


class AttendanceBulkRowSerializer(serializers.Serializer):
    emp_no = serializers.SlugRelatedField(
        source='employee',
        slug_field='attendance_id',
        queryset=Employee.objects.all(),
        error_messages={'does_not_exist': 'No employee found with attendance ID {value}.'},
    )
    date = serializers.DateField(input_formats=[
        '%m/%d/%Y', '%d-%m-%Y', '%m/%d/%y', '%d-%m-%y',
        '%d/%m/%Y', '%Y-%m-%d', 'iso-8601',
    ])
    timetable = serializers.CharField(required=False, allow_blank=True)
    clock_in = serializers.TimeField(required=False, allow_null=True, input_formats=['%I:%M %p', '%H:%M:%S', '%H:%M', 'iso-8601'])
    clock_out = serializers.TimeField(required=False, allow_null=True, input_formats=['%I:%M %p', '%H:%M:%S', '%H:%M', 'iso-8601'])

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
        clock_out = validated_data.get('clock_out')

        # Weekends & company holidays: no late/OT calc; unpaid absents are ignored in payroll
        from .holidays import is_non_working_day

        record_date = validated_data['date']
        non_working = is_non_working_day(record_date)

        grace_minutes = PayrollSettings.get_settings().grace_minutes

        if non_working:
            if clock_in:
                status_value = 'present' if clock_out else 'late'
                late_minutes, overtime_hours = None, 0
                is_paid = True
            else:
                # Company holiday → holiday; weekend with no punches → absent (not deducted)
                status_value = 'holiday' if CompanyHoliday.objects.filter(date=record_date).exists() else 'absent'
                late_minutes, overtime_hours = None, 0
                is_paid = status_value == 'holiday'
        else:
            status_value = calculate_status(clock_in, clock_out, timetable_text, grace_minutes)
            late_minutes, overtime_hours = calculate_late_and_overtime(
                clock_in, clock_out, timetable_text, grace_minutes
            )
            is_paid = status_value != 'absent'

        attendance, _ = Attendance.objects.update_or_create(
            employee=employee,
            date=record_date,
            defaults={
                'timetable': timetable_text,
                'clock_in': clock_in,
                'clock_out': clock_out,
                'status': status_value,
                'late_minutes': late_minutes,
                'overtime_hours': overtime_hours,
                'is_paid': is_paid,
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
    check_in_location_label = serializers.SerializerMethodField()
    check_out_location_label = serializers.SerializerMethodField()
    work_from_home = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = [
            'id', 'date', 'timetable', 'clock_in', 'clock_out', 'status',
            'late_minutes', 'overtime_hours', 'is_paid',
            'check_in_latitude', 'check_in_longitude', 'check_in_address',
            'check_in_in_office', 'check_in_distance_meters', 'check_in_location_label',
            'check_out_latitude', 'check_out_longitude', 'check_out_address',
            'check_out_in_office', 'check_out_distance_meters', 'check_out_location_label',
            'work_from_home',
        ]
        read_only_fields = ['id', 'date']

    def _wfh(self, obj):
        employee = getattr(obj, "employee", None)
        return bool(getattr(employee, "work_from_home", False)) if employee else False

    def get_work_from_home(self, obj):
        return self._wfh(obj)

    def get_check_in_location_label(self, obj):
        from .geo import location_presence_label
        return location_presence_label(obj.check_in_in_office, self._wfh(obj))

    def get_check_out_location_label(self, obj):
        from .geo import location_presence_label
        return location_presence_label(obj.check_out_in_office, self._wfh(obj))

    def update(self, instance, validated_data):
        status_value = validated_data.get('status', instance.status)
        if status_value == 'holiday':
            validated_data.setdefault('is_paid', True)
            validated_data.setdefault('late_minutes', 0)
        return super().update(instance, validated_data)

class PayrollSettingsSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True, default=None)
    office_configured = serializers.BooleanField(read_only=True)

    class Meta:
        model = PayrollSettings
        fields = [
            'id',
            'grace_minutes',
            'allowed_leaves_per_month',
            'allowed_absents_per_month',
            'overtime_rate_per_hour',
            'late_count_threshold',
            'default_timetable',
            'office_latitude',
            'office_longitude',
            'office_radius_meters',
            'office_address',
            'office_set_at',
            'office_configured',
            'updated_by', 'updated_by_name', 'updated_at',
        ]
        read_only_fields = [
            'id', 'updated_by', 'updated_by_name', 'updated_at',
            'office_set_at', 'office_configured',
        ]

    def validate_grace_minutes(self, value):
        if value is not None:
            import re
            if not re.match(r'^\d+$', str(value)):
                raise serializers.ValidationError("Grace minutes must contain only numbers.")
            if int(value) > 480:
                raise serializers.ValidationError("Grace minutes must not exceed 480.")
        return value

    def validate_allowed_leaves_per_month(self, value):
        if value is not None:
            import re
            if not re.match(r'^\d+$', str(value)):
                raise serializers.ValidationError("Allowed leaves per month must contain only numbers.")
            if int(value) > 31:
                raise serializers.ValidationError("Allowed leaves per month must not exceed 31.")
        return value

    def validate_allowed_absents_per_month(self, value):
        if value is not None:
            import re
            if not re.match(r'^\d+$', str(value)):
                raise serializers.ValidationError("Allowed absents per month must contain only numbers.")
            if int(value) > 31:
                raise serializers.ValidationError("Allowed absents per month must not exceed 31.")
        return value

    def validate_overtime_rate_per_hour(self, value):
        if value is not None:
            import re
            str_value = str(value)
            # Allow decimal numbers with optional decimal part
            if not re.match(r'^\d+(\.\d+)?$', str_value):
                raise serializers.ValidationError("Overtime rate per hour must contain only numbers.")
            if float(value) > 1000:
                raise serializers.ValidationError("Overtime rate per hour must not exceed 1000.")
        return value

    def validate_office_radius_meters(self, value):
        if value is not None:
            import re
            if not re.match(r'^\d+$', str(value)):
                raise serializers.ValidationError("Office radius meters must contain only numbers.")
            if int(value) > 5000:
                raise serializers.ValidationError("Office radius meters must not exceed 5000.")
        return value

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            validated_data['updated_by'] = user

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
class SalaryDeductionHistorySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = SalaryDeductionHistory
        fields = [
            'id', 'employee', 'employee_name', 'deduction_month',
            'total_days', 'present_days', 'paid_leave_days',
            'unpaid_leave_days', 'unpaid_absent_days',
            'late_count', 'late_penalty_days', 'late_penalty_amount',
            'overtime_hours', 'overtime_rate_applied', 'overtime_amount',
            'per_day_salary', 'half_day_salary', 'base_salary',
            'attendance_deduction_total',
            'gross_salary', 'tax_amount', 'salary_after_tax',
            'insurance_amount', 'bonus_amount', 'net_salary',
            'is_finalized', 'created_at',
        ]
        read_only_fields = fields