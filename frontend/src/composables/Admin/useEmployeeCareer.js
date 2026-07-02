import { ref, computed, onMounted, useTemplateRef, watch } from 'vue'
import { contactAPI, cvAPI } from '@/services/cvAPI.js'
import axios from "axios";

export function useEmployeeCareer() {
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
            const res = await contactAPI.getAll()
            messages.value = res.data
        } catch (err) {
            error.value = err.response?.data?.detail ?? err.message ?? 'Something went wrong.'
        } finally {
            loading.value = false
        }
    }

    async function deleteMessage(id) {
        if (!confirm('Delete this message?')) return
        try {
            await contactAPI.delete(id)
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

    // ─── Pagination (Contact Messages) ────────────────────────────
    const currentPage    = ref(1)
    const pageSize       = ref(10)
    const pageSizeOptions = [5, 10, 20, 50]

    const totalPages = computed(() =>
        Math.max(1, Math.ceil(filtered.value.length / pageSize.value))
    )

    const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
    const endIndex   = computed(() =>
        Math.min(startIndex.value + pageSize.value, filtered.value.length)
    )

    const paginatedItems = computed(() =>
        filtered.value.slice(startIndex.value, endIndex.value)
    )

    // Builds page list with ellipsis, e.g. [1, 2, '...', 3, 4]
    const pageNumbers = computed(() => {
        const total = totalPages.value
        const current = currentPage.value
        const pages = []

        if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i)
            return pages
        }

        pages.push(1)

        if (current > 3) pages.push('...')

        const start = Math.max(2, current - 1)
        const end   = Math.min(total - 1, current + 1)
        for (let i = start; i <= end; i++) pages.push(i)

        if (current < total - 2) pages.push('...')

        pages.push(total)

        return pages
    })

    function goToPage(page) {
        if (page === '...') return
        currentPage.value = page
    }

    function nextPage() {
        if (currentPage.value < totalPages.value) currentPage.value++
    }

    function prevPage() {
        if (currentPage.value > 1) currentPage.value--
    }

    watch(searchQuery, () => {
        currentPage.value = 1
    })

    watch(pageSize, () => {
        currentPage.value = 1
    })

    watch(filtered, () => {
        if (currentPage.value > totalPages.value) {
            currentPage.value = totalPages.value
        }
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
            const res = await cvAPI.getAll()
            cvSubmissions.value = res.data
        } catch (err) {
            cvError.value = err.response?.data?.detail ?? err.message ?? 'Something went wrong.'
        } finally {
            cvLoading.value = false
        }
    }

    async function deleteCV(id) {
        if (!confirm('Delete this CV submission?')) return
        try {
            await cvAPI.delete(id)
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

    // ✅
    async function viewCV(cv) {
        const newTab = window.open('', '_blank')
        try {
            const res     = await cvAPI.download(cv.id)
            const blobUrl = URL.createObjectURL(res.data)
            if (newTab) {
                newTab.location.href = blobUrl
            }
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)

        } catch (err) {
            if (newTab) newTab.close()
            alert('Could not open CV file.')
        }
    }
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
        // pagination
        currentPage, totalPages, startIndex, endIndex, pageSize, pageSizeOptions,
        paginatedItems, pageNumbers, nextPage, prevPage, goToPage,
        // cv
        cvSubmissions, cvLoading, cvError, cvSearchQuery,
        fetchCVSubmissions, deleteCV, filteredCVs, viewCV,
        // helpers
        formatDate, initials,
    }
}