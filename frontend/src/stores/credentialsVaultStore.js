import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BASE_URL, API_ENDPOINTS } from '@/services/baseUrl.js'

export const useCredentialsVaultStore = defineStore('credentialsVault', () => {
    // State
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

    // Helper to get token
    const getAuthToken = () => {
        // Try multiple ways to get the token
        const token = localStorage.getItem('access_token') ||
            localStorage.getItem('accessToken') ||
            localStorage.getItem('token')
        return token
    }

    // Actions
    const fetchCredentials = async () => {
        loading.value = true
        error.value = null
        try {
            const token = getAuthToken()

            if (!token) {
                throw new Error('No authentication token found. Please login again.')
            }

            const url = `${BASE_URL}${API_ENDPOINTS.CREDENTIALS.GET_ALL}`
            console.log('Fetching credentials from:', url) // Debug log

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.status === 401) {
                // Token expired or invalid - redirect to login
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                // Redirect to login page
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch credentials: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            console.log('API Response:', data) // Debug log

            // Handle different response formats
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

            // Map API response to our format
            // In fetchCredentials function - update the mapping
            credentials.value = credentialsData.map(item => ({
                id: item.id,
                name: item.name || item.credential_name || 'Untitled',
                link: item.link || '',
                username: item.username || '',
                email: item.email || '',
                password: item.password || '',  // Keep for backward compatibility
                password_display: item.password_display || item.password || '',
                project: item.project || item.project_name || 'Uncategorized',
                showPassword: false,
                needsRotation: item.needsRotation || false,
                created_at: item.created_at || item.createdAt || new Date().toISOString()
            }))

            totalCount.value = data.count || credentials.value.length

        } catch (err) {
            error.value = err.message
            console.error('Error fetching credentials:', err)
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

            const url = `${BASE_URL}${API_ENDPOINTS.CREDENTIALS.CREATE}`
            console.log('Creating credential at:', url) // Debug log

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(credentialData)
            })

            if (response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `Failed to create credential: ${response.status}`)
            }

            const data = await response.json()
            console.log('Create response:', data) // Debug log

            // Extract created credential
            let newCred = {}
            if (data.data) {
                newCred = data.data
            } else {
                newCred = data
            }

            // Add new credential to store
            const addedCred = {
                id: newCred.id || Date.now(),
                name: newCred.name || credentialData.name || 'Untitled',
                link: newCred.link || credentialData.link || '',
                username: newCred.username || credentialData.username || '',
                email: newCred.email || credentialData.email || '',
                password: newCred.password || credentialData.password || '',
                project: newCred.project || credentialData.project || 'Uncategorized',
                showPassword: false,
                needsRotation: false,
                created_at: newCred.created_at || new Date().toISOString()
            }

            credentials.value.unshift(addedCred)
            totalCount.value++

            return { success: true, data: addedCred }

        } catch (err) {
            error.value = err.message
            console.error('Error creating credential:', err)
            return { success: false, error: err.message }
        } finally {
            loading.value = false
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
        createCredential,
        clearError
    }
})