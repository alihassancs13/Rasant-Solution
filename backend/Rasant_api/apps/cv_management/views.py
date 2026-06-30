from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db.models import Q
from datetime import date
from .serializers import CVSubmissionSerializer
from .models import CVSubmission

class CVSubmissionView(APIView):
    parser_classes     = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CVSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            phone = serializer.validated_data.get('phone')
            today = date.today()

            already_submitted = CVSubmission.objects.filter(
                submitted_at__date=today
            ).filter(
                Q(email=email) | Q(phone=phone)
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
        return Response(serializer.data, status=status.HTTP_200_OK)

class CVDownloadView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        cv = get_object_or_404(CVSubmission, pk=pk)

        response = HttpResponse(bytes(cv.cv_file), content_type=cv.cv_file_type)
        response['Content-Disposition'] = f'attachment; filename="{cv.cv_file_name}"'
        return response