// composables/useDocuments.js
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useDocumentStore } from '@/stores/documentStore.js'
import { useToast } from '@/composables/useToast.js'
import { BASE_URL } from '@/services/baseUrl.js'
import { useEmployeeStore } from '@/stores/employeeStore.js'

export default function useDocuments() {
    const store = useDocumentStore()
    const toast = useToast()
    const employeeStore = useEmployeeStore()

    // Helper: Show toast messages
    const showToast = (message, type = 'success', duration = 3500) => {
        toast.showToast(message, type, duration)
    }

    // Click outside handler for new menu
    const handleClickOutside = (event) => {
        const newMenuContainer = event.target.closest('.new-menu-container');
        if (!newMenuContainer && showNewMenu.value) {
            showNewMenu.value = false;
        }
    };

    onMounted(() => {
        document.addEventListener('click', handleClickOutside);
    });

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleClickOutside);
    });

    // Local UI state
    const searchQuery = ref('')
    const currentFilter = ref('all')
    const sortBy = ref('name')
    const viewMode = ref('grid')
    const showNewMenu = ref(false)
    const isDragging = ref(false)
    const fileInput = ref(null)
    const zipInput = ref(null)
    const selectedFileId = ref(null);
    const showPreview = ref(false);
    const previewData = ref(null);
    const previewLoading = ref(false);
    const previewError = ref(null);

    // Share modal state
    const showShareModal = ref(false)
    const shareSearchQuery = ref('')
    const selectedEmployees = ref([])
    const isSharing = ref(false)
    const selectedDocument = ref(null)

    // Modal state - Create Folder
    const showFolderModal = ref(false)
    const folderName = ref('')
    const isSubmitting = ref(false)

    // Modal state - Edit Folder
    const showEditModal = ref(false)
    const editFolderId = ref(null)
    const editFolderName = ref('')
    const isEditing = ref(false)

    // Modal state - Delete
    const showDeleteModal = ref(false)
    const deleteItemData = ref(null)
    const isDeleting = ref(false)

    const filters = [
        { value: 'all', label: 'All' },
        { value: 'folder', label: 'Folders' },
        { value: 'file', label: 'Files' }
    ]

    // Computed
    const filteredItems = computed(() => {
        let result = store.viewItems || []

        if (currentFilter.value === 'folder') {
            result = result.filter(item => item.isFolder)
        } else if (currentFilter.value === 'file') {
            result = result.filter(item => !item.isFolder)
        }

        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase()
            result = result.filter(item =>
                item.name?.toLowerCase().includes(query) ||
                item.extension?.toLowerCase().includes(query)
            )
        }

        if (sortBy.value === 'name') {
            result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        } else if (sortBy.value === 'newest') {
            result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        } else if (sortBy.value === 'size') {
            result = [...result].sort((a, b) => (b.size || 0) - (a.size || 0))
        }

        return result
    })

    // Share modal computed
    const shareFilteredEmployees = computed(() => {
        if (!employeeStore.employees || employeeStore.employees.length === 0) return []

        let result = employeeStore.employees

        if (shareSearchQuery.value) {
            const query = shareSearchQuery.value.toLowerCase()
            result = result.filter(emp =>
                emp.username?.toLowerCase().includes(query) ||
                emp.email?.toLowerCase().includes(query) ||
                emp.first_name?.toLowerCase().includes(query) ||
                emp.last_name?.toLowerCase().includes(query)
            )
        }

        return result
    })

    const breadcrumb = computed(() => {
        const crumbs = []
        let currentId = store.currentFolderId
        if (!currentId) return crumbs
        const allItems = store.allItems || []
        const buildPath = (folderId) => {
            console.log('Building path for folder ID:', folderId)
            const folder = allItems.find(item => item.id === folderId && item.isFolder)
            if (folder) {
                console.log('Found folder:', folder.name, 'Parent:', folder.parent_id)
                crumbs.unshift(folder)
                if (folder.parent_id) {
                    buildPath(folder.parent_id)
                }
            } else {
                console.warn('Folder not found in allItems:', folderId)
            }
        }
        buildPath(currentId)
        console.log('Breadcrumb built:', crumbs.map(f => f.name))
        return crumbs
    })

    const currentFolderName = computed(() => {
        if (!store.currentFolderId) return 'Root'
        const folder = store.allItems.find(item => item.id === store.currentFolderId && item.isFolder)
        return folder?.name || 'Root'
    })

    const isFolderView = computed(() => {
        return store.currentFolderId !== null
    })

    // ===== Create Folder Methods =====
    const toggleNewMenu = () => {
        showNewMenu.value = !showNewMenu.value
    }

    const openFolderModal = () => {
        showNewMenu.value = false
        folderName.value = ''
        showFolderModal.value = true
    }

    const closeFolderModal = () => {
        showFolderModal.value = false
        folderName.value = ''
        isSubmitting.value = false
    }

    const submitFolder = async () => {
        if (!folderName.value || !folderName.value.trim()) {
            showToast('Please enter a folder name', 'error')
            return
        }

        isSubmitting.value = true
        try {
            await store.createFolder(folderName.value.trim(), store.currentFolderId)
            showToast(`Folder "${folderName.value.trim()}" created successfully!`, 'success')
            closeFolderModal()
        } catch (error) {
            showToast(error.message || 'Failed to create folder', 'error')
        } finally {
            isSubmitting.value = false
        }
    }

    // ===== Edit Folder Methods =====
    const openEditModal = (item) => {
        if (!item.isFolder) {
            showToast('Only folders can be renamed', 'warning')
            return
        }
        editFolderId.value = item.id
        editFolderName.value = item.name
        showEditModal.value = true
    }

    const closeEditModal = () => {
        showEditModal.value = false
        editFolderId.value = null
        editFolderName.value = ''
        isEditing.value = false
    }

    const submitEdit = async () => {
        if (!editFolderName.value || !editFolderName.value.trim()) {
            showToast('Please enter a folder name', 'error')
            return
        }

        const trimmedName = editFolderName.value.trim()

        const currentItem = store.allItems.find(i => i.id === editFolderId.value)
        if (currentItem && trimmedName === currentItem.name) {
            showToast('No changes made', 'info')
            closeEditModal()
            return
        }

        isEditing.value = true
        try {
            await store.updateFolder(editFolderId.value, trimmedName)
            showToast(`Folder renamed to "${trimmedName}"`, 'success')
            closeEditModal()
        } catch (error) {
            console.error('Edit error:', error)
            showToast(error.message || 'Failed to rename folder', 'error')
        } finally {
            isEditing.value = false
        }
    }

    // ===== Delete Methods =====
    const openDeleteModal = (item) => {
        deleteItemData.value = item
        showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
        showDeleteModal.value = false
        deleteItemData.value = null
        isDeleting.value = false
    }

    const submitDelete = async () => {
        if (!deleteItemData.value) return

        isDeleting.value = true
        try {
            await store.deleteItem(deleteItemData.value)
            showToast(`"${deleteItemData.value.name}" deleted successfully`, 'success')
            closeDeleteModal()
        } catch (error) {
            console.error('Delete error:', error)
            showToast(error.message || 'Failed to delete item', 'error')
        } finally {
            isDeleting.value = false
        }
    }

    // ===== Share Methods =====
    const openShareModal = async (item) => {
        selectedDocument.value = item
        selectedEmployees.value = []
        shareSearchQuery.value = ''

        if (employeeStore.employees.length === 0) {
            await employeeStore.fetchEmployees({ page: 1, page_size: 100 })
        }

        showShareModal.value = true
    }

    const closeShareModal = () => {
        showShareModal.value = false
        selectedDocument.value = null
        selectedEmployees.value = []
        shareSearchQuery.value = ''
        isSharing.value = false
    }

    const toggleEmployee = (employee) => {
        const index = selectedEmployees.value.findIndex(e => e.id === employee.id)
        if (index > -1) {
            selectedEmployees.value.splice(index, 1)
        } else {
            selectedEmployees.value.push(employee)
        }
    }

    const isEmployeeSelected = (employeeId) => {
        return selectedEmployees.value.some(e => e.id === employeeId)
    }

    const confirmShare = async () => {
        if (selectedEmployees.value.length === 0) {
            showToast('Please select at least one employee', 'warning')
            return
        }

        if (!selectedDocument.value) {
            showToast('No document selected', 'error')
            return
        }

        isSharing.value = true
        try {
            const employeeIds = selectedEmployees.value.map(e => e.id)
            const isFolder = selectedDocument.value.isFolder

            let result
            if (isFolder) {
                result = await store.shareDocument(selectedDocument.value.id, null, employeeIds)
            } else {
                result = await store.shareDocument(null, selectedDocument.value.id, employeeIds)
            }

            if (result && result.message) {
                showToast(`Document shared with ${selectedEmployees.value.length} employee(s) successfully!`, 'success')
                closeShareModal()
            } else {
                showToast(result?.error || 'Failed to share document', 'error')
            }
        } catch (error) {
            console.error('Error sharing document:', error)
            showToast(error.message || 'Error sharing document', 'error')
        } finally {
            isSharing.value = false
        }
    }

    const getInitials = (name) => {
        if (!name) return '?'
        const words = name.split(' ')
        if (words.length === 1) {
            return name.charAt(0).toUpperCase()
        }
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    }

    // ===== File Upload Methods =====
    const uploadFile = () => {
        if (!store.currentFolderId) {
            showToast('Please open a folder first before uploading files.', 'warning')
            return
        }
        fileInput.value?.click()
        showNewMenu.value = false
    }

    const uploadZip = () => {
        if (!store.currentFolderId) {
            showToast('Please open a folder first before uploading files.', 'warning')
            return
        }
        zipInput.value?.click()
        showNewMenu.value = false
    }

    const handleFileUpload = async (event) => {
        const files = event.target.files
        if (!files.length) return

        if (!store.currentFolderId) {
            showToast('Please select a folder first.', 'warning')
            event.target.value = ''
            return
        }

        try {
            for (const file of files) {
                await store.uploadFile(store.currentFolderId, file)
            }
            showToast(`${files.length} file(s) uploaded successfully!`, 'success')
        } catch (error) {
            console.error('Upload error:', error)
            showToast(error.message || 'Failed to upload file', 'error')
        }
        event.target.value = ''
    }

    const handleZipUpload = async (event) => {
        const files = event.target.files
        if (!files.length) return

        if (!store.currentFolderId) {
            showToast('Please select a folder first.', 'warning')
            event.target.value = ''
            return
        }

        try {
            for (const file of files) {
                await store.uploadFile(store.currentFolderId, file)
            }
            showToast(`${files.length} zip file(s) uploaded successfully!`, 'success')
        } catch (error) {
            console.error('Zip upload error:', error)
            showToast(error.message || 'Failed to upload zip file', 'error')
        }
        event.target.value = ''
    }

    const handleDrop = async (event) => {
        isDragging.value = false
        const files = event.dataTransfer.files
        if (!files.length) return

        if (!store.currentFolderId) {
            showToast('Please open a folder first before uploading files.', 'warning')
            return
        }

        try {
            for (const file of files) {
                await store.uploadFile(store.currentFolderId, file)
            }
            showToast(`${files.length} file(s) uploaded successfully!`, 'success')
        } catch (error) {
            console.error('Drop upload error:', error)
            showToast(error.message || 'Failed to upload files', 'error')
        }
    }

    // ===== Navigation Methods =====
    const openItem = (item) => {
        if (item.isFolder) {
            store.navigateTo(item.id)
        }
    }

    const navigateTo = (folderId) => {
        store.navigateTo(folderId)
    }

    const navigateToRoot = () => {
        store.navigateTo(null)
    }

    // ===== Helper Methods =====
    const editItem = (item) => {
        openEditModal(item)
    }

    const getCurrentFile = () => {
        if (!selectedFileId.value) return null;
        const file = filteredItems.value.find(item => item.id === selectedFileId.value);
        return file || null;
    }

    const deleteItem = (item) => {
        openDeleteModal(item)
    }

    const getFileIcon = (extension) => {
        const icons = {
            pdf: 'fas fa-file-pdf text-red-500',
            docx: 'fas fa-file-word text-blue-500',
            xlsx: 'fas fa-file-excel text-green-500',
            pptx: 'fas fa-file-powerpoint text-orange-500',
            jpg: 'fas fa-file-image text-purple-500',
            png: 'fas fa-file-image text-purple-500',
            gif: 'fas fa-file-image text-purple-500',
            zip: 'fas fa-file-zipper text-yellow-500',
            rar: 'fas fa-file-zipper text-yellow-500',
            py: 'fas fa-file-code text-blue-400',
            js: 'fas fa-file-code text-yellow-400',
            html: 'fas fa-file-code text-orange-400',
            css: 'fas fa-file-code text-blue-400'
        }
        return icons[extension] || 'fas fa-file text-gray-400'
    }

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B'
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i]
    }

    // ===== Download Function =====
    const downloadFile = (item) => {
        if (!item) {
            showToast('No file to download', 'warning');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const cleanedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
            const downloadUrl = `${cleanedBaseUrl}/api/documents/files/${item.id}/download/`;

            showToast('Downloading...', 'info');

            fetch(downloadUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Download failed');
                    return response.blob();
                })
                .then(blob => {
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = item.name || 'download';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(link.href);
                    showToast('Download started!', 'success');
                })
                .catch(error => {
                    console.error('Download error:', error);
                    window.open(downloadUrl, '_blank');
                    showToast('Opening file in new tab...', 'info');
                });

        } catch (error) {
            console.error('Download error:', error);
            showToast('Failed to download file', 'error');
        }
    }

    // ===== View File Function =====
    const viewFile = async (item) => {
        if (item.isFolder) return;
        try {
            console.log('Viewing file:', item.id, item.name);

            const extension = item.extension?.toLowerCase();
            const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'];

            if (officeExtensions.includes(extension)) {
                downloadFile(item);
                return;
            }

            showToast('Opening file...', 'info');
            const response = await store.viewFileContent(item.id);
            console.log('File content response:', response);

            if (response.error) {
                throw new Error(response.error);
            }

            if (response.type === 'pdf') {
                if (response.blob_url) {
                    window.open(response.blob_url, '_blank');
                    showToast('PDF opened in new tab', 'success');
                } else {
                    throw new Error('PDF preview not available');
                }
            }
            else if (response.type === 'image') {
                const win = window.open('', '_blank');
                if (win) {
                    win.document.write(`<img src="${response.content}" style="max-width:100%;max-height:100%;margin:auto;display:block;" />`);
                    win.document.title = response.name;
                }
                showToast('Image opened in new tab', 'success');
            }
            else if (response.type === 'text') {
                const win = window.open('', '_blank');
                if (win) {
                    win.document.write(`<pre style="padding:20px;font-family:monospace;white-space:pre-wrap;word-wrap:break-word;">${response.content}</pre>`);
                    win.document.title = response.name;
                }
                showToast('Text file opened in new tab', 'success');
            }
            else if (response.type === 'video') {
                const win = window.open('', '_blank');
                if (win) {
                    win.document.write(`
                        <video controls style="max-width:100%;max-height:100%;margin:auto;display:block;">
                            <source src="data:${response.mime_type};base64,${response.content}" type="${response.mime_type}">
                            Your browser does not support the video tag.
                        </video>
                    `);
                    win.document.title = response.name;
                }
                showToast('Video opened in new tab', 'success');
            }
            else if (response.type === 'audio') {
                const win = window.open('', '_blank');
                if (win) {
                    win.document.write(`
                        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Arial,sans-serif;">
                            <h2>${response.name}</h2>
                            <audio controls style="width:80%;max-width:600px;margin:20px;">
                                <source src="data:${response.mime_type};base64,${response.content}" type="${response.mime_type}">
                                Your browser does not support the audio tag.
                            </audio>
                        </div>
                    `);
                    win.document.title = response.name;
                }
                showToast('Audio opened in new tab', 'success');
            }
            else {
                downloadFile(item);
                showToast('Downloading file...', 'success');
            }

        } catch (error) {
            console.error('View file error:', error);
            showToast(error.message || 'Failed to open file', 'error');
        }
    }

    const deleteSubtitle = computed(() => {
        if (!deleteItemData.value) return 'Are you sure you want to delete this item?';
        const itemName = deleteItemData.value.name || 'this item';
        if (deleteItemData.value.isFolder) {
            return `Are you sure you want to delete the folder "${itemName}"? This action cannot be undone and all contents will be removed.`;
        }
        return `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
    })

    const formatDate = (date) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const handleListClick = (item) => {
        if (item.isFolder) return;

        if (selectedFileId.value === item.id && showPreview.value) {
            closePreview();
            return;
        }

        selectedFileId.value = item.id;
        showPreview.value = true;
        loadPreview(item);
    };

    const loadPreview = async (item) => {
        previewLoading.value = true;
        previewError.value = null;
        previewData.value = null;

        try {
            const response = await store.viewFileContent(item.id);

            if (response.error) {
                throw new Error(response.error);
            }

            previewData.value = response;
        } catch (error) {
            console.error('Preview error:', error);
            previewError.value = error.message || 'Failed to load preview';
        } finally {
            previewLoading.value = false;
        }
    };

    const closePreview = () => {
        showPreview.value = false;
        selectedFileId.value = null;
        previewData.value = null;
        previewError.value = null;
        previewLoading.value = false;
    };

    const goBack = () => {
        console.log('Breadcrumb before back:', breadcrumb.value.map(f => f.name))
        console.log('Breadcrumb length:', breadcrumb.value.length)
        if (breadcrumb.value.length >= 2) {
            const parentFolder = breadcrumb.value[breadcrumb.value.length - 2]
            console.log('Going back to:', parentFolder.name, 'ID:', parentFolder.id)
            navigateTo(parentFolder.id)
        } else if (breadcrumb.value.length === 1) {
            console.log('Going back to root')
            navigateToRoot()
        } else {
            console.log('No breadcrumb, going to root')
            navigateToRoot()
        }
    }

    // Init
    onMounted(() => {
        store.init()
    })

    // Update the filter watcher
    watch(currentFilter, (newFilter) => {
        if (newFilter === 'all') {
            store.loadAllItems()
        } else if (newFilter === 'folder') {
            store.loadAllFolders()
        } else if (newFilter === 'file') {
            store.loadAllFiles()
        }
    })

    return {
        // From store
        items: store.viewItems,
        loading: store.isLoading,
        error: store.error,
        folderCount: store.folderCount,
        fileCount: store.fileCount,
        currentFolderId: store.currentFolderId,
        // UI state
        searchQuery,
        currentFilter,
        sortBy,
        viewMode,
        showNewMenu,
        isDragging,
        fileInput,
        zipInput,
        // Modal states
        showFolderModal,
        folderName,
        isSubmitting,
        showEditModal,
        editFolderName,
        isEditing,
        showDeleteModal,
        isDeleting,
        // Share modal states
        showShareModal,
        shareSearchQuery,
        selectedEmployees,
        isSharing,
        selectedDocument,
        // Computed
        filteredItems,
        shareFilteredEmployees,
        breadcrumb,
        currentFolderName,
        isFolderView,
        storageUsed: store.storageUsed,
        storagePercentage: store.storagePercentage,
        filters,
        deleteSubtitle,
        // Methods
        toggleNewMenu,
        openFolderModal,
        closeFolderModal,
        submitFolder,
        openEditModal,
        closeEditModal,
        submitEdit,
        openDeleteModal,
        closeDeleteModal,
        submitDelete,
        openShareModal,
        closeShareModal,
        toggleEmployee,
        isEmployeeSelected,
        confirmShare,
        uploadFile,
        uploadZip,
        handleFileUpload,
        handleZipUpload,
        handleDrop,
        openItem,
        navigateTo,
        navigateToRoot,
        editItem,
        deleteItem,
        getFileIcon,
        formatFileSize,
        formatDate,
        viewFile,
        downloadFile,
        selectedFileId,
        showPreview,
        previewData,
        previewLoading,
        previewError,
        handleListClick,
        closePreview,
        loadPreview,
        goBack,
        getCurrentFile,
        handleClickOutside,
        getInitials,
        employeeStore
    }
}