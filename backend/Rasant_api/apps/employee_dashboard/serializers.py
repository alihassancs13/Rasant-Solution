from rest_framework import serializers
from .models import Employee, Department


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Employee
        fields = [
            "id", "emp_id", "full_name", "avatar", "email", "phone",
            "department", "department_name", "designation",
            "employment_status", "salary", "joined_date",
            "account_active", "created_at", "updated_at",
        ]
        read_only_fields = ["emp_id", "created_at", "updated_at"]


class EmployeeCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            "full_name", "avatar", "email", "phone", "department",
            "designation", "employment_status", "salary",
            "joined_date", "account_active",
        ]