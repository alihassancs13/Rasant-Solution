// composables/useEmployeeCareer.js
import { computed, onMounted, useTemplateRef, watch, ref } from 'vue'
import { useContactStore } from '@/stores/contactStore.js'
import { useCvStore } from '@/stores/cvStore.js'
import { useToast } from './useToast.js'

export function useEmployeeCareer() {
    const {showToast} = useToast()
    const contactStore = useContactStore()
    const cvStore = useCvStore()
    const messages = computed(() => contactStore.messages)
    const loading = computed(() => contactStore.isLoading)
    const error = computed(() => contactStore.error)
    const searchQuery = ref('')
    const searchInput = useTemplateRef('searchInput')
    const showDeleteConfirm = ref(false)
    const pendingDeleteId = ref(null)

    async function fetchMessages() {
        const result = await contactStore.fetchMessages()
        if (!result.success) {
            showToast(result.error, 'error')
        }
    }

    async function deleteMessage(id) {
        if (!confirm('Delete this message?')) return
        const result = await contactStore.deleteMessage(id)
        if (result.success) {
            showToast('Message deleted.', 'success')
        } else {
            showToast(result.error, 'error')
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
    const currentPage = ref(1)
    const pageSize = ref(10)
    const pageSizeOptions = [5, 10, 20, 50]

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
        const pages = []

        if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i)
            return pages
        }

        pages.push(1)

        if (current > 3) pages.push('...')

        const start = Math.max(2, current - 1)
        const end = Math.min(total - 1, current + 1)
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

    const cvSubmissions = computed(() => cvStore.cvList)
    const cvLoading = computed(() => cvStore.isLoading)
    const cvError = computed(() => cvStore.error)
    const cvSearchQuery = ref('')

    async function fetchCVSubmissions() {
        const result = await cvStore.fetchCVs()
        if (!result.success) {
            showToast(result.error, 'error')
        }
    }

    async function deleteCV(id) {
        const result = await cvStore.deleteCV(id)
        if (result.success) {
            showToast('CV submission deleted.', 'success')
        } else {
            showToast(result.error, 'error')
        }
    }

    const filteredCVs = computed(() => {
        if (!Array.isArray(cvSubmissions.value)) return []
        const q = cvSearchQuery.value.toLowerCase().trim()
        if (!q) return cvSubmissions.value
        return cvSubmissions.value.filter(c =>
            c.full_name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.desired_position?.toLowerCase().includes(q),
        )
    })
    const GENERAL_APPLICATIONS = Object.freeze({
        id: null,
        job_title: 'General Applications',
        department: null,
        location: null,
        isGeneral: true,
    })

    const selectedJobForCVs = ref(null)
    function cvCountForJob(job) {
        if (!Array.isArray(cvSubmissions.value)) return 0
        if (job?.isGeneral) {
            return cvSubmissions.value.filter(cv => cv.job === null || cv.job === undefined).length
        }
        return cvSubmissions.value.filter(cv => Number(cv.job) === Number(job?.id)).length
    }

    const generalApplicationsCount = computed(() => cvCountForJob(GENERAL_APPLICATIONS))

    function openJobCVs(job) {
        selectedJobForCVs.value = job
    }

    function openGeneralApplications() {
        selectedJobForCVs.value = GENERAL_APPLICATIONS
    }

    function backToJobsList() {
        selectedJobForCVs.value = null
    }
    const jobFilteredCVs = computed(() => {
        if (!selectedJobForCVs.value) return []
        if (selectedJobForCVs.value.isGeneral) {
            return filteredCVs.value.filter(cv => cv.job === null || cv.job === undefined)
        }
        return filteredCVs.value.filter(cv => Number(cv.job) === Number(selectedJobForCVs.value.id))
    })

    async function viewCV(cv) {
        const newTab = window.open('', '_blank')
        const result = await cvStore.downloadCV(cv.id, `${cv.full_name}_CV.pdf`)
        if (!result.success) {
            if (newTab) newTab.close()
            showToast(result.error, 'error')
        } else if (newTab) {
            newTab.close()
        }
    }

    function formatDate(iso) {
        return new Date(iso).toLocaleDateString('en-PK', {
            day: '2-digit', month: 'short', year: 'numeric',
        })
    }

    function initials(name) {
        return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    }
    const removeApplicant = (id) => {
        pendingDeleteId.value = id
        showDeleteConfirm.value = true
    }

    const confirmDelete = async () => {
        const id = pendingDeleteId.value
        showDeleteConfirm.value = false
        pendingDeleteId.value = null
        if (!id) return
        await deleteCV(id)
        await fetchCVSubmissions()

    }

    const cancelDelete = () => {
        showDeleteConfirm.value = false
        pendingDeleteId.value = null
    }

    onMounted(() => {
        fetchMessages()
        fetchCVSubmissions()

        searchInput.value?.focus()
    })

    return {
        messages, loading, error, searchQuery, searchInput,
        fetchMessages, deleteMessage, filtered,
        currentPage, totalPages, startIndex, endIndex, pageSize, pageSizeOptions,
        paginatedItems, pageNumbers, nextPage, prevPage, goToPage,
        cvSubmissions, cvLoading, cvError, cvSearchQuery,
        fetchCVSubmissions, deleteCV, filteredCVs, viewCV,
        formatDate, initials, removeApplicant, confirmDelete, cancelDelete, showDeleteConfirm,
        selectedJobForCVs, cvCountForJob, openJobCVs, backToJobsList, jobFilteredCVs,
        GENERAL_APPLICATIONS, generalApplicationsCount, openGeneralApplications,
    }
}