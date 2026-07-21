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
            console.log('Fetching credentials from:', url)

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch credentials: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            console.log('API Response:', data)

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
                project: item.project || item.project_name || 'Uncategorized',
                showPassword: false,
                needsRotation: item.needsRotation || false,
                created_at: item.created_at || item.createdAt || new Date().toISOString()
            }))

            totalCount.value = data.count || credentials.value.length

            return { success: true, data: credentials.value }

        } catch (err) {
            error.value = err.message
            console.error('Error fetching credentials:', err)
            return { success: false, error: err.message }
        } finally {
            loading.value = false
        }
    }

    // Fetch employee credentials
    const fetchEmployeeCredentials = async (employeeId) => {
        loading.value = true
        error.value = null

        try {
            const cleanedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
            const endpoint = API_ENDPOINTS.CREDENTIALS.GET_EMPLOYEE_CREDENTIALS(employeeId);
            const fullUrl = `${cleanedBaseUrl}${endpoint}`;

            console.log('🔵 Fetching employee credentials from:', fullUrl);

            const token = getAuthToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(fullUrl, { method: 'GET', headers });

            if (response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            console.log(' Employee credentials response:', data);

            if (data.status === 'success' && data.credentials) {
                credentials.value = data.credentials.map(cred => ({
                    ...cred,
                    showPassword: false,
                }));
                totalCount.value = credentials.value.length;
                console.log(' Credentials loaded:', credentials.value.length);
            } else {
                credentials.value = [];
                totalCount.value = 0;
                throw new Error(data.message || 'Failed to fetch credentials');
            }

            return { success: true, data: credentials.value };
        } catch (error) {
            error.value = error.message || 'Failed to fetch employee credentials';
            credentials.value = [];
            totalCount.value = 0;
            console.error(' Error fetching employee credentials:', error);
            return { success: false, error: error.value };
        } finally {
            loading.value = false;
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

    const shareCredential = async (credentialId, employeeIds) => {
        loading.value = true
        error.value = null
        try {
            const token = getAuthToken()

            if (!token) {
                throw new Error('No authentication token found. Please login again.')
            }

            const url = `${BASE_URL}${API_ENDPOINTS.CREDENTIALS.SHARE}`

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    credential_id: credentialId,
                    employee_id: employeeIds
                })
            })

            if (response.status === 401) {
                localStorage.removeItem('access_token')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('token')
                window.location.href = '/login'
                throw new Error('Session expired. Please login again.')
            }

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || `Failed to share credential: ${response.status}`)
            }

            return { success: true, data }

        } catch (err) {
            error.value = err.message
            console.error('Error sharing credential:', err)
            return { success: false, error: err.message }
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
        shareCredential,
        togglePassword,
        clearError
    }
})