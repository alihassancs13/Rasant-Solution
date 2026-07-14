// composables/useDocuments.js
import { ref, computed, onMounted, watch } from 'vue'
import { useDocumentStore } from '@/stores/documentStore.js'
import { useToast } from '@/composables/useToast.js'

export default function useDocuments() {
    const store = useDocumentStore()
    const toast = useToast()

    // Helper: Show toast messages
    const showToast = (message, type = 'success', duration = 3500) => {
        toast.showToast(message, type, duration)
    }

    // Local UI state
    const searchQuery = ref('')
    const currentFilter = ref('all')
    const sortBy = ref('name')
    const viewMode = ref('grid')
    const showNewMenu = ref(false)
    const isDragging = ref(false)
    const fileInput = ref(null)
    const zipInput = ref(null)

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

    const breadcrumb = computed(() => {
        // Only show breadcrumb when in a folder (not in All/Folders/Files view)
        if (currentFilter.value !== 'all' && currentFilter.value !== 'folder' && currentFilter.value !== 'file') {
            const crumbs = []
            let currentId = store.currentFolderId
            const allItems = store.allItems || []

            if (currentId) {
                const findFolder = (id) => {
                    const folder = allItems.find(item => item.id === id && item.isFolder)
                    if (folder) {
                        crumbs.unshift(folder)
                        const parent = allItems.find(item => item.id === folder.parent_id)
                        if (parent) {
                            findFolder(parent.id)
                        }
                    }
                }
                findFolder(currentId)
            }
            return crumbs
        }
        return []
    })

    const currentFolderName = computed(() => {
        if (!store.currentFolderId) return 'Root'
        const folder = store.allItems.find(item => item.id === store.currentFolderId && item.isFolder)
        return folder?.name || 'Root'
    })

    // Check if we're in a folder view
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

    const formatDate = (date) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
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
        filteredItems,
        breadcrumb,
        currentFolderName,
        isFolderView,
        storageUsed: store.storageUsed,
        storagePercentage: store.storagePercentage,
        filters,
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
    }
}