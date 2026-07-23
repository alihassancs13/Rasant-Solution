import { ref, computed, onMounted, watch } from 'vue'
import { useCredentialsVaultStore } from '@/stores/credentialsVaultStore.js'
import { storeToRefs } from 'pinia'
import { useToast } from '@/composables/useToast.js'
import { useEmployeeStore } from '@/stores/employeeStore.js'

export default function useCredentialsVault() {
    const store = useCredentialsVaultStore()
    const employeeStore = useEmployeeStore()
    const { credentials, loading, error, uniqueProjects, staleCredentials, totalCount } = storeToRefs(store)
    const { showToast } = useToast()

    const currentFilter = ref('all')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const pageSize = ref(5)
    const showModal = ref(false)
    const showShareModal = ref(false)
    const showUnshareModal = ref(false)
    const unshareEmployee = ref(null)
    const isUnsharing = ref(false)
    const isEditing = ref(false)
    const isSaving = ref(false)
    const isSharing = ref(false)
    const fieldErrors = ref({})
    const selectedCredential = ref(null)
    const shareSearchQuery = ref('')
    const shareCurrentPage = ref(1)
    const sharePageSize = ref(5)
    const selectedEmployees = ref([])

    const form = ref({
        id: null,
        name: '',
        link: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        project: '',
        description: '',
    })
    const isAlreadyShared = (employeeId) => {
        if (!selectedCredential.value?.shared_with) return false
        return selectedCredential.value.shared_with.includes(employeeId)
    }
    const filteredCredentials = computed(() => {
        if (!credentials.value) return []

        let result = credentials.value

        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase()
            result = result.filter(c =>
                c.name?.toLowerCase().includes(query) ||
                c.username?.toLowerCase().includes(query) ||
                c.email?.toLowerCase().includes(query) ||
                c.project?.toLowerCase().includes(query)
            )
        }

        return result
    })

    const totalPages = computed(() => {
        return Math.ceil(filteredCredentials.value.length / pageSize.value) || 1
    })

    const startIndex = computed(() => {
        return (currentPage.value - 1) * pageSize.value
    })

    const endIndex = computed(() => {
        return startIndex.value + pageSize.value
    })

    const paginatedCredentials = computed(() => {
        return filteredCredentials.value.slice(startIndex.value, endIndex.value)
    })

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

    const shareTotalPages = computed(() => {
        return Math.ceil(shareFilteredEmployees.value.length / sharePageSize.value) || 1
    })

    const shareStartIndex = computed(() => {
        return (shareCurrentPage.value - 1) * sharePageSize.value
    })

    const shareEndIndex = computed(() => {
        return shareStartIndex.value + sharePageSize.value
    })

    const sharePaginatedEmployees = computed(() => {
        return shareFilteredEmployees.value.slice(shareStartIndex.value, shareEndIndex.value)
    })

    const passwordStrength = computed(() => {
        const pwd = form.value.password
        if (!pwd) return null

        let score = 0
        if (pwd.length >= 8) score++
        if (/[A-Z]/.test(pwd)) score++
        if (/[0-9]/.test(pwd)) score++
        if (/[^A-Za-z0-9]/.test(pwd)) score++

        if (score <= 1) return 'weak'
        if (score <= 3) return 'medium'
        return 'strong'
    })

    const passwordMismatch = computed(() => {
        return form.value.confirmPassword.length > 0 && form.value.password !== form.value.confirmPassword
    })

    const validateForm = () => {
        const errors = {}

        if (!form.value.name?.trim()) errors.name = 'Credential label is required'
        if (!form.value.link?.trim()) errors.link = 'Login link is required'
        if (!form.value.username?.trim()) errors.username = 'Username is required'
        if (!form.value.email?.trim()) errors.email = 'Email is required'

        // Password required on create; on edit leave blank to keep existing
        if (!isEditing.value && !form.value.password) {
            errors.password = 'Password is required'
        }
        if (form.value.password || form.value.confirmPassword) {
            if (!form.value.password) {
                errors.password = 'Password is required'
            }
            if (!form.value.confirmPassword) {
                errors.confirmPassword = 'Confirm password is required'
            } else if (form.value.password !== form.value.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match'
            }
        }

        const existingCred = credentials.value.find(c =>
            c.username === form.value.username && c.id !== form.value.id
        )
        if (existingCred) {
            errors.username = 'This username is already taken. Please use a different username.'
        }

        const existingEmail = credentials.value.find(c =>
            c.email === form.value.email && c.id !== form.value.id
        )
        if (existingEmail) {
            errors.email = 'This email is already registered. Please use a different email.'
        }

        fieldErrors.value = errors
        return Object.keys(errors).length === 0
    }

    const getInitials = (name) => {
        if (!name) return '?'
        const words = name.split(' ')
        if (words.length === 1) {
            return name.charAt(0).toUpperCase()
        }
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    }

    const getProjectColor = (project) => {
        const colors = {
            sentra: 'bg-blue-600',
            'ai-agent': 'bg-blue-700',
            chatbot: 'bg-blue-500',
            orchestri: 'bg-blue-800',
            company: 'bg-blue-600'
        }
        return colors[project] || 'bg-blue-600'
    }

    const getProjectIcon = (project) => {
        const icons = {
            sentra: 'fas fa-phone',
            'ai-agent': 'fas fa-robot',
            chatbot: 'fas fa-comments',
            orchestri: 'fas fa-gear',
            company: 'fab fa-jira'
        }
        return icons[project] || 'fas fa-folder'
    }

    const togglePassword = (id) => {
        const cred = credentials.value.find(c => c.id === id)
        if (cred) {
            cred.showPassword = !cred.showPassword
        }
    }

    const openAddModal = () => {
        isEditing.value = false
        fieldErrors.value = {}
        form.value = {
            id: null,
            name: '',
            link: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            description: '',
            project: ''
        }
        showModal.value = true
    }

    const openEditModal = (credential) => {
        isEditing.value = true
        fieldErrors.value = {}
        form.value = {
            id: credential.id,
            name: credential.name || '',
            link: credential.link || '',
            username: credential.username || '',
            email: credential.email || '',
            password: '',
            confirmPassword: '',
            description: credential.description || '',
            project: credential.project || '',
        }
        showModal.value = true
    }

    const closeModal = () => {
        showModal.value = false
        isEditing.value = false
        fieldErrors.value = {}
        form.value = {
            id: null,
            name: '',
            link: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            project: '',
            description: ''
        }
    }

    const showDeleteModal = ref(false)
    const deleteTarget = ref(null)
    const isDeleting = ref(false)

    const openDeleteModal = (credential) => {
        deleteTarget.value = credential
        showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
        showDeleteModal.value = false
        deleteTarget.value = null
        isDeleting.value = false
    }

    const deleteSubtitle = computed(() => {
        const name = deleteTarget.value?.name || 'this credential'
        return `Delete "${name}"? This cannot be undone and will also remove access for any employees it was shared with.`
    })

    const submitDelete = async () => {
        if (!deleteTarget.value?.id) return
        isDeleting.value = true
        try {
            const result = await store.deleteCredential(deleteTarget.value.id)
            if (result.success) {
                showToast('Credential deleted successfully', 'success', 3000)
                closeDeleteModal()
            } else {
                showToast(result.error || 'Failed to delete credential', 'error', 4000)
            }
        } catch (error) {
            console.error('Error deleting credential:', error)
            showToast('Error deleting credential', 'error', 4000)
        } finally {
            isDeleting.value = false
        }
    }

    //  Share modal functions
    const openShareModal = async (credential) => {
        selectedCredential.value = credential
        selectedEmployees.value = []  // Reset selection
        shareSearchQuery.value = ''

        if (employeeStore.employees.length === 0) {
            await employeeStore.fetchEmployees({ page: 1, page_size: 100 })
        }

        showShareModal.value = true
    }
    const confirmRemoveShare = (employeeId) => {
        if (!selectedCredential.value) {
            showToast('No credential selected', 'error', 3000)
            return
        }

        const employee = employeeStore.employees.find(e => e.id === employeeId)
        if (!employee) {
            showToast('Employee not found', 'error', 3000)
            return
        }

        unshareEmployee.value = employee
        showUnshareModal.value = true
    }

    const closeUnshareModal = () => {
        showUnshareModal.value = false
        unshareEmployee.value = null
        isUnsharing.value = false
    }

    const unshareSubtitle = computed(() => {
        const credName = selectedCredential.value?.name || 'this credential'
        const empName = unshareEmployee.value?.full_name
            || unshareEmployee.value?.email
            || 'this employee'
        return `Remove access to "${credName}" from ${empName}? They will no longer see this in their vault.`
    })

    const submitUnshare = async () => {
        if (!selectedCredential.value || !unshareEmployee.value) {
            showToast('Nothing to unshare', 'error', 3000)
            return
        }

        isUnsharing.value = true
        const employeeId = unshareEmployee.value.id
        const employeeName = unshareEmployee.value.full_name
            || unshareEmployee.value.email
            || 'Employee'

        try {
            const result = await store.removeCredentialShare(
                selectedCredential.value.id,
                employeeId
            )

            if (result.success) {
                showToast(`Access removed from ${employeeName} successfully!`, 'success', 3000)

                const index = selectedEmployees.value.findIndex(e => e.id === employeeId)
                if (index > -1) {
                    selectedEmployees.value.splice(index, 1)
                }

                await store.fetchCredentials()

                const updatedCred = credentials.value.find(c => c.id === selectedCredential.value.id)
                if (updatedCred) {
                    selectedCredential.value = updatedCred
                }

                closeUnshareModal()
            } else {
                showToast(result.error || 'Failed to remove access', 'error', 3000)
            }
        } catch (error) {
            console.error('Error removing share:', error)
            showToast('Error removing access', 'error', 3000)
        } finally {
            isUnsharing.value = false
        }
    }


    const closeShareModal = () => {
        showShareModal.value = false
        selectedCredential.value = null
        selectedEmployees.value = []
        shareSearchQuery.value = ''
        shareCurrentPage.value = 1
        closeUnshareModal()
    }

    const sharePrevPage = () => {
        if (shareCurrentPage.value > 1) {
            shareCurrentPage.value--
        }
    }

    const shareNextPage = () => {
        if (shareCurrentPage.value < shareTotalPages.value) {
            shareCurrentPage.value++
        }
    }

    const shareGoToPage = (page) => {
        shareCurrentPage.value = page
    }

    const toggleEmployee = (employee) => {
        if (isAlreadyShared(employee.id)) {
            showToast('This credential is already shared with this employee', 'info', 2500)
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
        if (selectedEmployees.value.length === 0) {
            showToast('Please select at least one employee', 'warning', 3000)
            return
        }

        if (!selectedCredential.value) {
            showToast('No credential selected', 'error', 3000)
            return
        }

        isSharing.value = true
        try {
            const employeeIds = selectedEmployees.value.map(e => e.id)
            const result = await store.shareCredential(
                selectedCredential.value.id,
                employeeIds
            )

            if (result.success) {
                showToast(`Credential shared with ${selectedEmployees.value.length} employee(s) successfully!`, 'success', 3000)
                await store.fetchCredentials()   // NEW: refresh so shared_with is current
                closeShareModal()
            } else {
                showToast(result.error || 'Failed to share credential', 'error', 3000)
            }
        } catch (error) {
            console.error('Error sharing credential:', error)
            showToast('Error sharing credential', 'error', 3000)
        } finally {
            isSharing.value = false
        }
    }


    const saveCredential = async () => {
        if (isSaving.value) return
        if (!validateForm()) return

        isSaving.value = true
        try {
            const credentialData = {
                name: form.value.name,
                link: form.value.link,
                username: form.value.username,
                email: form.value.email,
                description: form.value.description,
            }
            if (form.value.password) {
                credentialData.password = form.value.password
            }

            const wasEditing = isEditing.value && form.value.id
            const result = wasEditing
                ? await store.updateCredential(form.value.id, credentialData)
                : await store.createCredential({
                    ...credentialData,
                    password: form.value.password,
                    project: form.value.project,
                })

            if (result?.success) {
                closeModal()
                showToast(
                    wasEditing ? 'Credential updated successfully!' : 'Credential created successfully!',
                    'success',
                    3000,
                )
                await store.fetchCredentials()
            } else {
                const errorMsg = result?.error || (wasEditing ? 'Failed to update credential' : 'Failed to create credential')
                showToast(errorMsg, 'error', 5000)
                console.error('Error saving credential:', result?.error)
            }
        } catch (error) {
            console.error('Error saving credential:', error)
            showToast(error.message || 'Error saving credential', 'error', 5000)
        } finally {
            isSaving.value = false
        }
    }

    const prevPage = () => {
        if (currentPage.value > 1) {
            currentPage.value--
        }
    }

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value++
        }
    }

    const goToPage = (page) => {
        currentPage.value = page
    }
    const shareDisplayedPages = computed(() => {
        const total = shareTotalPages.value
        const current = shareCurrentPage.value
        const pages = []
        const maxVisible = 5

        if (total <= maxVisible) {
            for (let i = 1; i <= total; i++) {
                pages.push(i)
            }
        } else {
            if (current <= 3) {
                for (let i = 1; i <= 3; i++) pages.push(i)
                pages.push('...')
                for (let i = total - 1; i <= total; i++) pages.push(i)
            } else if (current >= total - 2) {
                for (let i = 1; i <= 2; i++) pages.push(i)
                pages.push('...')
                for (let i = total - 2; i <= total; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = current - 1; i <= current + 1; i++) pages.push(i)
                pages.push('...')
                pages.push(total)
            }
        }
        return pages
    })
    const displayedPages = computed(() => {
        const total = totalPages.value
        const current = currentPage.value
        const pages = []
        const maxVisible = 5

        if (total <= maxVisible) {
            for (let i = 1; i <= total; i++) {
                pages.push(i)
            }
        } else {
            if (current <= 3) {
                for (let i = 1; i <= 3; i++) pages.push(i)
                pages.push('...')
                for (let i = total - 1; i <= total; i++) pages.push(i)
            } else if (current >= total - 2) {
                for (let i = 1; i <= 2; i++) pages.push(i)
                pages.push('...')
                for (let i = total - 2; i <= total; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = current - 1; i <= current + 1; i++) pages.push(i)
                pages.push('...')
                pages.push(total)
            }
        }
        return pages
    })
    watch([searchQuery], () => {
        currentPage.value = 1
    })

    watch([shareSearchQuery], () => {
        shareCurrentPage.value = 1
    })

    onMounted(async () => {
        await store.fetchCredentials()
        console.log('Credentials loaded:', credentials.value)
    })

    return {
        credentials,
        loading,
        error,
        uniqueProjects,
        staleCredentials,
        totalCount,
        currentFilter,
        searchQuery,
        currentPage,
        pageSize,
        showModal,
        showShareModal,
        showUnshareModal,
        unshareEmployee,
        isUnsharing,
        unshareSubtitle,
        isEditing,
        form,
        filteredCredentials,
        totalPages,
        startIndex,
        endIndex,
        paginatedCredentials,
        passwordStrength,
        passwordMismatch,
        fieldErrors,
        selectedCredential,
        shareSearchQuery,
        shareCurrentPage,
        sharePageSize,
        selectedEmployees,
        shareFilteredEmployees,
        shareTotalPages,
        shareStartIndex,
        shareEndIndex,
        sharePaginatedEmployees,
        displayedPages,
        shareDisplayedPages,
        getInitials,
        getProjectColor,
        getProjectIcon,
        togglePassword,
        openAddModal,
        openEditModal,
        closeModal,
        openDeleteModal,
        closeDeleteModal,
        submitDelete,
        showDeleteModal,
        deleteSubtitle,
        isDeleting,
        openShareModal,
        closeShareModal,
        toggleEmployee,
        isEmployeeSelected,
        confirmShare,
        sharePrevPage,
        shareNextPage,
        shareGoToPage,
        saveCredential,
        prevPage,
        nextPage,
        goToPage,
        fetchCredentials: store.fetchCredentials,
        isSharing,
        isSaving,
        employeeStore,
        isAlreadyShared,
        confirmRemoveShare,
        closeUnshareModal,
        submitUnshare,
    }
}