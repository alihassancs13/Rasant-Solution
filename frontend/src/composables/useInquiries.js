import { ref, computed, watch } from 'vue'
import { useInquiriesStore } from '../stores/useInquiriesStore.js'
import { useToast } from './useToast.js'

export function useInquiries() {
    const store = useInquiriesStore()
    const { showToast } = useToast()

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
    }

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

    // --- statuses (dynamic, from DB) ---
    const statuses = computed(() => store.statuses)
    const fetchStatuses = store.fetchStatuses

    const statusIconPalette = ['inbox', 'spinner', 'reply', 'file-invoice-dollar', 'circle-check', 'flag']
    const statusColorPalette = ['blue', 'amber', 'teal', 'purple', 'pink', 'indigo']

    const statusCards = computed(() =>
        statuses.value.map((s, i) => ({
            key: s.code,
            label: s.name,
            icon: ['fas', statusIconPalette[i % statusIconPalette.length]],
            color: statusColorPalette[i % statusColorPalette.length],
        }))
    )

    function statusLabel(code) {
        return statuses.value.find((s) => s.code === code)?.name || code
    }

    // --- email modal ---
    const showEmailModal = ref(false)
    const emailForm = ref({ to: '', subject: '', message: '' })

    function openEmailModal(msg) {
        const target = msg || selectedMessage.value
        if (!target) return
        emailForm.value = {
            to: target.email,
            subject: 'Re: Your inquiry to Rasant Solutions',
            message: `Hello ${target.full_name},Thank you for reaching out to Rasant Solutions.`,
        }
        showEmailModal.value = true
    }

    function closeEmailModal() {
        showEmailModal.value = false
    }

    const sendingReply = computed(() =>
        selectedId.value ? store.sendingReplyIds.includes(selectedId.value) : false
    )

    async function handleSendReply() {
        if (!selectedMessage.value) {
            showToast('No inquiry selected.', 'error')
            return
        }
        if (!emailForm.value.message.trim()) {
            showToast('Write a message before sending.', 'error')
            return
        }
        const result = await store.sendReply(
            selectedMessage.value.id,
            emailForm.value.message.trim(),
            emailForm.value.subject.trim()
        )
        if (result.success) {
            showToast('Reply sent successfully.', 'success')
            closeEmailModal()
        } else {
            showToast(result.message || 'Failed to send email reply.', 'error')
        }
    }

    // --- status changes ---
    const updatingStatus = computed(() =>
        selectedId.value ? store.updatingStatusIds.includes(selectedId.value) : false
    )

    async function handleStatusChange(status) {
        if (!selectedMessage.value) {
            showToast('No inquiry selected.', 'error')
            return
        }
        const result = await store.updateStatus(selectedMessage.value.id, status)
        if (result.success) {
            showToast('Status updated.', 'success')
        } else {
            showToast(result.message || 'Failed to update status.', 'error')
        }
    }

    // --- delete (with confirmation, career-page style) ---
    const showDeleteConfirm = ref(false)
    const pendingDeleteMsg = ref(null)

    const deleting = computed(() =>
        pendingDeleteMsg.value ? store.deletingIds.includes(pendingDeleteMsg.value.id) : false
    )

    function requestDelete(msg) {
        const target = msg || selectedMessage.value
        if (!target) return
        pendingDeleteMsg.value = target
        showDeleteConfirm.value = true
    }

    function cancelDelete() {
        showDeleteConfirm.value = false
        pendingDeleteMsg.value = null
    }

    async function confirmDelete() {
        if (!pendingDeleteMsg.value) return
        const result = await store.deleteMessage(pendingDeleteMsg.value.id)
        if (result.success) {
            showToast('Inquiry deleted.', 'success')
            showDeleteConfirm.value = false
            pendingDeleteMsg.value = null
        } else {
            showToast(result.message || 'Failed to delete inquiry.', 'error')
        }
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

        // statuses
        statuses,
        fetchStatuses,
        statusCards,
        statusLabel,

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

        // email modal
        showEmailModal,
        emailForm,
        openEmailModal,
        closeEmailModal,
        sendingReply,
        handleSendReply,

        // status
        updatingStatus,
        handleStatusChange,

        // delete
        deleting,
        showDeleteConfirm,
        requestDelete,
        cancelDelete,
        confirmDelete,

        // formatting
        formatDate,
        formatShortDate,
        initials,
    }
}