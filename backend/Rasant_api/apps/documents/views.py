from django.shortcuts import render

# Create your views here.
import base64
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Folder,File,SharedDocument
import  os
from employeeDashboard.models import Employee
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
    folders = Folder.objects.filter(user=request.user,parent__isnull=True)

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
    """Get only root-level folders for the user (for "All" filter)."""
    folders = Folder.objects.filter(user=request.user, parent__isnull=True)
    files = File.objects.filter(user=request.user, folder__isnull=True)
    file_count_map = {}
    for file in File.objects.filter(user=request.user):
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_file_content(request, pk):
    """
    View file content with proper format for display.
    """
    try:
        file_obj = File.objects.get(id=pk, user=request.user)
    except File.DoesNotExist:
        return Response(
            {'error': 'File not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    extension = file_obj.extension.lower()
    content = file_obj.content
    mime_type = file_obj.mime_type or 'application/octet-stream'
    file_size = file_obj.size

    # ===== TEXT FILES =====
    text_extensions = {
        'txt', 'py', 'js', 'html', 'css', 'json', 'xml', 'csv',
        'md', 'log', 'sh', 'sql', 'yml', 'yaml', 'toml', 'ini',
        'cfg', 'conf', 'config', 'env', 'rtf'
    }
    if extension in text_extensions:
        try:
            # Try UTF-8 first
            decoded_content = content.decode('utf-8')
        except UnicodeDecodeError:
            try:
                # Try Latin-1
                decoded_content = content.decode('latin-1')
            except:
                # Try to detect encoding
                try:
                    import chardet
                    detected = chardet.detect(content)
                    if detected and detected['encoding']:
                        decoded_content = content.decode(detected['encoding'])
                    else:
                        decoded_content = content.decode('utf-8', errors='ignore')
                except:
                    # Last resort - replace invalid characters
                    decoded_content = content.decode('utf-8', errors='replace')

        return Response({
            'type': 'text',
            'content': decoded_content,
            'name': file_obj.full_name,
            'size': file_obj.size_formatted,
            'extension': extension
        })

    # ===== IMAGES =====
    if extension in {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'}:
        return Response({
            'type': 'image',
            'content': f'data:{mime_type};base64,{base64.b64encode(content).decode("utf-8")}',
            'name': file_obj.full_name,
            'size': file_obj.size_formatted,
            'extension': extension
        })
    # ===== PDF =====
    if extension == 'pdf':
        if file_size > 2 * 1024 * 1024:
            return Response({
                'type': 'pdf_url',
                'url': f'/api/documents/files/{pk}/preview/',
                'name': file_obj.full_name,
                'size': file_obj.size_formatted,
                'extension': extension
            })
        return Response({
            'type': 'pdf',
            'content': base64.b64encode(content).decode('utf-8'),
            'name': file_obj.full_name,
            'size': file_obj.size_formatted,
            'extension': extension
        })
    # ===== DOCUMENTS (Word, Excel, PowerPoint) - Return as base64 with office viewer =====
    if extension in {'doc', 'docx', 'odt', 'xls', 'xlsx', 'ods', 'ppt', 'pptx', 'odp'}:
        # For Word/Excel/PowerPoint, return base64 content and use Office Online viewer
        return Response({
            'type': 'office',  # Changed from 'url' to 'office'
            'content': base64.b64encode(content).decode('utf-8'),
            'name': file_obj.full_name,
            'size': file_obj.size_formatted,
            'extension': extension,
            'mime_type': mime_type
        })

    # ===== VIDEOS =====
    if extension in {'mp4', 'avi', 'mov', 'webm', 'mkv'}:
        return Response({
            'type': 'video',
            'content': base64.b64encode(content).decode('utf-8'),
            'name': file_obj.full_name,
            'size': file_obj.size_formatted,
            'extension': extension,
            'mime_type': mime_type
        })
    # ===== AUDIO =====
    if extension in {'mp3', 'wav', 'ogg', 'flac'}:
        return Response({
            'type': 'audio',
            'content': base64.b64encode(content).decode('utf-8'),
            'name': file_obj.full_name,
            'size': file_obj.size_formatted,
            'extension': extension,
            'mime_type': mime_type
        })
    # ===== DEFAULT =====
    return Response({
        'type': 'download',
        'url': f'/api/documents/files/{pk}/download/',
        'name': file_obj.full_name,
        'size': file_obj.size_formatted,
        'extension': extension,
        'message': f'Preview not available for .{extension} files.'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_document(request):
    """
    Share a folder or file with one or multiple employees
    """
    try:
        # Get data from request
        folder_id = request.data.get('folder_id')
        file_id = request.data.get('file_id')
        employee_ids = request.data.get('employee_id')

        # Validate: either folder_id or file_id must be provided
        if not folder_id and not file_id:
            return Response(
                {'error': 'folder_id  is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if folder_id and file_id:
            return Response(
                {'error': 'Cannot share both folder and file at the same time'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate employee_ids
        if not employee_ids:
            return Response(
                {'error': 'employee_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Convert single employee_id to list
        if not isinstance(employee_ids, list):
            employee_ids = [employee_ids]

        # Remove duplicates
        employee_ids = list(set(employee_ids))

        # Check if folder or file exists
        document = None
        document_type = None

        if folder_id:
            document = get_object_or_404(Folder, id=folder_id)
            document_type = 'folder'
        else:
            document = get_object_or_404(File, id=file_id)
            document_type = 'file'

        # Get all employees that exist
        employees = Employee.objects.filter(id__in=employee_ids)
        found_ids = set(employees.values_list('id', flat=True))
        invalid_ids = set(employee_ids) - found_ids

        if invalid_ids:
            return Response(
                {'error': f'Invalid employee IDs: {list(invalid_ids)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for already shared documents
        already_shared = []
        for employee in employees:
            existing_share = SharedDocument.objects.filter(
                employee_id=employee.id
            )

            if folder_id:
                existing_share = existing_share.filter(folder_id=folder_id)
            else:
                existing_share = existing_share.filter(file_id=file_id)

            if existing_share.exists():
                already_shared.append(employee.id)

        if already_shared:
            return Response(
                {'error': f'Document already shared with employee(s): {already_shared}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create shares for all employees
        created_shares = []
        for employee in employees:
            share_data = {
                'employee_id': employee.id
            }

            if folder_id:
                share_data['folder_id'] = folder_id
            else:
                share_data['file_id'] = file_id

            shared_document = SharedDocument.objects.create(**share_data)

            created_shares.append({
                'share_id': shared_document.id,
                'employee_id': employee.id,
                'employee_name': employee.name,
                'employee_email': employee.email,
                'document_name': document.name if hasattr(document, 'name') else str(document),
                'document_type': document_type,
                'shared_at': shared_document.shared_at
            })

        # Return response
        return Response({
            'message': f'Document shared with {len(created_shares)} employee(s)',
            'document_type': document_type,
            'document_name': document.name if hasattr(document, 'name') else str(document),
            'shared': created_shares
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_shared_document(request):
    """
    DELETE: Revoke document/folder access from an employee.
    Body: { folder_id | file_id, employee_id }
    """
    try:
        folder_id = request.data.get('folder_id')
        file_id = request.data.get('file_id')
        employee_id = request.data.get('employee_id')

        if not employee_id:
            return Response(
                {'error': 'employee_id is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not folder_id and not file_id:
            return Response(
                {'error': 'folder_id or file_id is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if folder_id and file_id:
            return Response(
                {'error': 'Cannot unshare both folder and file at the same time'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        employee = get_object_or_404(Employee, id=employee_id)

        if folder_id:
            get_object_or_404(Folder, id=folder_id)
            qs = SharedDocument.objects.filter(folder_id=folder_id, employee_id=employee_id)
            document_type = 'folder'
        else:
            get_object_or_404(File, id=file_id)
            qs = SharedDocument.objects.filter(file_id=file_id, employee_id=employee_id)
            document_type = 'file'

        share = qs.first()
        if not share:
            return Response(
                {'error': f'Document is not shared with employee ID {employee_id}'},
                status=status.HTTP_404_NOT_FOUND,
            )

        share.delete()

        return Response(
            {
                'status': 'success',
                'message': f'Access revoked from {employee.name or employee.email}',
                'document_type': document_type,
                'folder_id': folder_id,
                'file_id': file_id,
                'employee_id': employee_id,
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# documents/views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_employee_documents(request, employee_id):
    try:

        shared_folders = SharedDocument.objects.filter(
            employee_id=employee_id,
            folder__isnull=False
        ).select_related('folder')

        documents = []

        for shared in shared_folders:
            folder = shared.folder
            files = File.objects.filter(folder=folder)
            folder_data = {
                'type': 'folder',
                'id': folder.id,
                'name': folder.name,
                'shared_at': shared.shared_at,
                'parent_id': folder.parent_id,
                'created_at': folder.created_at,
                'updated_at': folder.updated_at,
                'file_count': files.count(),
                'files': []
            }
            for file in files:
                folder_data['files'].append({
                    'id': file.id,
                    'name': file.full_name,
                    'extension': file.extension,
                    'size': file.size,
                    'size_formatted': file.size_formatted,
                    'mime_type': file.mime_type,
                    'created_at': file.created_at,
                    'updated_at': file.updated_at,
                    'is_image': file.is_image,
                    'is_document': file.is_document,
                    'is_spreadsheet': file.is_spreadsheet,
                    'is_presentation': file.is_presentation,
                    'is_archive': file.is_archive,
                    'folder_id': file.folder_id,
                    # Convert content to base64 for viewing
                    'content': base64.b64encode(file.content).decode('utf-8') if file.content else None,
                })

            documents.append(folder_data)

        return Response({
            'status': 'success',
            'employee_id': employee_id,
            'count': len(documents),
            'documents': documents
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)