from django.contrib.admin import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import CVSubmissionSerializer
from rest_framework.permissions import AllowAny
from .models import CVSubmission
from datetime import date
from django.db.models import Q

class CVSubmissionView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CVSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            phone = serializer.validated_data.get('phone')  # ✅ phone_number → phone
            today = date.today()
            already_submitted = CVSubmission.objects.filter(
                submitted_at__date = today
            ).filter(
                Q(email = email) | Q(phone = phone)
            ).exists()
            if already_submitted:
                return Response(
                    {"error": "You have already submitted a CV today. Please try again tomorrow."},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            serializer.save()
            return Response(
                {"message": "Application submitted successfully.", "data": serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        cv = CVSubmission.objects.all()
        serializer = CVSubmissionSerializer(cv, many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)