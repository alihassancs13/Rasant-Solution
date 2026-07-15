from django.db import models
# Create your models here.


from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()

class Folder(models.Model):
    """Folder model for organizing files"""
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='folders')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subfolders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'folders'
        ordering = ['name']
        unique_together = [['user', 'parent', 'name']]
        verbose_name = 'Folder'
        verbose_name_plural = 'Folders'

    def __str__(self):
        return self.name

    @property
    def is_root(self):
        """Check if folder is a root folder (no parent)"""
        return self.parent is None

    @property
    def full_path(self):
        """Get full folder path"""
        if self.parent:
            return f"{self.parent.full_path}/{self.name}"
        return self.name


class File(models.Model):
    """File model for storing files"""
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='files')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    name = models.CharField(max_length=255)
    extension = models.CharField(max_length=50)
    content = models.BinaryField()
    size = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'files'
        ordering = ['name']
        unique_together = [['folder', 'name']]
        verbose_name = 'File'
        verbose_name_plural = 'Files'

    def __str__(self):
        return f"{self.name}.{self.extension}"

    @property
    def full_name(self):
        """Get full filename with extension"""
        return f"{self.name}.{self.extension}"

    @property
    def size_formatted(self):
        """Get formatted file size (e.g., 2.5 MB)"""
        if not self.size:
            return '0 B'
        size = self.size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

    @property
    def is_image(self):
        """Check if file is an image"""
        image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico']
        return self.extension.lower() in image_extensions

    @property
    def is_document(self):
        """Check if file is a document"""
        doc_extensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt']
        return self.extension.lower() in doc_extensions

    @property
    def is_spreadsheet(self):
        """Check if file is a spreadsheet"""
        spreadsheet_extensions = ['xls', 'xlsx', 'csv', 'ods']
        return self.extension.lower() in spreadsheet_extensions

    @property
    def is_presentation(self):
        """Check if file is a presentation"""
        presentation_extensions = ['ppt', 'pptx', 'odp']
        return self.extension.lower() in presentation_extensions

    @property
    def is_archive(self):
        """Check if file is an archive"""
        archive_extensions = ['zip', 'rar', '7z', 'tar', 'gz']
        return self.extension.lower() in archive_extensions