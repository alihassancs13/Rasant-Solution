import { ref, computed, onMounted, useTemplateRef } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export function useDashboard() {
    // ─── Contact Messages ────────────────────────────────────────
    const messages    = ref([])
    const loading     = ref(false)
    const error       = ref(null)
    const searchQuery = ref('')
    const searchInput = useTemplateRef('searchInput')

    async function fetchMessages() {
        loading.value = true
        error.value   = null
        try {
            const res = await fetch(`${API_BASE}/api/contact/`)
            if (!res.ok) throw new Error(`Server error: ${res.status}`)
            messages.value = await res.json()
        } catch (err) {
            error.value = err.message ?? 'Something went wrong.'
        } finally {
            loading.value = false
        }
    }

    async function deleteMessage(id) {
        if (!confirm('Delete this message?')) return
        try {
            await fetch(`${API_BASE}/api/contact/${id}/`)
            messages.value = messages.value.filter(m => m.id !== id)
        } catch {
            alert('Could not delete message.')
        }
    }

    const filtered = computed(() => {
        const q = searchQuery.value.toLowerCase().trim()
        if (!q) return messages.value
        return messages.value.filter(m =>
            m.full_name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.message.toLowerCase().includes(q),
        )
    })

    // ─── CV Submissions ──────────────────────────────────────────
    const cvSubmissions = ref([])
    const cvLoading     = ref(false)
    const cvError       = ref(null)
    const cvSearchQuery = ref('')

    async function fetchCVSubmissions() {
        cvLoading.value = true
        cvError.value   = null
        try {
            const res = await fetch(`${API_BASE}/api/cv_management/submit-cv/`)
            if (!res.ok) throw new Error(`Server error: ${res.status}`)
            cvSubmissions.value = await res.json()
        } catch (err) {
            cvError.value = err.message ?? 'Something went wrong.'
        } finally {
            cvLoading.value = false
        }
    }

    async function deleteCV(id) {
        if (!confirm('Delete this CV submission?')) return
        try {
            await fetch(`${API_BASE}/api/cv_management/submit-cv/${id}/`)
            cvSubmissions.value = cvSubmissions.value.filter(c => c.id !== id)
        } catch {
            alert('Could not delete CV submission.')
        }
    }

    const filteredCVs = computed(() => {
        const q = cvSearchQuery.value.toLowerCase().trim()
        if (!q) return cvSubmissions.value
        return cvSubmissions.value.filter(c =>
            c.full_name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.desired_position.toLowerCase().includes(q),
        )
    })

    // ─── Helpers ─────────────────────────────────────────────────
    function formatDate(iso) {
        return new Date(iso).toLocaleDateString('en-PK', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })
    }

    function initials(name) {
        return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    }

    // ─── Init ────────────────────────────────────────────────────
    onMounted(() => {
        fetchMessages()
        fetchCVSubmissions()
        searchInput.value?.focus()
    })

    return {
        // contact
        messages, loading, error, searchQuery, searchInput,
        fetchMessages, deleteMessage, filtered,
        // cv
        cvSubmissions, cvLoading, cvError, cvSearchQuery,
        fetchCVSubmissions, deleteCV, filteredCVs,
        // helpers
        formatDate, initials,
        // shared
        API_BASE,
    }
}