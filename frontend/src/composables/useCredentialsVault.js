import { ref, computed, onMounted, watch } from 'vue'
import { useCredentialsVaultStore } from '@/stores/credentialsVaultStore.js'
import { storeToRefs } from 'pinia'
import { useToast } from '@/composables/useToast.js'

export default function useCredentialsVault() {
    const store = useCredentialsVaultStore()
    const { credentials, loading, error, uniqueProjects, staleCredentials, totalCount } = storeToRefs(store)
    const { showToast } = useToast()

    const currentFilter = ref('all')
    const searchQuery = ref('')
    const currentPage = ref(1)
    const pageSize = ref(5)
    const showModal = ref(false)
    const isEditing = ref(false)
    const isSaving = ref(false)
    const fieldErrors = ref({})
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
            console.log('Toggled password for:', cred.name, 'showPassword:', cred.showPassword)
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

    watch([searchQuery], () => {
        currentPage.value = 1
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
        getInitials,
        getProjectColor,
        getProjectIcon,
        togglePassword,
        openAddModal,
        closeModal,
        saveCredential,
        prevPage,
        nextPage,
        goToPage,
        fetchCredentials: store.fetchCredentials
    }
}