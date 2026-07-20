from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import CredentialStore
from .serializer import CredentialSerializer
import base64


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