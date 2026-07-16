<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import AdminSidebar from '../../../components/adminSidebar.vue'
import TopHeader from '../../../components/header.vue'
import StatCard from '../../../components/statCard.vue'
import BaseModal from '../../../components/baseModal.vue'
import BaseDetailModal from '../../../components/baseDetailModal.vue'
import { useEmployeeCareer } from '../../../composables/useEmployeeCareer.js'
import { useJobs } from '../../../composables/useJobs.js'
import { useJobStore } from '../../../stores/jobStore.js'
import { useCvStore } from '../../../stores/cvStore.js'
import { useToast } from '../../../composables/useToast.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const { showToast } = useToast()
const jobStore = useJobStore()
const cvStore = useCvStore()

const {
  formData, formErrors, isClosed, isSubmitting,
  toggleStatus, createJob, resetForm,
  adminJobs, loadingAdmin, fetchAdminJobs, updateJob,
} = useJobs()

const {
  cvSubmissions, cvLoading, cvSearchQuery,
  fetchCVSubmissions, formatDate, initials,
  removeApplicant, confirmDelete, cancelDelete, showDeleteConfirm,
  selectedJobForCVs, cvCountForJob, openJobCVs, backToJobsList, jobFilteredCVs,
  generalApplicationsCount, openGeneralApplications,
} = useEmployeeCareer()

const STATUS_MAP = { 1: 'New', 2: 'Reviewed', 3: 'Shortlisted', 4: 'Rejected' }
const STATUS_MAP_REVERSE = { New: 1, Reviewed: 2, Shortlisted: 3, Rejected: 4 }
const statusOptions = Object.keys(STATUS_MAP_REVERSE)

const tabs = [
  { key: 'site-openings', label: 'Site openings', icon: ['fas', 'globe'] },
  { key: 'cv-applications', label: 'CV applications', icon: ['fas', 'desktop'] },
]
const activeTab = ref('site-openings')

const jobStatus = ref([])
const jobTypes = ref([])

const statusClasses = (name) => ({
  Published: 'bg-success-subtle text-success',
  Draft: 'bg-warning-subtle text-warning',
  Closed: 'bg-primary-subtle text-primary',
}[name] || 'bg-surface-alt text-text-secondary')

const getJobStatusName = (job) =>
    jobStatus.value.find(s => s.id === Number(job.status))?.name || 'Unknown'

// ── Dynamic top-header title/subtitle/back button ──
const headerTitle = computed(() =>
    activeTab.value === 'cv-applications' && selectedJobForCVs.value
        ? selectedJobForCVs.value.job_title
        : 'Careers'
)
const headerSubtitle = computed(() =>
    activeTab.value === 'cv-applications' && selectedJobForCVs.value
        ? 'Viewing CV applicants for this role'
        : null
)

// ── Inline status dropdown (Teleported to <body>, escapes table overflow) ──
const openStatusDropdownId = ref(null)
const dropdownPosition = ref({ top: 0, left: 0 })

const toggleStatusDropdown = (jobId, event) => {
  if (openStatusDropdownId.value === jobId) {
    openStatusDropdownId.value = null
    return
  }
  const rect = event.currentTarget.getBoundingClientRect()
  dropdownPosition.value = { top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX }
  openStatusDropdownId.value = jobId
}
const closeStatusDropdown = () => { openStatusDropdownId.value = null }

const updateJobStatusInline = async (job, newStatusId) => {
  if (!job || Number(job.status) === Number(newStatusId)) {
    openStatusDropdownId.value = null
    return
  }
  const previousStatus = job.status
  job.status = newStatusId // optimistic update
  openStatusDropdownId.value = null

  const updated = await updateJob(job.id, { ...job, status: newStatusId })
  if (!updated) job.status = previousStatus // revert on failure
}

// ── Stat counts ──
const publishedCount = computed(() => adminJobs.value.filter(j => getJobStatusName(j).toLowerCase() === 'published').length)
const draftCount = computed(() => adminJobs.value.filter(j => getJobStatusName(j).toLowerCase() === 'draft').length)
const newCvsCount = computed(() => cvSubmissions.value.filter(cv => !cv.application_status || Number(cv.application_status) === 1).length)
const totalCvsCount = computed(() => cvSubmissions.value.length)

// ── Jobs table pagination/search ──
// NOTE: This same pagination/search state is intentionally reused by BOTH:
//   1. The "Site openings" table
//   2. The "CV applications" -> "Select a job" grid (STEP 1)
// Since only one tab is rendered at a time (v-if on activeTab), sharing this
// state is safe and avoids duplicating pagination logic.
const jobsPageSize = ref(5)
const jobsPageSizeOptions = [5, 10, 20, 50]
const jobsCurrentPage = ref(1)
const jobsSearchQuery = ref('')
const jobsPaginationRef = ref(null)

const filteredJobs = computed(() => {
  const q = jobsSearchQuery.value.trim().toLowerCase()
  if (!q) return adminJobs.value
  return adminJobs.value.filter(job =>
      [job.job_title, job.department, job.job_type_name].some(v => v?.toLowerCase().includes(q))
  )
})

const jobsTotalPages = computed(() => Math.max(1, Math.ceil(filteredJobs.value.length / jobsPageSize.value)))
const jobsStartIndex = computed(() => (jobsCurrentPage.value - 1) * jobsPageSize.value)
const jobsEndIndex = computed(() => Math.min(jobsStartIndex.value + jobsPageSize.value, filteredJobs.value.length))
const paginatedJobs = computed(() => filteredJobs.value.slice(jobsStartIndex.value, jobsEndIndex.value))

const jobsPageNumbers = computed(() => {
  const total = jobsTotalPages.value
  const current = jobsCurrentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (current > 3) pages.push('...')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

const keepPaginationInView = () => nextTick(() => jobsPaginationRef.value?.scrollIntoView({ block: 'nearest' }))
const jobsNextPage = () => { if (jobsCurrentPage.value < jobsTotalPages.value) jobsCurrentPage.value++; keepPaginationInView() }
const jobsPrevPage = () => { if (jobsCurrentPage.value > 1) jobsCurrentPage.value--; keepPaginationInView() }
const jobsGoToPage = (page) => { if (page === '...') return; jobsCurrentPage.value = page; keepPaginationInView() }

watch(jobsPageSize, () => { jobsCurrentPage.value = 1; keepPaginationInView() })
watch(jobsSearchQuery, () => { jobsCurrentPage.value = 1 })
watch(adminJobs, () => { if (jobsCurrentPage.value > jobsTotalPages.value) jobsCurrentPage.value = jobsTotalPages.value })

// ── Post/Edit Job Modal ──
const showJobModal = ref(false)
const modalTitle = computed(() => formData.id ? 'Edit Job Opening' : 'Create Job Opening')

const openJobModal = () => { resetForm(); showJobModal.value = true }
const closeJobModal = () => { showJobModal.value = false; resetForm() }

const handleEditJob = (job) => {
  Object.assign(formData, {
    id: job.id,
    job_title: job.job_title,
    job_type: job.job_type,
    department: job.department,
    location: job.location,
    salary_range: job.salary_range,
    description: job.description,
    requirements: job.requirements,
    status: Number(job.status),
  })
  showJobModal.value = true
}

// Toasts (created/published/draft/updated) are fired inside useJobs.js
// (createJob / updateJob) — nothing to do here except refresh + close.
const handleCreateJob = async () => {
  const saved = formData.id ? await updateJob(formData.id, { ...formData }) : await createJob()
  if (saved) {
    await fetchAdminJobs()
    closeJobModal()
  }
}

// ── View Job Modal ──
const showViewModal = ref(false)
const viewingJob = ref(null)

const handleViewJob = (job) => { viewingJob.value = job; showViewModal.value = true }
const closeViewModal = () => { showViewModal.value = false; viewingJob.value = null }
const editFromView = () => { if (viewingJob.value) handleEditJob(viewingJob.value); closeViewModal() }

// ── Lookups ──
const fetchJobTypes = async () => {
  try {
    await jobStore.fetchJobTypes()
    jobTypes.value = jobStore.jobTypes || []
  } catch {
    showToast('Failed to load job types.', 'error')
  }
}
const fetchjobStatus = async () => {
  try {
    await jobStore.fetchjobStatus()
    jobStatus.value = jobStore.jobStatus || []
  } catch {
    showToast('Failed to load job statuses.', 'error')
  }
}

onMounted(() => {
  fetchAdminJobs()
  fetchJobTypes()
  fetchjobStatus()
  document.addEventListener('click', closeStatusDropdown)
})
onUnmounted(() => document.removeEventListener('click', closeStatusDropdown))

// ── Job → CVs drill-down ──
const selectedApplicantId = ref(null)

const handleOpenJobCVs = (job) => { selectedApplicantId.value = null; openJobCVs(job) }
const handleOpenGeneralApplications = () => { selectedApplicantId.value = null; openGeneralApplications() }
const handleBackToJobs = () => { selectedApplicantId.value = null; backToJobsList() }

const selectedApplicant = computed(() =>
    jobFilteredCVs.value.find(a => a.id === selectedApplicantId.value) || jobFilteredCVs.value[0] || null
)

const ensureSelection = () => {
  if (jobFilteredCVs.value.length && !jobFilteredCVs.value.some(a => a.id === selectedApplicantId.value)) {
    selectedApplicantId.value = jobFilteredCVs.value[0]?.id
  }
}
watch(jobFilteredCVs, ensureSelection, { immediate: true })

const avatarPalette = [
  { bg: 'bg-indigo-200', text: 'text-indigo-700' },
  { bg: 'bg-blue-200', text: 'text-blue-700' },
  { bg: 'bg-teal-200', text: 'text-teal-700' },
  { bg: 'bg-purple-200', text: 'text-purple-700' },
  { bg: 'bg-amber-200', text: 'text-amber-700' },
]
const avatarStyle = (id) => avatarPalette[id % avatarPalette.length]

// ── CV status update ──
const updateCVStatus = async (applicantId, status) => {
  const result = await cvStore.updateStatus(applicantId, { application_status: STATUS_MAP_REVERSE[status] })
  showToast(result.success ? 'CV status updated successfully.' : (result.error || 'Failed to update CV status.'), result.success ? 'success' : 'error')
  await fetchCVSubmissions()
}

const applicantStatus = computed({
  get: () => STATUS_MAP[selectedApplicant.value?.application_status] || 'New',
  set: (val) => selectedApplicant.value && updateCVStatus(selectedApplicant.value.id, val),
})

// ── Email candidate modal ──
const showEmailModal = ref(false)
const emailForm = ref({ to: '', subject: '', message: '' })

const openEmailModal = (applicant) => {
  emailForm.value = {
    to: applicant.email,
    subject: 'Regarding your application',
    message: `Hello,\n\nThank you for applying. We wanted to reach out regarding your application.\n\nBest regards,\nRasant Solutions`,
  }
  showEmailModal.value = true
}
const closeEmailModal = () => { showEmailModal.value = false }

const sendEmail = async () => {
  const { to, subject, message } = emailForm.value
  const result = await cvStore.sendCandidateEmail({ email: to, subject, message })
  if (result.success) {
    showToast(`Email sent to ${to}`, 'success')
    closeEmailModal()
  } else {
    showToast(result.error, 'error')
  }
}

// ── CV preview (rendered via pdf.js — matches site styling, no browser chrome) ──
const cvPreviewType = ref('')
const cvPreviewLoading = ref(false)
const showCvPreview = ref(false)
const cvPreviewBlob = ref(null)
const cvPreviewImgUrl = ref(null)
const pdfContainer = ref(null)

let cvRequestId = 0 // guards against stale async renders overlapping (fixes duplicate CV bug)

const revokePreview = () => {
  if (cvPreviewImgUrl.value) {
    URL.revokeObjectURL(cvPreviewImgUrl.value)
    cvPreviewImgUrl.value = null
  }
  cvPreviewBlob.value = null
  if (pdfContainer.value) pdfContainer.value.innerHTML = ''
}

const renderPdf = async (arrayBuffer, requestId) => {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    if (requestId !== cvRequestId) return

    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 1.4 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    canvas.className = 'block mx-auto mb-4 max-w-full h-auto bg-white border border-border-subtle rounded-md shadow-sm'
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise

    if (requestId !== cvRequestId) return
    pdfContainer.value?.appendChild(canvas)
  }
}

const viewCV = async (applicant) => {
  const requestId = ++cvRequestId
  showCvPreview.value = true
  cvPreviewLoading.value = true
  revokePreview()

  const result = await cvStore.previewCV(applicant.id)
  if (requestId !== cvRequestId) return
  cvPreviewLoading.value = false

  if (!result.success) {
    showToast(result.error || 'Failed to load CV.', 'error')
    showCvPreview.value = false
    return
  }

  cvPreviewType.value = result.contentType
  cvPreviewBlob.value = result.blob

  if (result.contentType.includes('pdf')) {
    await nextTick()
    if (requestId !== cvRequestId) return
    const arrayBuffer = await result.blob.arrayBuffer()
    if (requestId !== cvRequestId) return
    await renderPdf(arrayBuffer, requestId)
  } else if (result.contentType.includes('image')) {
    cvPreviewImgUrl.value = URL.createObjectURL(result.blob)
  }
}

const closeCvPreview = () => { showCvPreview.value = false; revokePreview() }

const downloadPreviewedCV = () => {
  if (!cvPreviewBlob.value || !selectedApplicant.value) return
  const url = URL.createObjectURL(cvPreviewBlob.value)
  const link = document.createElement('a')
  link.href = url
  link.download = `CV_${selectedApplicant.value.full_name.replace(/\s/g, '_')}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

// Load preview only when the actual applicant changes (by id), not on every
// array/reference change from a refetch — this is what caused the duplicate preview.
watch(() => selectedApplicant.value?.id, (id) => {
  id ? viewCV(selectedApplicant.value) : closeCvPreview()
}, { immediate: true })
</script>

<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <TopHeader
            userName="System Admin"
            role="admin"
            :notificationCount="3"
            :titleOverride="headerTitle"
            :subtitleOverride="headerSubtitle"
            :showBack="activeTab === 'cv-applications' && !!selectedJobForCVs"
            @back="handleBackToJobs"
        />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-4 space-y-4">
        <div v-if="!(activeTab === 'cv-applications' && selectedJobForCVs)" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Live on Site" :value="publishedCount" :icon="['fas', 'globe']" color="pink" />
          <StatCard label="New CVs" :value="newCvsCount" :icon="['fas', 'inbox']" color="purple" />
          <StatCard label="Draft Posts" :value="draftCount" :icon="['fas', 'pen-to-square']" color="blue" />
          <StatCard label="Total CVs" :value="totalCvsCount" :icon="['fas', 'clipboard-list']" color="teal" />
        </div>

        <!-- Pill Tab Navigation -->
        <div v-if="!(activeTab === 'cv-applications' && selectedJobForCVs)" class="w-full overflow-x-auto scrollbar-hide">
          <div class="inline-flex items-center gap-1 bg-white border border-border rounded-lg shadow-sm p-1">
            <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="activeTab = tab.key"
                class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold duration-200 cursor-pointer whitespace-nowrap"
                :class="activeTab === tab.key ? 'tab-active-gradient shadow-md' : 'text-gray-500 hover:bg-blue-50 hover:text-[#4A90E2]'"
            >
              <font-awesome-icon :icon="tab.icon" class="w-3.5 h-3.5 flex-shrink-0" />
              {{ tab.label }}
            </button>
          </div>
        </div>
        <router-view />

        <!-- Jobs Table (Site Openings) -->
        <div v-if="activeTab === 'site-openings'" class="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div class="flex items-center justify-between p-4 sm:p-5 flex-wrap gap-3">
            <div>
              <h2 class="text-lg font-bold text-text-primary">Published & draft openings</h2>
              <p class="text-sm text-text-muted mt-0.5">Manage job posts shown on the public careers page.</p>
            </div>
            <button @click="openJobModal" class="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg shadow-lg transition-all duration-300 cursor-pointer btn-primary-gradient">
              <font-awesome-icon :icon="['fas', 'plus']" class="w-3.5 h-3.5" />
              Add new job
            </button>
          </div>

          <div v-if="adminJobs.length > 0" ref="jobsPaginationRef" class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-border-subtle">
            <div class="relative w-full sm:w-64">
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input v-model="jobsSearchQuery" type="text" placeholder="Search jobs..."
                     class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div class="flex items-center gap-2 text-sm text-text-muted">
              <span>Rows per page</span>
              <div class="relative">
                <select v-model.number="jobsPageSize" class="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white border border-border rounded-lg text-text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option v-for="size in jobsPageSizeOptions" :key="size" :value="size">{{ size }}</option>
                </select>
                <font-awesome-icon :icon="['fas', 'chevron-down']" class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted w-2.5 h-2.5" />
              </div>
            </div>
          </div>

          <div v-if="loadingAdmin" class="text-center py-10 text-text-muted text-sm border-t border-border-subtle">Loading jobs...</div>

          <div v-else-if="adminJobs.length === 0" class="text-center py-16 border-t border-border-subtle">
            <div class="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-3">
              <font-awesome-icon :icon="['fas', 'globe']" class="text-text-muted text-lg" />
            </div>
            <p class="text-text-secondary font-medium">No job openings yet</p>
            <p class="text-sm text-text-muted mt-1">Create one using "Add new job".</p>
          </div>
          <div v-else-if="filteredJobs.length === 0" class="text-center py-16 border-t border-border-subtle">
            <p class="text-text-secondary font-medium">No jobs match your search</p>
            <p class="text-sm text-text-muted mt-1">Try a different keyword.</p>
          </div>

          <!-- Table (desktop) + Cards (mobile) -->
          <div v-else>
            <!-- Desktop/Tablet: Table view -->
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                <tr class="border-t border-border-subtle">
                  <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Role</th>
                  <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Type</th>
                  <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Department</th>
                  <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Posted</th>
                  <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Status</th>
                  <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="job in paginatedJobs" :key="job.id" class="border-t border-border-subtle hover:bg-surface/50 transition">
                  <td class="px-4 sm:px-5 py-4">
                    <p class="font-semibold text-text-primary">{{ job.job_title }}</p>
                  </td>
                  <td class="px-4 sm:px-5 py-4 text-text-secondary whitespace-nowrap">{{ job.job_type_name }}</td>
                  <td class="px-4 sm:px-5 py-4 text-text-secondary whitespace-nowrap">{{ job.department }}</td>
                  <td class="px-4 sm:px-5 py-4 text-text-secondary whitespace-nowrap">{{ formatDate(job.created_at) }}</td>
                  <td class="px-4 sm:px-5 py-4">
                    <button type="button" @click.stop="toggleStatusDropdown(job.id, $event)"
                            class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white text-xs font-semibold text-text-primary hover:border-primary/40 transition cursor-pointer capitalize">
                      {{ getJobStatusName(job) }}
                      <font-awesome-icon :icon="['fas', 'chevron-down']" class="w-2.5 h-2.5 text-text-muted transition-transform" :class="{ 'rotate-180': openStatusDropdownId === job.id }" />
                    </button>
                  </td>
                  <td class="px-4 sm:px-5 py-4">
                    <div class="flex items-center gap-2">
                      <button @click="handleEditJob(job)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-border text-text-secondary hover:bg-surface transition cursor-pointer" title="Edit">
                        <font-awesome-icon :icon="['fas', 'pen']" class="w-3 h-3" />
                      </button>
                      <button @click="handleViewJob(job)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-border text-text-secondary hover:bg-surface transition cursor-pointer" title="View">
                        <font-awesome-icon :icon="['fas', 'eye']" class="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile: Card view -->
            <div class="md:hidden space-y-3 p-4">
              <div
                  v-for="job in paginatedJobs"
                  :key="job.id"
                  class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-blue-200 text-blue-700">
                      {{ job.job_title?.slice(0, 2).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-text-primary truncate">{{ job.job_title }}</p>
                      <p class="text-xs text-text-muted truncate">{{ job.job_type_name }} · {{ job.department }}</p>
                    </div>
                  </div>
                  <p class="text-xs text-text-muted whitespace-nowrap shrink-0">{{ formatDate(job.created_at) }}</p>
                </div>

                <div class="border-t border-gray-100"></div>

                <div class="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs">
                  <div>
                    <p class="text-text-muted uppercase tracking-wide text-[10px] font-semibold mb-0.5">Status</p>
                    <button type="button" @click.stop="toggleStatusDropdown(job.id, $event)"
                            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-white text-[11px] font-semibold text-text-primary capitalize">
                      {{ getJobStatusName(job) }}
                      <font-awesome-icon :icon="['fas', 'chevron-down']" class="w-2 h-2 text-text-muted transition-transform" :class="{ 'rotate-180': openStatusDropdownId === job.id }" />
                    </button>
                  </div>
                  <div>
                    <p class="text-text-muted uppercase tracking-wide text-[10px] font-semibold mb-0.5">Actions</p>
                    <div class="flex items-center gap-2">
                      <button @click="handleEditJob(job)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-border text-text-secondary" title="Edit">
                        <font-awesome-icon :icon="['fas', 'pen']" class="w-3 h-3" />
                      </button>
                      <button @click="handleViewJob(job)" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-border text-text-secondary" title="View">
                        <font-awesome-icon :icon="['fas', 'eye']" class="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="adminJobs.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-border-subtle">
            <span class="text-sm text-text-muted whitespace-nowrap">
              {{ adminJobs.length === 0 ? 0 : jobsStartIndex + 1 }}–{{ jobsEndIndex }} of {{ adminJobs.length }}
            </span>

            <div class="flex items-center gap-1">
              <button @click="jobsPrevPage" :disabled="jobsCurrentPage === 1" class="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer" title="Previous page">
                <font-awesome-icon :icon="['fas', 'chevron-left']" class="w-3 h-3" />
              </button>

              <button v-for="(page, idx) in jobsPageNumbers" :key="`${page}-${idx}`" @click="jobsGoToPage(page)" :disabled="page === '...'"
                      class="min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-sm font-semibold transition cursor-pointer"
                      :class="page === jobsCurrentPage ? 'dash-topbar-profile text-white shadow-md' : page === '...' ? 'text-text-muted cursor-default' : 'text-text-secondary border border-border hover:bg-blue-50 hover:text-[#4A90E2]'">
                {{ page }}
              </button>

              <button @click="jobsNextPage" :disabled="jobsCurrentPage === jobsTotalPages" class="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer" title="Next page">
                <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-3 h-3" />
              </button>
            </div>
          </div>

          <Teleport to="body">
            <div v-if="openStatusDropdownId !== null" class="fixed z-[9999] w-36 bg-white border border-border rounded-lg shadow-lg py-1"
                 :style="{ top: dropdownPosition.top + 'px', left: dropdownPosition.left + 'px' }" @click.stop>
              <button v-for="s in jobStatus" :key="s.id" type="button"
                      @click="updateJobStatusInline(adminJobs.find(j => j.id === openStatusDropdownId), s.id)"
                      class="w-full flex items-center px-3 py-2 text-xs hover:bg-surface transition cursor-pointer capitalize"
                      :class="Number(adminJobs.find(j => j.id === openStatusDropdownId)?.status) === Number(s.id) ? 'text-text-muted' : 'text-text-primary'">
                {{ s.name }}
              </button>
            </div>
          </Teleport>
        </div>

        <!-- CV Applications -->
        <div v-if="activeTab === 'cv-applications'">
          <!-- STEP 1: Jobs list (reuses the SAME search/pagination state as Site Openings) -->
          <div v-if="!selectedJobForCVs" class="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div class="p-4 sm:p-5">
              <h2 class="text-lg font-bold text-text-primary">Select a job to view applicants</h2>
              <p class="text-sm text-text-muted mt-0.5">Click a job opening to see its CV submissions.</p>
            </div>

            <!-- Search + Rows per page (same controls/state as Site Openings table) -->
            <div v-if="adminJobs.length > 0" ref="jobsPaginationRef" class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-border-subtle">
              <div class="relative w-full sm:w-64">
                <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input v-model="jobsSearchQuery" type="text" placeholder="Search jobs..."
                       class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div class="flex items-center gap-2 text-sm text-text-muted">
                <span>Rows per page</span>
                <div class="relative">
                  <select v-model.number="jobsPageSize" class="appearance-none pl-3 pr-8 py-1.5 text-sm bg-white border border-border rounded-lg text-text-primary cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option v-for="size in jobsPageSizeOptions" :key="size" :value="size">{{ size }}</option>
                  </select>
                  <font-awesome-icon :icon="['fas', 'chevron-down']" class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted w-2.5 h-2.5" />
                </div>
              </div>
            </div>

            <!-- General Applications — ALWAYS visible, first, regardless of
                 loading state, search text, or pagination. Covers CVs
                 submitted with no linked job (job = null on the backend),
                 e.g. when no opening was live at the time, or a walk-in /
                 manually-added entry. Deliberately outside the v-else-if
                 chain below so an empty search result never hides it. -->
            <div class="p-4 sm:p-5 pb-0 border-t border-border-subtle">
              <button @click="handleOpenGeneralApplications"
                      class="w-full sm:w-auto sm:min-w-[280px] text-left p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:shadow-md transition bg-primary-subtle/30 cursor-pointer">
                <div class="flex items-start justify-between gap-2">
                  <p class="font-semibold text-text-primary text-sm">General Applications</p>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 bg-surface-alt text-text-secondary">
                    No job
                  </span>
                </div>
                <p class="text-xs text-text-muted mt-1">CVs submitted without a specific job opening</p>
                <div class="flex items-center gap-1.5 mt-3 text-primary">
                  <font-awesome-icon :icon="['fas', 'inbox']" class="w-3 h-3" />
                  <span class="text-xs font-semibold">{{ generalApplicationsCount }} CV{{ generalApplicationsCount === 1 ? '' : 's' }}</span>
                </div>
              </button>
            </div>

            <div v-if="loadingAdmin" class="text-center py-10 text-text-muted text-sm">Loading jobs...</div>
            <div v-else-if="adminJobs.length === 0" class="text-center py-16">
              <p class="text-text-secondary font-medium">No job openings yet</p>
            </div>
            <div v-else-if="filteredJobs.length === 0" class="text-center py-16">
              <p class="text-text-secondary font-medium">No jobs match your search</p>
              <p class="text-sm text-text-muted mt-1">Try a different keyword.</p>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 sm:p-5">
              <button v-for="job in paginatedJobs" :key="job.id" @click="handleOpenJobCVs(job)"
                      class="text-left p-4 rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition bg-white cursor-pointer">
                <div class="flex items-start justify-between gap-2">
                  <p class="font-semibold text-text-primary text-sm">{{ job.job_title }}</p>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0" :class="statusClasses(getJobStatusName(job))">
                    {{ getJobStatusName(job) }}
                  </span>
                </div>
                <p class="text-xs text-text-muted mt-1">{{ job.department }} · {{ job.location }}</p>
                <div class="flex items-center gap-1.5 mt-3 text-primary">
                  <font-awesome-icon :icon="['fas', 'inbox']" class="w-3 h-3" />
                  <span class="text-xs font-semibold">{{ cvCountForJob(job) }} CV{{ cvCountForJob(job) === 1 ? '' : 's' }}</span>
                </div>
              </button>
            </div>

            <!-- Pagination footer (same state as Site Openings) -->
            <div v-if="adminJobs.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-border-subtle">
              <span class="text-sm text-text-muted whitespace-nowrap">
                {{ adminJobs.length === 0 ? 0 : jobsStartIndex + 1 }}–{{ jobsEndIndex }} of {{ adminJobs.length }}
              </span>

              <div class="flex items-center gap-1">
                <button @click="jobsPrevPage" :disabled="jobsCurrentPage === 1" class="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer" title="Previous page">
                  <font-awesome-icon :icon="['fas', 'chevron-left']" class="w-3 h-3" />
                </button>

                <button v-for="(page, idx) in jobsPageNumbers" :key="`${page}-${idx}`" @click="jobsGoToPage(page)" :disabled="page === '...'"
                        class="min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-sm font-semibold transition cursor-pointer"
                        :class="page === jobsCurrentPage ? 'dash-topbar-profile text-white shadow-md' : page === '...' ? 'text-text-muted cursor-default' : 'text-text-secondary border border-border hover:bg-blue-50 hover:text-[#4A90E2]'">
                  {{ page }}
                </button>

                <button @click="jobsNextPage" :disabled="jobsCurrentPage === jobsTotalPages" class="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer" title="Next page">
                  <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 2: Applicants for selected job — fixed-height panels, internal scroll only -->
          <div v-else class="flex flex-col lg:flex-row gap-4 items-start lg:h-[calc(112vh-190px)]">
            <!-- Left: Applicant list -->
            <div class="w-full lg:w-72 lg:shrink-0 lg:h-full bg-gradient-to-b from-accent-subtle to-white border border-border rounded-xl shadow-sm p-4 flex flex-col overflow-hidden">
              <div class="flex items-center justify-between mb-3">
                <p class="text-[11px] font-semibold text-text-muted tracking-wide uppercase">CV Submissions</p>
                <button @click="fetchCVSubmissions().then(ensureSelection)" :disabled="cvLoading" class="text-text-muted hover:text-text-secondary disabled:opacity-50 cursor-pointer" title="Refresh">
                  <font-awesome-icon :icon="cvLoading ? ['fas', 'spinner'] : ['fas', 'arrow-rotate-right']" :class="{ 'animate-spin': cvLoading }" class="w-3.5 h-3.5" />
                </button>
              </div>

              <div class="relative mb-3">
                <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                <input v-model="cvSearchQuery" type="text" placeholder="Search applicants..."
                       class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>

              <div v-if="cvLoading" class="space-y-2">
                <div v-for="i in 3" :key="i" class="p-3 rounded-lg bg-white border border-transparent animate-pulse flex gap-2.5">
                  <div class="w-9 h-9 rounded-full bg-border shrink-0"></div>
                  <div class="flex-1 space-y-1.5">
                    <div class="h-2.5 bg-border rounded w-3/4"></div>
                    <div class="h-2.5 bg-border rounded w-1/2"></div>
                  </div>
                </div>
              </div>

              <div v-else-if="jobFilteredCVs.length === 0" class="text-center py-10 text-text-muted text-xs">
                {{ cvSearchQuery ? 'No applicants match your search.' : 'No CVs for this job yet.' }}
              </div>

              <div v-else class="space-y-2 flex-1 overflow-y-auto pr-1">
                <button v-for="applicant in jobFilteredCVs" :key="applicant.id" @click="selectedApplicantId = applicant.id"
                        class="w-full text-left p-3 rounded-lg border transition cursor-pointer"
                        :class="selectedApplicant?.id === applicant.id ? 'bg-gradient-to-r from-accent-subtle to-white border-accent-subtle-border shadow-sm' : 'bg-white border-transparent hover:bg-surface'">
                  <div class="flex items-start gap-2.5">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" :class="[avatarStyle(applicant.id).bg, avatarStyle(applicant.id).text]">
                      {{ initials(applicant.full_name) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-2">
                        <p class="font-semibold text-text-primary text-sm truncate">{{ applicant.full_name }}</p>
                        <span class="text-[11px] text-text-muted shrink-0">{{ formatDate(applicant.submitted_at) }}</span>
                      </div>
                      <p class="text-xs text-text-muted truncate">{{ applicant.email }}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Right: Applicant detail -->
            <div v-if="selectedApplicant" class="w-full flex-1 lg:h-full bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <!-- Fixed top section -->
              <div class="relative bg-gradient-to-r from-accent-subtle via-white to-primary-subtle p-4 sm:p-6 shrink-0">
                <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div class="min-w-0">
                    <h2 class="text-lg sm:text-xl font-bold text-text-primary truncate">{{ selectedApplicant.full_name }}</h2>
                    <p class="text-sm font-medium text-text-secondary mt-0.5 truncate">{{ selectedApplicant.email }}</p>
                  </div>

                  <div class="w-full sm:w-auto flex flex-wrap items-center gap-2">
                    <button @click="openEmailModal(selectedApplicant)"
                            class="flex-1 sm:flex-initial min-w-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition shadow-sm cursor-pointer whitespace-nowrap">
                      <font-awesome-icon :icon="['fas', 'paper-plane']" class="w-3.5 h-3.5 shrink-0" />
                      <span class="sm:hidden">Email</span>
                      <span class="hidden sm:inline">Email candidate</span>
                    </button>

                    <div class="relative flex-1 sm:flex-initial min-w-0">
                      <select v-model="applicantStatus" class="w-full appearance-none px-3.5 py-2 pr-9 text-sm font-semibold text-text-primary bg-white border border-border rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
                      </select>
                      <font-awesome-icon :icon="['fas', 'chevron-down']" class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted w-2 h-2" />
                    </div>

                    <button @click="removeApplicant(selectedApplicant.id)"
                            class="flex-1 sm:flex-initial min-w-0 px-4 py-2 text-sm font-semibold text-text-muted bg-white border border-border-subtle rounded-full hover:bg-surface-alt hover:text-text-secondary transition cursor-pointer whitespace-nowrap">
                      Remove
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                  <div class="bg-white border border-border rounded-lg p-3">
                    <p class="text-[10px] font-semibold text-text-muted tracking-wide uppercase">Position</p>
                    <p class="text-sm font-semibold text-text-primary mt-1 truncate">{{ selectedApplicant.desired_position }}</p>
                  </div>
                  <div class="bg-white border border-border rounded-lg p-3">
                    <p class="text-[10px] font-semibold text-text-muted tracking-wide uppercase">Contact</p>
                    <p class="text-sm font-semibold text-text-primary mt-1 truncate">{{ selectedApplicant.phone || '—' }}</p>
                  </div>
                  <div class="bg-white border border-border rounded-lg p-3">
                    <p class="text-[10px] font-semibold text-text-muted tracking-wide uppercase">Submitted</p>
                    <p class="text-sm font-semibold text-text-primary mt-1 truncate">{{ formatDate(selectedApplicant.submitted_at) }}</p>
                  </div>
                </div>
              </div>

              <!-- Scrollable body: only this scrolls -->
              <div class="flex-1 overflow-y-auto">
                <div class="px-4 sm:px-6 py-5 border-t border-border-subtle">
                  <p class="text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-2">Cover Letter</p>
                  <div class="bg-gradient-to-r from-primary-subtle/60 to-surface border border-border-subtle rounded-lg p-4">
                    <p v-if="selectedApplicant.cover_letter" class="text-sm text-primary">{{ selectedApplicant.cover_letter }}</p>
                    <p v-else class="text-sm text-text-muted italic">No cover letter provided.</p>
                  </div>
                </div>

                <div v-if="showCvPreview" class="px-4 sm:px-6 py-5 border-t border-border-subtle">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-[11px] font-semibold text-text-muted tracking-wide uppercase">CV Preview</p>
                    <div class="flex items-center gap-3">
                      <button v-if="cvPreviewBlob" @click="downloadPreviewedCV" class="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer">
                        <font-awesome-icon :icon="['fas', 'download']" class="w-3 h-3" />
                        Download
                      </button>

                    </div>
                  </div>

                  <div v-if="cvPreviewLoading" class="h-[650px] flex items-center justify-center bg-white border border-border-subtle rounded-lg text-text-muted text-sm">
                    Loading CV...
                  </div>

                  <div v-show="!cvPreviewLoading && cvPreviewType.includes('pdf')" ref="pdfContainer" class="w-full overflow-x-hidden bg-white border border-border-subtle rounded-lg p-4"></div>

                  <div v-if="!cvPreviewLoading && cvPreviewType.includes('image')" class="bg-white border border-border-subtle rounded-lg p-4">
                    <img :src="cvPreviewImgUrl" class="max-w-full mx-auto rounded-md" />
                  </div>

                  <div v-if="!cvPreviewLoading && !cvPreviewType.includes('pdf') && !cvPreviewType.includes('image')" class="h-[200px] flex flex-col items-center justify-center gap-2 bg-white border border-border-subtle rounded-lg text-text-muted text-sm">
                    <p>Preview not supported for this file type.</p>
                    <button @click="downloadPreviewedCV" class="text-primary font-semibold hover:underline cursor-pointer">Download instead</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Post/Edit Job Modal -->
        <BaseModal :is-open="showJobModal" mode="form" size="xl" :title="modalTitle"
                   subtitle="Select job type and details — publish immediately or save as draft."
                   :submit-text="isSubmitting ? 'Saving...' : 'Save job post'" :loading="isSubmitting"
                   @close="closeJobModal" @cancel="closeJobModal" @save="handleCreateJob">
          <form @submit.prevent="handleCreateJob">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 w-full">
              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Job Title</label>
                <input v-model="formData.job_title" type="text" placeholder="e.g. Senior React Developer"
                       class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <p v-if="formErrors.job_title" class="text-xs text-danger mt-1">{{ formErrors.job_title }}</p>
              </div>

              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Job Type</label>
                <div class="relative">
                  <select v-model="formData.job_type" class="w-full min-w-0 appearance-none px-3.5 py-2.5 pr-10 text-sm bg-white border border-border rounded-lg text-text-primary cursor-pointer transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option :value="null" disabled class="text-text-muted">Select type</option>
                    <option v-for="type in jobTypes" :key="type.id" :value="type.id" class="text-text-primary py-2">{{ type.name }}</option>
                  </select>
                  <font-awesome-icon :icon="['fas', 'chevron-down']" class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted w-3 h-3" />
                </div>
                <p v-if="formErrors.job_type" class="text-xs text-danger mt-1">{{ formErrors.job_type }}</p>
              </div>

              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Department</label>
                <input v-model="formData.department" type="text" placeholder="Engineering"
                       class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <p v-if="formErrors.department" class="text-xs text-danger mt-1">{{ formErrors.department }}</p>
              </div>

              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Location</label>
                <input v-model="formData.location" type="text" placeholder="Islamabad / Remote"
                       class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                <p v-if="formErrors.location" class="text-xs text-danger mt-1">{{ formErrors.location }}</p>
              </div>

              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Salary Range</label>
                <input v-model="formData.salary_range" type="number" placeholder="e.g. 220000"
                       class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>

              <div class="md:col-span-2 w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Description</label>
                <textarea v-model="formData.description" rows="4" placeholder="Role overview, responsibilities..."
                          class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
                <p v-if="formErrors.description" class="text-xs text-danger mt-1">{{ formErrors.description }}</p>
              </div>

              <div class="md:col-span-2 w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Requirements</label>
                <textarea v-model="formData.requirements" rows="4" placeholder="Skills, experience, education..."
                          class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
                <p v-if="formErrors.requirements" class="text-xs text-danger mt-1">{{ formErrors.requirements }}</p>
              </div>
            </div>

            <label v-if="!formData.id" class="flex items-center gap-2 mt-5 cursor-pointer select-none">
              <input type="checkbox" :checked="isClosed" @change="toggleStatus($event.target.checked)" class="w-4 h-4 rounded accent-primary" />
              <span class="text-sm font-semibold text-text-primary">Publish immediately on careers page</span>
            </label>
          </form>
        </BaseModal>

        <!-- Email Candidate Modal -->
        <BaseModal :is-open="showEmailModal" mode="form" size="lg" title="Email Candidate"
                   :subtitle="`Sending to: ${emailForm.to}`"
                   :submit-text="cvStore.isSendingEmail ? 'Sending...' : 'Send Email'" :loading="cvStore.isSendingEmail"
                   @close="closeEmailModal" @cancel="closeEmailModal" @save="sendEmail">
          <form @submit.prevent="sendEmail">
            <div class="space-y-4">
              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Subject</label>
                <input v-model="emailForm.subject" type="text"
                       class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Message</label>
                <textarea v-model="emailForm.message" rows="8"
                          class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"></textarea>
              </div>
            </div>
          </form>
        </BaseModal>

        <!-- View Job Detail Modal -->
        <BaseDetailModal :is-open="showViewModal" mode="view" title="Job Details" size="md" subtitle="" @close="closeViewModal">
          <div v-if="viewingJob" class="space-y-5">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <p class="font-display text-lg font-bold text-headingCard">{{ viewingJob.job_title }}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-surface border border-border-subtle rounded-lg p-3">
                <p class="text-[10px] font-semibold text-text-muted tracking-wide uppercase">Job Type</p>
                <p class="text-sm font-semibold text-text-primary mt-1">{{ viewingJob.job_type_name || '—' }}</p>
              </div>
              <div class="bg-surface border border-border-subtle rounded-lg p-3">
                <p class="text-[10px] font-semibold text-text-muted tracking-wide uppercase">Department</p>
                <p class="text-sm font-semibold text-text-primary mt-1">{{ viewingJob.department || '—' }}</p>
              </div>
              <div class="bg-surface border border-border-subtle rounded-lg p-3">
                <p class="text-[10px] font-semibold text-text-muted tracking-wide uppercase">Location</p>
                <p class="text-sm font-semibold text-text-primary mt-1">{{ viewingJob.location || '—' }}</p>
              </div>
              <div class="bg-surface border border-border-subtle rounded-lg p-3">
                <p class="text-[10px] font-semibold text-text-muted tracking-wide uppercase">Salary Range</p>
                <p class="text-sm font-semibold text-text-primary mt-1">{{ viewingJob.salary_range || '—' }}</p>
              </div>
              <div class="bg-surface border border-border-subtle rounded-lg p-3 sm:col-span-2">
                <p class="text-[10px] font-semibold text-text-muted tracking-wide uppercase">Posted</p>
                <p class="text-sm font-semibold text-text-primary mt-1">{{ formatDate(viewingJob.created_at) }}</p>
              </div>
            </div>

            <div>
              <p class="text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-2">Description</p>
              <div class="bg-surface border border-border-subtle rounded-lg p-4 text-sm text-text-secondary whitespace-pre-line">
                {{ viewingJob.description || 'No description provided.' }}
              </div>
            </div>

            <div>
              <p class="text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-2">Requirements</p>
              <div class="bg-surface border border-border-subtle rounded-lg p-4 text-sm text-text-secondary whitespace-pre-line">
                {{ viewingJob.requirements || 'No requirements provided.' }}
              </div>
            </div>
          </div>
        </BaseDetailModal>

        <!-- Delete confirmation -->
        <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
          <div @click="cancelDelete" class="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"></div>
          <div class="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border z-10 transform transition-all">
            <h3 class="text-lg font-bold text-text-primary mb-2">Delete CV Submission</h3>
            <p class="text-sm text-text-muted mb-6">Are you sure you want to delete this CV submission? This action cannot be undone.</p>
            <div class="flex items-center justify-end gap-3">
              <button @click="cancelDelete" class="px-4 py-2 text-sm font-semibold text-text-secondary bg-surface hover:bg-surface-alt rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button @click="confirmDelete" class="px-4 py-2 text-sm font-semibold text-white bg-danger hover:bg-danger-hover rounded-xl transition-colors shadow-sm shadow-danger/20 cursor-pointer">Yes, Delete</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>