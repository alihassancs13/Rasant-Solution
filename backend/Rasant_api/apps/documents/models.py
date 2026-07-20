from django.db import models
# Create your models here.


from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db.models import Q
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

class SharedDocument(models.Model):
    """
    Model to track document sharing with employees.
    Can share either a folder or an individual file.
    """
    folder = models.ForeignKey(
        'Folder',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='shared_documents',
        help_text="Folder being shared (if sharing a folder)"
    )
    file = models.ForeignKey(
        'File',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='shared_documents',
        help_text="File being shared (if sharing a file)"
    )
    employee_id = models.IntegerField(
        help_text="Employee ID from EmployeeDashboard table"
    )
    shared_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date and time when document was shared"
    )

    class Meta:
        db_table = 'shared_documents'
        verbose_name = 'Shared Document'
        verbose_name_plural = 'Shared Documents'
        ordering = ['-shared_at']
        constraints = [
            models.UniqueConstraint(
                fields=['folder', 'employee_id'],
                condition=Q(folder__isnull=False),
                name='unique_shared_folder_per_employee'
            ),
            models.UniqueConstraint(
                fields=['file', 'employee_id'],
                condition=Q(file__isnull=False),
                name='unique_shared_file_per_employee'
            ),
            models.CheckConstraint(
                check=(
                    Q(folder__isnull=False, file__isnull=True) |
                    Q(folder__isnull=True, file__isnull=False)
                ),
                name='either_folder_or_file_required'
            ),
        ]

    def clean(self):
        """Validate that either folder or file is provided, but not both"""
        if not self.folder and not self.file:
            raise ValidationError('Either folder or file must be provided.')
        if self.folder and self.file:
            raise ValidationError('Cannot share both folder and file at the same time.')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def shared_item_name(self):
        """Get the name of the shared item"""
        if self.folder:
            return self.folder.name
        if self.file:
            return self.file.full_name
        return 'Unknown'

    @property
    def shared_item_type(self):
        """Get the type of the shared item"""
        if self.folder:
            return 'folder'
        if self.file:
            return 'file'
        return 'unknown'

    def __str__(self):
        return f"{self.shared_item_name} → Employee #{self.employee_id}"