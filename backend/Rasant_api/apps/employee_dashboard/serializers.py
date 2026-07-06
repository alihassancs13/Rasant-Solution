from rest_framework import serializers
from .models import Employee

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        read_only_fields = ['employee_number']   # client cannot send this
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

    def validate_cnic(self, value):
        if Employee.objects.filter(cnic=value).exists():
            raise serializers.ValidationError("Employee with this CNIC already exists.")
        if not value.isdigit() or len(value) != 13:
            raise serializers.ValidationError("CNIC must be 13 digits.")
        return value

    def validate_iban_number(self, value):
        if len(value) < 15 or len(value) > 34:
            raise serializers.ValidationError("IBAN must be between 15 and 34 characters.")
        return value
class EmployeeListSerializer(serializers.ModelSerializer):
    """
    Used ONLY for GET /employees/ – excludes all file fields.
    """
    class Meta:
        model = Employee
        fields = [
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
            'iban_number',
            'account_number',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['employee_number']
class UpdateEmployeeSerializer(serializers.ModelSerializer):
    """
    Used ONLY for updating employee text fields.
    File fields are excluded – they cannot be updated via this endpoint.
    """
    class Meta:
        model = Employee
        fields = [
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