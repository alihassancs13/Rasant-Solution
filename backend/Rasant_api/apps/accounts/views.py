
# Create your views here.
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializer import LoginSerializer, UserSerializer
# Create your views here.
@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    # Validate input using serializer
    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response({
            "status": False,
            "message": "Validation Failed",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data.get('email')
    username = serializer.validated_data.get('username')
    password = serializer.validated_data['password']

    # 2. Try to get user by email OR username
    try:
        if email:
            user = User.objects.get(email=email)
        elif username:
            user = User.objects.get(username=username)
        else:
            return Response({
                "status": False,
                "message": "Email or username is required"
            }, status=status.HTTP_400_BAD_REQUEST)

    except User.DoesNotExist:
        return Response({
            "status": False,
            "message": "User not found with provided credentials"
        }, status=status.HTTP_404_NOT_FOUND)

    # 3. Check password
    if not user.check_password(password):
        return Response({
            "status": False,
            "message": "Invalid password"
        }, status=status.HTTP_401_UNAUTHORIZED)

    # 5. Generate JWT tokens
    refresh = RefreshToken.for_user(user)

    # 6. Serialize user data
    user_data = UserSerializer(user).data

    return Response({
        "status": True,
        "message": "Login successful",
        "data": {
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": user_data
        }
    }, status=status.HTTP_200_OK)
