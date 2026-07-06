from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db.models import Q
from datetime import date
from .serializers import CVSubmissionSerializer, JobOpeningSerializer
from .models import CVSubmission, JobType, JobOpening
from django.core.mail import send_mail
from django.conf import settings

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

    def delete(self, request, pk):
        try:
            cv = CVSubmission.objects.get(pk=pk)
        except CVSubmission.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'CV submission not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        cv.delete()
        return Response({
            'status': 'success',
            'message': 'CV submission deleted successfully.'
        }, status=status.HTTP_200_OK)

class SendCandidateEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        to_email = request.data.get('email')
        subject = request.data.get('subject')
        message = request.data.get('message')

        if not all([to_email, subject, message]):
            return Response({
                'status': 'error',
                'message': 'Email, subject, and message are required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False,
            )
            return Response({
                'status': 'success',
                'message': 'Email sent successfully.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': 'Failed to send email.',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

class JobCreateView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = JobOpeningSerializer(data=request.data)
        if serializer.is_valid():
            job_opening = serializer.save()
            return Response({
                'status': 'success',
                'message': 'Job opening created successfully.',
                'data': JobOpeningSerializer(job_opening).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'message': 'Failed to create job opening.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class JobListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if request.user and request.user.is_authenticated:
            jobs = JobOpening.objects.all()
        else:
            jobs = JobOpening.objects.filter(status__name='Published')
        serializer = JobOpeningSerializer(jobs, many=True)
        return Response({
            'status': 'success',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

class JobUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            job_opening = JobOpening.objects.get(pk=pk)
        except JobOpening.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Job opening not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = JobOpeningSerializer(job_opening, data=request.data, partial=True)
        if serializer.is_valid():
            updated_job = serializer.save()
            return Response({
                'status': 'success',
                'message': 'Job updated successfully.',
                'data': JobOpeningSerializer(updated_job).data
            }, status=status.HTTP_200_OK)

        return Response({
            'status': 'error',
            'message': 'Failed to update job.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

