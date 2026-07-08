# Create your views here.

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Module,ContactMessage
from .serializer import LoginSerializer, UserSerializer,ContactMessageSerializer

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
                    "error_type": "email_not_found"
                }, status=status.HTTP_404_NOT_FOUND)

            user = User.objects.get(email=email)

        elif is_username_login:
            # Check if username exists in database
            if not User.objects.filter(username=username).exists():
                return Response({
                    "status": False,
                    "message": f"Username '{username}' not found in our system",
                    "error_type": "username_not_found"
                }, status=status.HTTP_404_NOT_FOUND)

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

    # Check password
    if not user.check_password(password):
        return Response({
            "status": False,
            "message": "Incorrect password. Please try again.",
            "error_type": "incorrect_password"
        }, status=status.HTTP_401_UNAUTHORIZED)

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)

    # Serialize user data
    user_data = UserSerializer(user).data

    # Get modules for the user's role
    modules = Module.objects.filter(role=user.role).values('id', 'name', 'icon') if user.role else []

    #  FIXED INDENTATION HERE
    modules_list = []
    for module in modules:
        modules_list.append({
            'id': module['id'],
            'name': module['name'],
            'icon': module.get('icon', '')  # Use .get() to avoid KeyError
        })

    return Response({
        "status": True,
        "message": "Login successful",
        "data": {
            "access_token": str(refresh.access_token),
            "refresh_token": str(refresh),
            "user": user_data,
            "modules": modules_list  # Add modules list here
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_modules(request):
    """
    Get all modules for the logged-in user based on their role
    """
    user = request.user

    # ADD THIS: Debug logging
    print(f"User: {user.username}, Role: {user.role}")

    # Check if user has a role
    if not user.role:
        return Response({
            "status": True,
            "message": "No role assigned",
            "data": {
                "modules": []
            }
        })

    # Get modules for user's role
    modules = Module.objects.filter(role=user.role).values('id', 'name', 'icon')

    # CHANGE THIS: Convert to list of dicts
    modules_list = []
    for module in modules:
        modules_list.append({
            'id': module['id'],
            'name': module['name'],
            'icon': module.get('icon', '')
        })

    return Response({
        "status": True,
        "message": "Modules fetched successfully",
        "data": {
            "modules": modules_list  # Send as list
        }
    })
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def contact_message_view(request):
    if request.method == 'POST':
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Message sent successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        messages = ContactMessage.objects.all()
        serializer = ContactMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)