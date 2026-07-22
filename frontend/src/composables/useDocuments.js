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
    const showToast = (message, type = 'success', duration = 3500) => {
        toast.showToast(message, type, duration)
    }
    const isAdmin = computed(() => {
        return store.userRole === 'admin' || store.isEmployeeView === false
    })
    const isEmployee = computed(() => {
        return store.userRole === 'employee' || store.isEmployeeView === true
    })
    const handleClickOutside = (event) => {
        const newMenuContainer = event.target.closest('.new-menu-container')
        if (!newMenuContainer && showNewMenu.value) {
            showNewMenu.value = false
        }
    }

    onMounted(() => {
        document.addEventListener('click', handleClickOutside)
    })

    onBeforeUnmount(() => {
        document.removeEventListener('click', handleClickOutside)
    })
    const searchQuery = ref('')
    const currentFilter = ref('all')
    const sortBy = ref('name')
    const viewMode = ref('grid')
    const showNewMenu = ref(false)
    const isDragging = ref(false)
    const fileInput = ref(null)
    const zipInput = ref(null)
    const selectedFileId = ref(null)
    const showPreview = ref(false)
    const previewData = ref(null)
    const previewLoading = ref(false)
    const previewError = ref(null)
    const showShareModal = ref(false)
    const shareSearchQuery = ref('')
    const selectedEmployees = ref([])
    const isSharing = ref(false)
    const selectedDocument = ref(null)
    const showFolderModal = ref(false)
    const folderName = ref('')
    const isSubmitting = ref(false)
    const showEditModal = ref(false)
    const editFolderId = ref(null)
    const editFolderName = ref('')
    const isEditing = ref(false)
    const showDeleteModal = ref(false)
    const deleteItemData = ref(null)
    const isDeleting = ref(false)

    const filters = [
        { value: 'all', label: 'All' },
        { value: 'folder', label: 'Folders' },
        { value: 'file', label: 'Files' }
    ]

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
        if (!currentId || store.isEmployeeView) return crumbs
        const allItems = store.allItems || []
        const buildPath = (folderId) => {
            const folder = allItems.find(item => item.id === folderId && item.isFolder)
            if (folder) {
                crumbs.unshift(folder)
                if (folder.parent_id) {
                    buildPath(folder.parent_id)
                }
            }
        }
        buildPath(currentId)
        return crumbs
    })
    const showEmployeeBackButton = computed(() => isEmployee.value && store.currentFolderId !== null)
    const currentFolderName = computed(() => {
        if (!store.currentFolderId) return store.isEmployeeView ? 'Shared Documents' : 'Root'
        const folder = store.allItems.find(item => item.id === store.currentFolderId && item.isFolder)
        return folder?.name || (store.isEmployeeView ? 'Shared Documents' : 'Root')
    })

    const isFolderView = computed(() => {
        return store.currentFolderId !== null && !store.isEmployeeView
    })

    // ===== Create Folder Methods =====
    const toggleNewMenu = () => {
        if (isEmployee.value) {
            showToast('You do not have permission to create folders', 'error')
            return
        }
        showNewMenu.value = !showNewMenu.value
    }

    const openFolderModal = () => {
        if (isEmployee.value) {
            showToast('You do not have permission to create folders', 'error')
            return
        }
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
        if (isEmployee.value) {
            showToast('You do not have permission to create folders', 'error')
            return
        }
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
        if (isEmployee.value) {
            showToast('You do not have permission to edit folders', 'error')
            return
        }
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
        if (isEmployee.value) {
            showToast('You do not have permission to edit folders', 'error')
            return
        }
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
        if (isEmployee.value) {
            showToast('You do not have permission to delete items', 'error')
            return
        }
        deleteItemData.value = item
        showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
        showDeleteModal.value = false
        deleteItemData.value = null
        isDeleting.value = false
    }

    const submitDelete = async () => {
        if (isEmployee.value) {
            showToast('You do not have permission to delete items', 'error')
            return
        }
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
        if (isEmployee.value) {
            showToast('You do not have permission to share documents', 'error')
            return
        }
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
        if (isAlreadyShared(employee.id)) {
            showToast('This item is already shared with this employee', 'info')
            return
        }
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
        if (isEmployee.value) {
            showToast('You do not have permission to share documents', 'error')
            return
        }
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
                // NEW: refresh so shared_with is current
                if (store.currentFolderId) {
                    await store.loadFolderContents(store.currentFolderId)
                } else {
                    await store.loadAllItems()
                }
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
        if (isEmployee.value) {
            showToast('You do not have permission to upload files', 'error')
            return
        }
        if (!store.currentFolderId) {
            showToast('Please open a folder first before uploading files.', 'warning')
            return
        }
        fileInput.value?.click()
        showNewMenu.value = false
    }

    const uploadZip = () => {
        if (isEmployee.value) {
            showToast('You do not have permission to upload files', 'error')
            return
        }
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
        if (isEmployee.value) {
            showToast('You do not have permission to upload files', 'error')
            return
        }
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
            if (isEmployee.value) {
                console.log(' Employee clicked folder:', item.name, 'ID:', item.id);
                const folder = store.allItems.find(f => f.id === item.id && f.isFolder);
                console.log(' Found folder in allItems:', folder);

                if (folder && folder.files && folder.files.length > 0) {
                    const filesToShow = folder.files.map(file => ({
                        ...file,
                        isFolder: false,
                        type: 'file',
                        parent_folder_name: folder.name,
                        parent_folder_id: folder.id,
                    }));
                    store.viewItems = filesToShow;
                    store.currentFolderId = item.id;
                    console.log(' Showing files in folder:', item.name, filesToShow);
                } else {
                    store.viewItems = [];
                    store.currentFolderId = item.id;
                    showToast('This folder is empty', 'info');
                    console.log('Folder is empty:', item.name);
                }
                return;
            }
            store.navigateTo(item.id);
        }
    }
    const navigateTo = (folderId) => {
        if (isEmployee.value) {
            return
        }
        store.navigateTo(folderId)
    }

    const navigateToRoot = () => {
        if (isEmployee.value) {
            // Reset to show all items (folders with their files nested)
            store.viewItems = store.allItems;
            store.currentFolderId = null;
            console.log('🔙 Employee going back to all items');
            return
        }
        store.navigateTo(null)
    }
    const editItem = (item) => {
        openEditModal(item)
    }

    const getCurrentFile = () => {
        if (!selectedFileId.value) return null
        const file = filteredItems.value.find(item => item.id === selectedFileId.value)
        return file || null
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
            showToast('No file to download', 'warning')
            return
        }
        if (isEmployee.value) {
            if (!item.content) {
                showToast('File content not available for download', 'error')
                return
            }
            try {
                const binaryString = atob(item.content)
                const bytes = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i)
                }
                const blob = new Blob([bytes], { type: item.mime_type || 'application/octet-stream' })
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = item.name || 'download'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(link.href)
                showToast('Download started!', 'success')
            } catch (error) {
                console.error('Employee download error:', error)
                showToast('Failed to download file', 'error')
            }
            return
        }
        // Admin: existing API-based download
        try {
            const token = localStorage.getItem('accessToken')
            const cleanedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
            const downloadUrl = `${cleanedBaseUrl}/api/documents/files/${item.id}/download/`

            showToast('Downloading...', 'info')

            fetch(downloadUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Download failed')
                    return response.blob()
                })
                .then(blob => {
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = item.name || 'download'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(link.href)
                    showToast('Download started!', 'success')
                })
                .catch(error => {
                    console.error('Download error:', error)
                    showToast('Failed to download file — please check your permissions', 'error')
                })

        } catch (error) {
            console.error('Download error:', error)
            showToast('Failed to download file', 'error')
        }
    }
    const showFileContent = (response) => {
        if (response.type === 'pdf' || response.extension === 'pdf') {
            // For PDF, create a blob URL
            try {
                const binaryString = atob(response.content)
                const bytes = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i)
                }
                const blob = new Blob([bytes], { type: 'application/pdf' })
                const blobUrl = URL.createObjectURL(blob)
                window.open(blobUrl, '_blank')
                showToast('PDF opened in new tab', 'success')
            } catch (error) {
                console.error('Error creating PDF:', error)
                showToast('Error opening PDF', 'error')
            }
        } else if (response.type === 'image' || response.is_image) {
            const win = window.open('', '_blank')
            if (win) {
                win.document.write(`<img src="data:${response.mime_type || 'image/png'};base64,${response.content}" style="max-width:100%;max-height:100%;margin:auto;display:block;" />`)
                win.document.title = response.name
            }
            showToast('Image opened in new tab', 'success')
        } else if (response.type === 'text') {
            const win = window.open('', '_blank')
            if (win) {
                win.document.write(`<pre style="padding:20px;font-family:monospace;white-space:pre-wrap;word-wrap:break-word;">${atob(response.content)}</pre>`)
                win.document.title = response.name
            }
            showToast('Text file opened in new tab', 'success')
        } else {
            // For other files, download
            downloadFile(response)
        }
    }
    const isAlreadyShared = (employeeId) => {
        if (!selectedDocument.value?.shared_with) return false
        return selectedDocument.value.shared_with.includes(employeeId)
    }
    // ===== View File Function =====
    const viewFile = async (item) => {
        if (item.isFolder) return
        try {
            console.log('Viewing file:', item.id, item.name)
            if (isEmployee.value) {
                if (item.content) {
                    showFileContent(item)
                } else {
                    downloadFile(item)
                }
                return
            }

            // Admin view
            const extension = item.extension?.toLowerCase()
            const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp']

            if (officeExtensions.includes(extension)) {
                downloadFile(item)
                return
            }

            showToast('Opening file...', 'info')
            const response = await store.viewFileContent(item.id)
            console.log('File content response:', response)

            if (response.error) {
                throw new Error(response.error)
            }

            if (response.type === 'pdf') {
                if (response.blob_url) {
                    window.open(response.blob_url, '_blank')
                    showToast('PDF opened in new tab', 'success')
                } else {
                    throw new Error('PDF preview not available')
                }
            }
            else if (response.type === 'image') {
                const win = window.open('', '_blank')
                if (win) {
                    win.document.write(`<img src="${response.content}" style="max-width:100%;max-height:100%;margin:auto;display:block;" />`)
                    win.document.title = response.name
                }
                showToast('Image opened in new tab', 'success')
            }
            else if (response.type === 'text') {
                const win = window.open('', '_blank')
                if (win) {
                    win.document.write(`<pre style="padding:20px;font-family:monospace;white-space:pre-wrap;word-wrap:break-word;">${response.content}</pre>`)
                    win.document.title = response.name
                }
                showToast('Text file opened in new tab', 'success')
            }
            else if (response.type === 'video') {
                const win = window.open('', '_blank')
                if (win) {
                    win.document.write(`
                        <video controls style="max-width:100%;max-height:100%;margin:auto;display:block;">
                            <source src="data:${response.mime_type};base64,${response.content}" type="${response.mime_type}">
                            Your browser does not support the video tag.
                        </video>
                    `)
                    win.document.title = response.name
                }
                showToast('Video opened in new tab', 'success')
            }
            else if (response.type === 'audio') {
                const win = window.open('', '_blank')
                if (win) {
                    win.document.write(`
                        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Arial,sans-serif;">
                            <h2>${response.name}</h2>
                            <audio controls style="width:80%;max-width:600px;margin:20px;">
                                <source src="data:${response.mime_type};base64,${response.content}" type="${response.mime_type}">
                                Your browser does not support the audio tag.
                            </audio>
                        </div>
                    `)
                    win.document.title = response.name
                }
                showToast('Audio opened in new tab', 'success')
            }
            else {
                downloadFile(item)
                showToast('Downloading file...', 'success')
            }

        } catch (error) {
            console.error('View file error:', error)
            showToast(error.message || 'Failed to open file', 'error')
        }
    }

    const deleteSubtitle = computed(() => {
        if (!deleteItemData.value) return 'Are you sure you want to delete this item?'
        const itemName = deleteItemData.value.name || 'this item'
        if (deleteItemData.value.isFolder) {
            return `Are you sure you want to delete the folder "${itemName}"? This action cannot be undone and all contents will be removed.`
        }
        return `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
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
        if (item.isFolder) return

        if (selectedFileId.value === item.id && showPreview.value) {
            closePreview()
            return
        }

        selectedFileId.value = item.id
        showPreview.value = true
        loadPreview(item)
    }

    const loadPreview = async (item) => {
        previewLoading.value = true
        previewError.value = null
        previewData.value = null

        try {
            if (isEmployee.value) {
                if (!item.content) {
                    throw new Error('File content not available')
                }
                previewData.value = buildEmployeePreviewData(item)
                return
            }

            const response = await store.viewFileContent(item.id)
            if (response.error) {
                throw new Error(response.error)
            }
            previewData.value = response
        } catch (error) {
            console.error('Preview error:', error)
            previewError.value = error.message || 'Failed to load preview'
        } finally {
            previewLoading.value = false
        }
    }

    const closePreview = () => {
        showPreview.value = false
        selectedFileId.value = null
        previewData.value = null
        previewError.value = null
        previewLoading.value = false
    }

    const buildEmployeePreviewData = (item) => {
        const extension = (item.extension || '').toLowerCase()
        const mimeType = item.mime_type || 'application/octet-stream'
        const base = {
            id: item.id,
            name: item.name,
            extension,
            mime_type: mimeType,
            size: item.size_formatted || formatFileSize(item.size),
        }

        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']
        const videoExts = ['mp4', 'webm', 'ogg', 'mov']
        const audioExts = ['mp3', 'wav', 'm4a']
        const textExts = ['txt', 'md', 'csv', 'json', 'log', 'js', 'css', 'html', 'xml', 'py']

        if (!item.content) {
            return { ...base, type: 'other' }
        }

        if (item.is_image || imageExts.includes(extension)) {
            return { ...base, type: 'image', content: `data:${mimeType};base64,${item.content}` }
        }
        if (extension === 'pdf') {
            try {
                const binaryString = atob(item.content)
                const bytes = new Uint8Array(binaryString.length)
                for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i)
                const blob = new Blob([bytes], { type: 'application/pdf' })
                return { ...base, type: 'pdf', blob_url: URL.createObjectURL(blob) }
            } catch (e) {
                return { ...base, type: 'pdf', blob_url: null }
            }
        }
        if (videoExts.includes(extension)) {
            return { ...base, type: 'video', content: item.content }
        }
        if (audioExts.includes(extension)) {
            return { ...base, type: 'audio', content: item.content }
        }
        if (textExts.includes(extension)) {
            try {
                return { ...base, type: 'text', content: atob(item.content) }
            } catch (e) {
                return { ...base, type: 'text', content: '' }
            }
        }
        return { ...base, type: 'other' }
    }

    const goBack = () => {
        if (isEmployee.value) {
            // For employee, go back to showing all items
            store.viewItems = store.allItems;
            store.currentFolderId = null;
            console.log('🔙 Employee going back to all items');
            return
        }
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
    onMounted(() => {
        store.init()
    })

    watch(currentFilter, (newFilter) => {
        if (store.isEmployeeView) {
            return
        }
        if (newFilter === 'all') {
            store.loadAllItems()
        } else if (newFilter === 'folder') {
            store.loadAllFolders()
        } else if (newFilter === 'file') {
            store.loadAllFiles()
        }
    })

    return {
        items: store.viewItems,
        loading: store.isLoading,
        error: store.error,
        folderCount: store.folderCount,
        fileCount: store.fileCount,
        currentFolderId: store.currentFolderId,
        isEmployeeView: store.isEmployeeView,
        isAdmin,
        isEmployee,
        searchQuery,
        currentFilter,
        sortBy,
        viewMode,
        showNewMenu,
        isDragging,
        fileInput,
        zipInput,
        showFolderModal,
        folderName,
        isSubmitting,
        showEditModal,
        editFolderName,
        isEditing,
        showDeleteModal,
        isDeleting,
        showShareModal,
        shareSearchQuery,
        selectedEmployees,
        isSharing,
        selectedDocument,
        filteredItems,
        shareFilteredEmployees,
        breadcrumb,
        currentFolderName,
        isFolderView,
        storageUsed: store.storageUsed,
        storagePercentage: store.storagePercentage,
        filters,
        deleteSubtitle,
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
        employeeStore,
        showEmployeeBackButton,
        isAlreadyShared
    }
}