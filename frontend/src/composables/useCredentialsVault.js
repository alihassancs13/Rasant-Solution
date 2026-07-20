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
    const showShareModal = ref(false)  // NEW: Share modal state
    const isEditing = ref(false)
    const isSaving = ref(false)
    const isSharing = ref(false)  // NEW: Sharing state
    const fieldErrors = ref({})
    const selectedCredential = ref(null)  // NEW: Store selected credential for sharing

    // NEW: Share modal state
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
        project: 'sentra'
    })

    // Computed
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

    // NEW: Share modal computed properties
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
        if (!form.value.password) errors.password = 'Password is required'

        if (!form.value.confirmPassword) {
            errors.confirmPassword = 'Confirm password is required'
        } else if (form.value.password !== form.value.confirmPassword) {
            errors.confirmPassword = 'Password do not match'
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
            project: 'sentra'
        }
        showModal.value = true
    }

    const closeModal = () => {
        showModal.value = false
        fieldErrors.value = {}
        form.value = {
            id: null,
            name: '',
            link: '',
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            project: 'sentra'
        }
    }

    // NEW: Share modal functions
    const openShareModal = async (credential) => {
        selectedCredential.value = credential
        selectedEmployees.value = []  // Reset selection
        shareSearchQuery.value = ''

        if (employeeStore.employees.length === 0) {
            await employeeStore.fetchEmployees({ page: 1, page_size: 100 })
        }

        showShareModal.value = true
    }

    const closeShareModal = () => {
        showShareModal.value = false
        selectedCredential.value = null
        selectedEmployees.value = []
        shareSearchQuery.value = ''
        shareCurrentPage.value = 1
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
                employeeIds  // Send array of IDs
            )

            if (result.success) {
                showToast(`Credential shared with ${selectedEmployees.value.length} employee(s) successfully!`, 'success', 3000)
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
                password: form.value.password,
                project: form.value.project
            }

            const result = await store.createCredential(credentialData)

            if (result?.success) {
                closeModal()
                showToast('Credential created successfully!', 'success', 3000)
                await store.fetchCredentials()
            } else {
                console.error('Error saving credential:', result?.error)
                showToast('Failed to create credential: ' + (result?.error || 'Unknown error'), 'error', 3000)
            }
        } catch (error) {
            console.error('Error saving credential:', error)
            showToast('Error creating credential', 'error', 3000)
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

    // NEW: Displayed pages for share modal
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
// Add this after shareDisplayedPages computed (around line 200)
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
    // Watch search query to reset page
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
        // Share modal
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
        closeModal,
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
        employeeStore
    }
}