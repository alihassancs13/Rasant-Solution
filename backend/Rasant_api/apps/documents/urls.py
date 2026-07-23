from django.urls import path
from . import views

urlpatterns = [
    # Folder CRUD
    path('folders/create/', views.create_folder, name='create-folder'),
    path('folders/root/', views.get_root_folders, name='root-folders'),
    path('folders/<int:pk>/contents/', views.get_folder_contents, name='folder-contents'),
    path('folders/<int:pk>/update/', views.update_folder, name='update-folder'),
    path('folders/<int:pk>/delete/', views.delete_folder, name='delete-folder'),
# File URLs
    path('files/upload/', views.upload_file, name='upload-file'),
    path('files/<int:pk>/download/', views.download_file, name='download-file'),
    path('files/<int:pk>/preview/', views.preview_file, name='preview-file'),
    path('files/<int:pk>/delete/', views.delete_file, name='delete-file'),
    path('files/extension/<str:extension>/', views.get_files_by_extension, name='files-by-extension'),
    path('all/', views.get_all_items, name='all-items'),
    path('folders/all/', views.get_all_folders, name='all-folders'),
    path('files/all/', views.get_all_files, name='all-files'),
    path('files/<int:pk>/view/', views.view_file_content, name='view-file-content'),
    path('share_document/', views.share_document, name='share_document'),
    path('remove_share/', views.remove_shared_document, name='remove_shared_document'),
    path('get_employee_document/<int:employee_id>/', views.get_employee_documents, name='get_employee_documents'),
]