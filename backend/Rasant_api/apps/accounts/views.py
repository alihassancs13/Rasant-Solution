
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
# views.py - Updated with specific error messages

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

    # Determine what type of login attempt this is
    is_email_login = email is not None
    is_username_login = username is not None

    # Try to get user by email OR username
    try:
        if is_email_login:
            # Check if email exists in database
            if not User.objects.filter(email=email).exists():
                return Response({
                    "status": False,
                    "message": f"Email '{email}' not found in our system",
                    "error_type": "email_not_found"  # Optional: for frontend handling
                }, status=status.HTTP_404_NOT_FOUND)

            user = User.objects.get(email=email)

        elif is_username_login:
            # Check if username exists in database
            if not User.objects.filter(username=username).exists():
                return Response({
                    "status": False,
                    "message": f"Username '{username}' not found in our system",
                    "error_type": "username_not_found"  # Optional: for frontend handling
                }, status=status.HTTP_404_NOT_FOUND)

            user = User.objects.get(username=username)
        else:
            return Response({
                "status": False,
                "message": "Email or username is required"
            }, status=status.HTTP_400_BAD_REQUEST)

    except User.DoesNotExist:
        # This is a fallback, should rarely happen
        return Response({
            "status": False,
            "message": "User not found with provided credentials"
        }, status=status.HTTP_404_NOT_FOUND)

    # Check password
    if not user.check_password(password):
        return Response({
            "status": False,
            "message": "Incorrect password. Please try again.",
            "error_type": "incorrect_password"  # Optional: for frontend handling
        }, status=status.HTTP_401_UNAUTHORIZED)

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)

    # Serialize user data
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
