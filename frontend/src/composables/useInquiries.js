import { ref, computed, watch } from 'vue'
import { useInquiriesStore } from '../stores/useInquiriesStore.js'

export const STATUS_OPTIONS = [
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'replied', label: 'Replied' },
    { value: 'quoted', label: 'Quoted' },
]

export function useInquiries() {
    const store = useInquiriesStore()

    // --- list / search / pagination ---
    const searchQuery = ref('')
    const searchInput = ref(null)
    const pageSize = ref(10)
    const pageSizeOptions = [10, 25, 50]
    const currentPage = ref(1)

    const filtered = computed(() => {
        const q = searchQuery.value.trim().toLowerCase()
        if (!q) return store.messages
        return store.messages.filter((m) =>
            [m.full_name, m.email, m.message, m.project_type].some((f) =>
                f?.toLowerCase().includes(q)
            )
        )
    })

    const totalPages = computed(() =>
        Math.max(1, Math.ceil(filtered.value.length / pageSize.value))
    )
    const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
    const endIndex = computed(() =>
        Math.min(startIndex.value + pageSize.value, filtered.value.length)
    )
    const paginatedItems = computed(() =>
        filtered.value.slice(startIndex.value, endIndex.value)
    )

    const pageNumbers = computed(() => {
        const total = totalPages.value
        const current = currentPage.value
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
        const pages = [1]
        if (current > 3) pages.push('...')
        for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
            pages.push(p)
        }
        if (current < total - 2) pages.push('...')
        pages.push(total)
        return pages
    })

    function nextPage() {
        if (currentPage.value < totalPages.value) currentPage.value++
    }
    function prevPage() {
        if (currentPage.value > 1) currentPage.value--
    }
    function goToPage(page) {
        currentPage.value = page
    }

    watch([searchQuery, pageSize], () => {
        currentPage.value = 1
    })

    // --- selection (right-hand detail panel) ---
    const selectedId = ref(null)
    const selectedMessage = computed(
        () => store.messages.find((m) => m.id === selectedId.value) || null
    )

    function selectMessage(msg) {
        selectedId.value = msg.id
        replyText.value = ''
    }

    // auto-select the first row once data loads, and keep selection valid
    // if the currently-open inquiry gets deleted
    watch(
        () => store.messages,
        (msgs) => {
            if (!msgs.length) {
                selectedId.value = null
                return
            }
            if (!selectedId.value || !msgs.some((m) => m.id === selectedId.value)) {
                selectedId.value = msgs[0].id
            }
        },
        { immediate: true }
    )

    // --- reply drafting ---
    const replyText = ref('')
    const sendingReply = computed(() =>
        selectedId.value ? store.sendingReplyIds.includes(selectedId.value) : false
    )

    async function handleSendReply() {
        if (!selectedMessage.value || !replyText.value.trim()) {
            return { success: false, message: 'Write a reply before sending.' }
        }
        const result = await store.sendReply(selectedMessage.value.id, replyText.value.trim())
        if (result.success) {
            replyText.value = ''
        }
        return result
    }

    // --- status changes ---
    const updatingStatus = computed(() =>
        selectedId.value ? store.updatingStatusIds.includes(selectedId.value) : false
    )

    async function handleStatusChange(status) {
        if (!selectedMessage.value) {
            return { success: false, message: 'No inquiry selected.' }
        }
        return store.updateStatus(selectedMessage.value.id, status)
    }

    // --- delete ---
    const deleting = computed(() =>
        selectedId.value ? store.deletingIds.includes(selectedId.value) : false
    )

    async function handleDelete(msg) {
        if (!msg) return { success: false, message: 'No inquiry selected.' }
        return store.deleteMessage(msg.id)
    }

    // --- formatting helpers ---
    function formatDate(value) {
        if (!value) return ''
        const d = new Date(value)
        return d.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        }).replace(',', ' at ')
    }

    function formatShortDate(value) {
        if (!value) return ''
        return new Date(value).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    function initials(name) {
        if (!name) return ''
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((n) => n[0]?.toUpperCase())
            .join('')
    }

    return {
        // store passthrough
        messages: computed(() => store.messages),
        loading: computed(() => store.loading),
        error: computed(() => store.error),
        statusCounts: computed(() => store.statusCounts),
        fetchMessages: store.fetchMessages,

        // list / search / pagination
        searchQuery,
        searchInput,
        pageSize,
        pageSizeOptions,
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        filtered,
        paginatedItems,
        pageNumbers,
        nextPage,
        prevPage,
        goToPage,

        // selection + detail panel
        selectedMessage,
        selectMessage,

        // reply
        replyText,
        sendingReply,
        handleSendReply,

        // status
        STATUS_OPTIONS,
        updatingStatus,
        handleStatusChange,

        // delete
        deleting,
        handleDelete,

        // formatting
        formatDate,
        formatShortDate,
        initials,
    }
}