from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from accounts.models import User
import base64
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
        credential = get_object_or_404(CredentialStore, id=credential_id)

        # Convert single employee_id to list
        if not isinstance(employee_ids, list):
            employee_ids = [employee_ids]
        employee_ids = list(set(employee_ids))

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_employee_credentials(request, employee_id):
    try:
        shared_credentials = SharedCredential.objects.filter(
            employee_id=employee_id
        ).select_related('credential')

        credentials = []
        for shared in shared_credentials:
            cred = shared.credential

            # Decode password from Base64
            try:
                decoded_password = base64.b64decode(cred.password).decode('utf-8')
            except:
                decoded_password = cred.password  # Fallback if not Base64

            credentials.append({
                'id': cred.id,
                'name': cred.name,
                'link': cred.link,
                'username': cred.username,
                'email': cred.email,
                'password': decoded_password,
                'shared_at': shared.shared_at,
                'created_at': cred.created_at,


            })

        return Response({
            'status': 'success',
            'employee_id': employee_id,
            'count': len(credentials),
            'credentials': credentials
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_shared_credential(request):
    """
    DELETE: Revoke/Remove a shared credential from an employee
    """
    try:
        # Get data from request
        credential_id = request.data.get('credential_id')
        employee_id = request.data.get('employee_id')

        # Validate required fields
        if not credential_id or not employee_id:
            return Response(
                {'error': 'credential_id and employee_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if credential exists
        credential = get_object_or_404(CredentialStore, id=credential_id)

        # Check if employee exists
        employee = get_object_or_404(Employee, id=employee_id)

        # Find the shared credential
        try:
            shared_credential = SharedCredential.objects.get(
                credential=credential,
                employee_id=employee_id
            )
        except SharedCredential.DoesNotExist:
            return Response(
                {'error': f'Credential is not shared with employee ID {employee_id}'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Delete the shared credential
        shared_credential.delete()

        return Response({
            'status': 'success',
            'message': f'Credential access revoked from employee {employee.username or employee.email}',
            'credential_id': credential_id,
            'employee_id': employee_id
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )