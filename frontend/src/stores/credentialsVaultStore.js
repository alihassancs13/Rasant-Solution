import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BASE_URL, API_ENDPOINTS } from '@/services/baseUrl.js'
import axios from 'axios'

// Create axios client like other stores
const getAuthToken = () => {
    const token = localStorage.getItem('access_token') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token')
    return token
}

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
    const token = getAuthToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export const useCredentialsVaultStore = defineStore('credentialsVault', () => {
    const credentials = ref([])
    const loading = ref(false)
    const error = ref(null)
    const totalCount = ref(0)

    // Getters
    const uniqueProjects = computed(() => {
        if (!credentials.value || credentials.value.length === 0) return 0
        const projects = new Set(credentials.value.map(c => c.project || 'Uncategorized'))
        return projects.size
    })

    const staleCredentials = computed(() => {
        if (!credentials.value) return 0
        return credentials.value.filter(c => c.needsRotation).length
    })

    // Actions
    const fetchCredentials = async () => {
        loading.value = true
        error.value = null
        try {
            const token = getAuthToken()

            if (!token) {
                throw new Error('No authentication token found. Please login again.')
            }

            const response = await apiClient.get(API_ENDPOINTS.CREDENTIALS.GET_ALL)
            console.log('Fetching credentials from:', response.config.url)
            console.log('API Response:', response.data)

            const data = response.data

            let credentialsData = []
            if (data.data && Array.isArray(data.data)) {
                credentialsData = data.data
            } else if (Array.isArray(data)) {
                credentialsData = data
            } else if (data.results && Array.isArray(data.results)) {
                credentialsData = data.results
            } else {
                credentialsData = []
            }

            credentials.value = credentialsData.map(item => ({
                id: item.id,
                name: item.name || item.credential_name || 'Untitled',
                link: item.link || '',
                username: item.username || '',
                email: item.email || '',
                password: item.password || '',
                password_display: item.password_display || item.password || '',
                description: item.description || '',
                showPassword: false,
                needsRotation: item.needsRotation || false,
                created_at: item.created_at || item.createdAt || new Date().toISOString(),
                shared_with: (item.shared_with || []).map(s => s.employee_id),
            }))

            totalCount.value = data.count || credentials.value.length

            return { success: true, data: credentials.value }

        } catch (err) {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                error.value = 'Session expired. Please login again.'
                return { success: false, error: 'Session expired. Please login again.' }
            }
            error.value = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch credentials'
            console.error('Error fetching credentials:', err)
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    const removeCredentialShare = async (credentialId, employeeId) => {
        loading.value = true
        error.value = null
        try {
            const token = getAuthToken()
            if (!token) {
                throw new Error('No authentication token found. Please login again.')
            }

            const response = await apiClient.delete(API_ENDPOINTS.CREDENTIALS.REMOVE_SHARE, {
                data: {
                    credential_id: credentialId,
                    employee_id: employeeId
                }
            })

            if (response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }

            return { success: true, data: response.data }

        } catch (err) {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                error.value = 'Session expired. Please login again.'
                return { success: false, error: 'Session expired. Please login again.' }
            }
            error.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to remove share'
            console.error('Error removing credential share:', err)
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    // Fetch employee credentials
    const fetchEmployeeCredentials = async (employeeId) => {
        loading.value = true
        error.value = null
        try {
            const token = getAuthToken()
            if (!token) {
                throw new Error('No authentication token found. Please login again.')
            }

            const endpoint = API_ENDPOINTS.CREDENTIALS.GET_EMPLOYEE_CREDENTIALS(employeeId)
            const response = await apiClient.get(endpoint)

            console.log('Employee credentials response:', response.data)

            const data = response.data

            if (data.status === 'success' && data.credentials) {
                credentials.value = data.credentials.map(cred => ({
                    ...cred,
                    showPassword: false,
                }))
                totalCount.value = credentials.value.length
                console.log('Credentials loaded:', credentials.value.length)
            } else {
                credentials.value = []
                totalCount.value = 0
                throw new Error(data.message || 'Failed to fetch credentials')
            }

            return { success: true, data: credentials.value }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                error.value = 'Session expired. Please login again.'
                return { success: false, error: 'Session expired. Please login again.' }
            }
            error.value = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to fetch employee credentials'
            credentials.value = []
            totalCount.value = 0
            console.error('Error fetching employee credentials:', err)
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    const createCredential = async (credentialData) => {
        loading.value = true
        error.value = null
        try {
            const token = getAuthToken()

            if (!token) {
                throw new Error('No authentication token found. Please login again.')
            }

            const response = await apiClient.post(API_ENDPOINTS.CREDENTIALS.CREATE, credentialData)

            if (response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }

            const data = response.data

            let newCred = {}
            if (data.data) {
                newCred = data.data
            } else {
                newCred = data
            }

            const addedCred = {
                id: newCred.id || Date.now(),
                name: newCred.name || credentialData.name || 'Untitled',
                link: newCred.link || credentialData.link || '',
                username: newCred.username || credentialData.username || '',
                email: newCred.email || credentialData.email || '',
                password: newCred.password || credentialData.password || '',
                description: newCred.description || credentialData.description || '',
                project: newCred.project || credentialData.project || 'Uncategorized',
                showPassword: false,
                needsRotation: false,
                created_at: newCred.created_at || new Date().toISOString(),
                shared_with: [],
            }

            credentials.value.unshift(addedCred)
            totalCount.value++

            return { success: true, data: addedCred }

        } catch (err) {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                error.value = 'Session expired. Please login again.'
                return { success: false, error: 'Session expired. Please login again.' }
            }

            // Handle validation errors
            let errorMessage = err.response?.data?.message || err.message || 'Failed to create credential'
            if (err.response?.data?.errors) {
                const fieldErrors = []
                if (err.response.data.errors.username) {
                    fieldErrors.push(err.response.data.errors.username.join(' '))
                }
                if (err.response.data.errors.email) {
                    fieldErrors.push(err.response.data.errors.email.join(' '))
                }
                if (fieldErrors.length > 0) {
                    errorMessage = fieldErrors.join(' ')
                }
            }

            error.value = errorMessage
            console.error('Error creating credential:', err)
            return { success: false, error: errorMessage }
        } finally {
            loading.value = false
        }
    }

    const updateCredential = async (credentialId, credentialData) => {
        loading.value = true
        error.value = null
        try {
            const token = getAuthToken()
            if (!token) {
                throw new Error('No authentication token found. Please login again.')
            }

            const response = await apiClient.put(
                API_ENDPOINTS.CREDENTIALS.UPDATE(credentialId),
                credentialData
            )

            if (response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }

            const data = response.data
            const updated = data.data || data
            const idx = credentials.value.findIndex((c) => c.id === credentialId)
            if (idx > -1) {
                credentials.value[idx] = {
                    ...credentials.value[idx],
                    id: updated.id || credentialId,
                    name: updated.name || credentialData.name,
                    link: updated.link || credentialData.link || '',
                    username: updated.username || credentialData.username || '',
                    email: updated.email || credentialData.email || '',
                    password_display: updated.password_display || credentialData.password || credentials.value[idx].password_display,
                    description: updated.description ?? credentialData.description ?? '',
                    shared_with: Array.isArray(updated.shared_with)
                        ? updated.shared_with.map((s) => (typeof s === 'object' ? s.employee_id : s))
                        : credentials.value[idx].shared_with,
                }
            }

            return { success: true, data: credentials.value[idx] || updated }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                error.value = 'Session expired. Please login again.'
                return { success: false, error: 'Session expired. Please login again.' }
            }

            let errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update credential'
            if (err.response?.data?.errors) {
                const fieldErrors = []
                Object.values(err.response.data.errors).forEach((msgs) => {
                    if (Array.isArray(msgs)) fieldErrors.push(msgs.join(' '))
                    else if (msgs) fieldErrors.push(String(msgs))
                })
                if (fieldErrors.length) errorMessage = fieldErrors.join(' ')
            }

            error.value = errorMessage
            console.error('Error updating credential:', err)
            return { success: false, error: errorMessage }
        } finally {
            loading.value = false
        }
    }

    const deleteCredential = async (credentialId) => {
        loading.value = true
        error.value = null
        try {
            const token = getAuthToken()
            if (!token) {
                throw new Error('No authentication token found. Please login again.')
            }

            const response = await apiClient.delete(
                API_ENDPOINTS.CREDENTIALS.DELETE(credentialId)
            )

            if (response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }

            credentials.value = credentials.value.filter((c) => c.id !== credentialId)
            totalCount.value = Math.max(0, totalCount.value - 1)
            return { success: true }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                error.value = 'Session expired. Please login again.'
                return { success: false, error: 'Session expired. Please login again.' }
            }
            error.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to delete credential'
            console.error('Error deleting credential:', err)
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    const shareCredential = async (credentialId, employeeIds) => {
        loading.value = true
        error.value = null
        try {
            const token = getAuthToken()

            if (!token) {
                throw new Error('No authentication token found. Please login again.')
            }

            const response = await apiClient.post(API_ENDPOINTS.CREDENTIALS.SHARE, {
                credential_id: credentialId,
                employee_id: employeeIds
            })

            if (response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }

            return { success: true, data: response.data }

        } catch (err) {
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                error.value = 'Session expired. Please login again.'
                return { success: false, error: 'Session expired. Please login again.' }
            }
            error.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to share credential'
            console.error('Error sharing credential:', err)
            return { success: false, error: error.value }
        } finally {
            loading.value = false
        }
    }

    const togglePassword = (credentialId) => {
        const cred = credentials.value.find(c => c.id === credentialId);
        if (cred) {
            cred.showPassword = !cred.showPassword;
        }
    }

    const clearError = () => {
        error.value = null
    }

    return {
        credentials,
        loading,
        error,
        totalCount,
        uniqueProjects,
        staleCredentials,
        fetchCredentials,
        fetchEmployeeCredentials,
        createCredential,
        updateCredential,
        deleteCredential,
        shareCredential,
        togglePassword,
        clearError,
        removeCredentialShare
    }
})