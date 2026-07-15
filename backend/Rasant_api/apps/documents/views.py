from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Folder
import  os
from .serializers import FolderSerializer,FileSerializer,File
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_folder(request):
    """
    Create a new folder.
    Request body:{"name": "My Documents","parent": 1  # Optional, for subfolder}"""

    name = request.data.get('name')
    parent_id = request.data.get('parent')


    if not name or not name.strip():
        return Response(
            {'error': 'Folder name is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    name = name.strip()


    parent = None
    if parent_id:
        try:
            parent = get_object_or_404(Folder, id=parent_id, user=request.user)
        except:
            return Response(
                {'error': 'Parent folder not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    if Folder.objects.filter(user=request.user, parent=parent, name__iexact=name).exists():
        return Response(
            {'error': f"A folder with name '{name}' already exists in this location"},
            status=status.HTTP_400_BAD_REQUEST
        )
    folder = Folder.objects.create(
        name=name,
        user=request.user,
        parent=parent
    )
    serializer = FolderSerializer(folder, context={'request': request})
    return Response({
        'message': 'Folder created successfully',
        'data': serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_root_folders(request):
    """
    Get all root folders (folders with no parent).
    """
    folders = Folder.objects.filter(user=request.user, parent__isnull=True)
    serializer = FolderSerializer(folders, many=True, context={'request': request})
    return Response({
        'count': folders.count(),
        'data': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_folder_contents(request, pk):
    """
    Get all contents of a folder (subfolders + files).
    """
    try:
        folder = Folder.objects.get(id=pk, user=request.user)
    except Folder.DoesNotExist:
        return Response(
            {'error': 'Folder not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    subfolders = folder.subfolders.all()
    files = folder.files.all()
    file_count_map = {}
    for file in files:
        file_count_map[file.folder_id] = file_count_map.get(file.folder_id, 0) + 1

    subfolders_data = FolderSerializer(subfolders, many=True, context={'request': request}).data
    files_data = FileSerializer(files, many=True, context={'request': request}).data

    for folder_data in subfolders_data:
        folder_data['children_count'] = file_count_map.get(folder_data['id'], 0)

    return Response({
        'folder': FolderSerializer(folder, context={'request': request}).data,
        'subfolders': subfolders_data,
        'files': files_data
    }, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_folder(request, pk):
    """
    Update folder name.

    Request body:
    {
        "name": "New Folder Name"
    }
    """
    try:
        folder = Folder.objects.get(id=pk, user=request.user)
    except Folder.DoesNotExist:
        return Response(
            {'error': 'Folder not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    name = request.data.get('name')
    if not name or not name.strip():
        return Response(
            {'error': 'Folder name is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    name = name.strip()
    if Folder.objects.filter(
            user=request.user,
            parent=folder.parent,
            name__iexact=name
    ).exclude(id=pk).exists():
        return Response(
            {'error': f"A folder with name '{name}' already exists in this location"},
            status=status.HTTP_400_BAD_REQUEST
        )

    folder.name = name
    folder.save()

    serializer = FolderSerializer(folder, context={'request': request})
    return Response({
        'message': 'Folder updated successfully',
        'data': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_folder(request, pk):
    """
    Delete a folder.
    """
    try:
        folder = Folder.objects.get(id=pk, user=request.user)
    except Folder.DoesNotExist:
        return Response(
            {'error': 'Folder not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    folder_name = folder.name
    folder.delete()

    return Response({
        'message': f"Folder '{folder_name}' deleted successfully"
    }, status=status.HTTP_200_OK)


# ============ FILE VIEWS ============

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    """Upload a file to a folder"""
    folder_id = request.data.get('folder_id')
    uploaded_file = request.FILES.get('file')

    if not folder_id:
        return Response(
            {'error': 'folder_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        folder = Folder.objects.get(id=folder_id, user=request.user)
    except Folder.DoesNotExist:
        return Response(
            {'error': 'Folder not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if not uploaded_file:
        return Response(
            {'error': 'No file uploaded'},
            status=status.HTTP_400_BAD_REQUEST
        )
    name, extension = os.path.splitext(uploaded_file.name)
    extension = extension[1:].lower()  # Remove dot

    if not extension:
        extension = 'unknown'
    if File.objects.filter(folder=folder, name__iexact=name).exists():
        return Response(
            {'error': f"File '{name}' already exists in this folder"},
            status=status.HTTP_400_BAD_REQUEST
        )
    file_obj = File.objects.create(
        folder=folder,
        user=request.user,
        name=name,
        extension=extension,
        content=uploaded_file.read(),
        size=uploaded_file.size,
        mime_type=uploaded_file.content_type
    )

    serializer = FileSerializer(file_obj, context={'request': request})
    return Response({
        'message': 'File uploaded successfully',
        'data': serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_file(request, pk):
    """Download a file"""
    try:
        file_obj = File.objects.get(id=pk, user=request.user)
    except File.DoesNotExist:
        return Response(
            {'error': 'File not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    content_type = file_obj.mime_type or 'application/octet-stream'

    response = HttpResponse(file_obj.content, content_type=content_type)
    response['Content-Disposition'] = f'attachment; filename="{file_obj.full_name}"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def preview_file(request, pk):
    """Preview a file in browser"""
    try:
        file_obj = File.objects.get(id=pk, user=request.user)
    except File.DoesNotExist:
        return Response(
            {'error': 'File not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    content_type = file_obj.mime_type or 'application/octet-stream'

    response = HttpResponse(file_obj.content, content_type=content_type)
    response['Content-Disposition'] = f'inline; filename="{file_obj.full_name}"'
    return response


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_file(request, pk):
    """Delete a file"""
    try:
        file_obj = File.objects.get(id=pk, user=request.user)
    except File.DoesNotExist:
        return Response(
            {'error': 'File not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    file_name = file_obj.full_name
    file_obj.delete()
    return Response({
        'message': f"File '{file_name}' deleted successfully"
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_files_by_extension(request, extension):
    """Get all files with a specific extension"""
    files = File.objects.filter(
        user=request.user,
        extension__iexact=extension
    )
    serializer = FileSerializer(files, many=True, context={'request': request})
    return Response({
        'count': files.count(),
        'data': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_folders(request):
    """Get all folders only (for "Folders" filter)."""
    folders = Folder.objects.filter(user=request.user)

    # Get all files to count per folder
    files = File.objects.filter(user=request.user)
    file_count_map = {}
    for file in files:
        file_count_map[file.folder_id] = file_count_map.get(file.folder_id, 0) + 1

    serializer = FolderSerializer(folders, many=True, context={'request': request})
    folders_data = serializer.data

    # Add children_count to each folder
    for folder_data in folders_data:
        folder_data['children_count'] = file_count_map.get(folder_data['id'], 0)

    return Response({
        'data': folders_data,
        'count': folders.count()
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_files(request):
    """Get all files only (for "Files" filter)."""
    files = File.objects.filter(user=request.user)
    serializer = FileSerializer(files, many=True, context={'request': request})
    return Response({
        'data': serializer.data,
        'count': files.count()
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_items(request):
    """Get all folders and files for the user (for "All" filter)."""
    folders = Folder.objects.filter(user=request.user)
    files = File.objects.filter(user=request.user)
    file_count_map = {}
    for file in files:
        file_count_map[file.folder_id] = file_count_map.get(file.folder_id, 0) + 1

    folders_data = FolderSerializer(folders, many=True, context={'request': request}).data
    files_data = FileSerializer(files, many=True, context={'request': request}).data
    for folder_data in folders_data:
        folder_data['children_count'] = file_count_map.get(folder_data['id'], 0)

    return Response({
        'folders': folders_data,
        'files': files_data,
        'count': {
            'folders': folders.count(),
            'files': files.count(),
            'total': folders.count() + files.count()
        }
    }, status=status.HTTP_200_OK)