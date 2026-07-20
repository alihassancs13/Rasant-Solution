from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from accounts.models import User
from rest_framework import status
from .models import CredentialStore,SharedCredential
from .serializer import CredentialSerializer
from employeeDashboard.models import Employee

# ========== CREATE CREDENTIAL API ==========
@api_view(['POST'])
@permission_classes([AllowAny])
def create_credential(request):
    """
    POST: Create a new credential
    """
    serializer = CredentialSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({
            'status': 'success',
            'message': 'Credential created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response({
        'status': 'error',
        'message': 'Validation failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_credentials(request):
    """
    GET: Get all credentials with decoded passwords
    """
    try:
        credentials = CredentialStore.objects.all().order_by('-created_at')
        serializer = CredentialSerializer(credentials, many=True)

        return Response({
            'status': 'success',
            'count': len(serializer.data),
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_credential(request):
    """
    Share a credential with one or multiple employees
    """
    try:
        # Get data from request
        credential_id = request.data.get('credential_id')
        employee_ids = request.data.get('employee_id')

        # Validate required fields
        if not credential_id or not employee_ids:
            return Response(
                {'error': 'credential_id and employee_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if credential exists
        credential = get_object_or_404(CredentialStore, id=credential_id)

        # Convert single employee_id to list
        if not isinstance(employee_ids, list):
            employee_ids = [employee_ids]

        # Remove duplicates
        employee_ids = list(set(employee_ids))

        # Get all employees that exist
        employees = Employee.objects.filter(id__in=employee_ids)
        found_ids = set(employees.values_list('id', flat=True))
        invalid_ids = set(employee_ids) - found_ids

        if invalid_ids:
            return Response(
                {'error': f'Invalid employee IDs: {list(invalid_ids)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for already shared credentials
        already_shared = []
        for employee in employees:
            if SharedCredential.objects.filter(
                credential=credential,
                employee_id=employee.id
            ).exists():
                already_shared.append(employee.id)

        if already_shared:
            return Response(
                {'error': f'Credential already shared with employee(s): {already_shared}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create shares for all employees
        created_shares = []
        for employee in employees:
            shared_credential = SharedCredential.objects.create(
                credential=credential,
                employee_id=employee.id
            )
            created_shares.append({
                'share_id': shared_credential.id,
                'employee_id': employee.id,
                'employee_name': employee.name,
                'employee_email': employee.email,
                'shared_at': shared_credential.shared_at
            })

        # Return response
        return Response({
            'message': f'Credential shared with {len(created_shares)} employee(s)',
            'shared': created_shares
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )