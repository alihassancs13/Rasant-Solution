<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
const { showToast } = useToast()
const jobStatus = ref([])


const jobStore = useJobStore()
const cvStore = useCvStore()

const activeTab = ref('site-openings')
const jobTypes = ref([])

const tabs = [
  { key: 'site-openings', label: 'Site openings', icon: ['fas', 'globe'] },
  { key: 'cv-applications', label: 'CV applications', icon: ['fas', 'desktop'] }
]

const {
  formData, formErrors, isClosed, isSubmitting,
  toggleStatus, createJob, resetForm,
  adminJobs, loadingAdmin, fetchAdminJobs,
  updateJob,
} = useJobs()

const {
  cvSubmissions, cvLoading, cvSearchQuery,
  fetchCVSubmissions, filteredCVs,
  formatDate, initials,removeApplicant, confirmDelete, cancelDelete, showDeleteConfirm
} = useEmployeeCareer()

const statusClasses = (statusName) => {
  if (statusName === 'Published') return 'bg-success-subtle text-success'
  if (statusName === 'Draft') return 'bg-surface-alt text-text-secondary'
  if (statusName === 'Closed') return 'bg-primary-subtle text-primary'
  return 'bg-warning-subtle text-warning'
}

const publishedCount = computed(
    () => adminJobs.value.filter((j) => getJobStatusName(j).toLowerCase() === 'published').length
)
const draftCount = computed(
    () => adminJobs.value.filter((j) => getJobStatusName(j).toLowerCase() === 'draft').length
)

// ── Post/Edit Job Modal state ────────────────────────────────
const showJobModal = ref(false)
const modalTitle = computed(() => (formData.id ? 'Edit Job Opening' : 'Create Job Opening'))

const openJobModal = () => {
  resetForm()
  showJobModal.value = true
}

const closeJobModal = () => {
  showJobModal.value = false
  resetForm()
}

const showViewModal = ref(false)
const viewingJob = ref(null)

const handleViewJob = (job) => {
  viewingJob.value = job
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  viewingJob.value = null
}

const editFromView = () => {
  if (viewingJob.value) {
    handleEditJob(viewingJob.value)
  }
  closeViewModal()
}


const newCvsCount = computed(() =>
    cvSubmissions.value.filter(cv => {
      const s = Number(cv.application_status)
      return !cv.application_status || s === 1   // null/undefined ya 1 = "New"
    }).length
)
const totalCvsCount = computed(() => cvSubmissions.value.length)
const fetchJobTypes = async () => {
  try {
    await jobStore.fetchJobTypes()
    console.log('jobStore.jobTypes:', jobStore.jobTypes)   // 👈 ye line
    jobTypes.value = jobStore.jobTypes || []
    console.log('jobTypes.value after assign:', jobTypes.value)   // 👈 ye NAYI line add karein
  } catch (err) {
    console.error('Job types fetch error:', err)
    showToast('Failed to load job types.', 'error')
    jobTypes.value = []
  }
}
const handleCreateJob = async () => {
  if (formData.id) {
    // Edit mode
    const updated = await updateJob(formData.id, { ...formData })
    if (updated) {
      await fetchAdminJobs()
      closeJobModal()
    }
  } else {
    // Create mode
    const created = await createJob()
    if (created) {
      await fetchAdminJobs()
      closeJobModal()
    }
  }
}
const fetchjobStatus = async () => {
  try {
    await jobStore.fetchjobStatus()
    jobStatus.value = jobStore.jobStatus || []
  } catch (err) {
    console.error('Job statuses fetch error:', err)
    showToast('Failed to load job statuses.', 'error')
    jobStatus.value = []
  }
}

const handleEditJob = (job) => {
  formData.id = job.id
  formData.job_title = job.job_title
  formData.job_type = job.job_type
  formData.department = job.department
  formData.location = job.location
  formData.salary_range = job.salary_range
  formData.description = job.description
  formData.requirements = job.requirements
  formData.status = Number(job.status)
  showJobModal.value = true
}

onMounted(() => {
  fetchAdminJobs()
  fetchJobTypes()
  fetchjobStatus()
})



const selectedApplicantId = ref(null)

const downloadCV = async (applicant) => {
  const result = await cvStore.downloadCV(applicant.id, `CV_${applicant.full_name.replace(/\s/g, '_')}.pdf`)
  if (result.success) {
    showToast('CV downloaded successfully.', 'success')
  } else {
    showToast(result.error || 'Failed to download CV.', 'error')
  }
}

const updateCVStatus = async (applicantId, status) => {
  const statusMap = { 'New': 1, 'Reviewed': 2, 'Shortlisted': 3, 'Rejected': 4 }
  const result = await cvStore.updateStatus(applicantId, { application_status: statusMap[status] })
  if (result.success) {
    showToast('CV status updated successfully.', 'success')
  } else {
    showToast(result.error || 'Failed to update CV status.', 'error')
  }
  await fetchCVSubmissions()
}
const getJobStatusName = (job) => {
  const match = jobStatus.value.find(s => s.id === Number(job.status))
  return match?.name || 'Unknown'
}


const selectedApplicant = computed(() => {
  if (!filteredCVs.value.length) return null
  return filteredCVs.value.find(a => a.id === selectedApplicantId.value) || filteredCVs.value[0]
})

const ensureSelection = () => {
  if (filteredCVs.value.length && !filteredCVs.value.some(a => a.id === selectedApplicantId.value)) {
    selectedApplicantId.value = filteredCVs.value[0]?.id
  }
}

const statusOptions = ['New', 'Reviewed', 'Shortlisted', 'Rejected']
const localStatusMap = ref({})

const applicantStatus = computed({
  get: () => {
    const applicant = selectedApplicant.value
    if (!applicant) return 'New'
    const statusMap = { 1: 'New', 2: 'Reviewed', 3: 'Shortlisted', 4: 'Rejected' }
    return localStatusMap.value[applicant.id] || statusMap[applicant.application_status] || 'New'
  },
  set: async (val) => {
    const applicant = selectedApplicant.value
    if (!applicant) return
    localStatusMap.value[applicant.id] = val
    await updateCVStatus(applicant.id, val)
  }
})

const avatarPalette = [
  { bg: 'bg-indigo-200', text: 'text-indigo-700' },
  { bg: 'bg-blue-200', text: 'text-blue-700' },
  { bg: 'bg-teal-200', text: 'text-teal-700' },
  { bg: 'bg-purple-200', text: 'text-purple-700' },
  { bg: 'bg-amber-200', text: 'text-amber-700' },
]
const avatarStyle = (id) => avatarPalette[id % avatarPalette.length]

watch(filteredCVs, (newCVs) => {
  if (newCVs?.length) {
    newCVs.forEach(cv => {
      if (!localStatusMap.value[cv.id]) {
        const statusMap = { 1: 'New', 2: 'Reviewed', 3: 'Shortlisted', 4: 'Rejected' }
        localStatusMap.value[cv.id] = statusMap[cv.application_status] || 'New'
      }
    })
  }
  ensureSelection()
}, { immediate: true })

const sendEmail = async (email) => {
  const subject = `Regarding your application`
  const message = `Hello,\n\nThank you for applying. We wanted to reach out regarding your application.\n\nBest regards,\nRasant Solutions`

  const result = await cvStore.sendCandidateEmail({ email, subject, message })

  if (result.success) {
    showToast(`Email sent to ${email}`, 'success')
  } else {
    showToast(result.error, 'error')
  }
}

const viewCV = (applicant) => {
  downloadCV(applicant)
}



</script>

<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <TopHeader userName="System Admin" role="admin" :notificationCount="3" />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-4 space-y-4">
        <div class="grid grid-cols-1 sm:We're hiring for the roles below. Apply directly or submit your CV — we'llgrid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
              label="Live on Site"
              :value="publishedCount"
              subtitle="Published jobs"
              :icon="['fas', 'globe']"
              color="orange"
          />

          <StatCard
              label="New CVs"
              :value="newCvsCount"
              subtitle="Awaiting review"
              :icon="['fas', 'inbox']"
              color="purple"
          />

          <StatCard
              label="Draft Posts"
              :value="draftCount"
              subtitle="Not yet public"
              :icon="['fas', 'pen-to-square']"
              color="blue"
          />

          <StatCard
              label="Total CVs"
              :value="totalCvsCount"
              subtitle=""
              :icon="['fas', 'clipboard-list']"
              color="teal"
              link="/careers"
              linkLabel="View careers page"
          />
        </div>

        <!-- Pill Tab Navigation -->
        <div class="w-full overflow-x-auto scrollbar-hide">
          <div class="inline-flex items-center gap-1 bg-white border border-border rounded-lg shadow-sm p-1">
            <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="activeTab = tab.key"
                class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold duration-200 cursor-pointer whitespace-nowrap"
                :class="activeTab === tab.key ? 'bg-linear-to-r from-[#2F6FC4] via-[#3F7FD2] to-[#4A88D8] text-white shadow-md'
            : 'text-gray-500 hover:bg-blue-50 hover:text-[#2F6FC4]'"
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
            <button
                @click="openJobModal"
                class="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 rounded-lg shadow-md shadow-orange-200/60 transition cursor-pointer"
            >
              <font-awesome-icon :icon="['fas', 'plus']" class="w-3.5 h-3.5" />
              Add new job
            </button>
          </div>

          <div v-if="loadingAdmin" class="text-center py-10 text-text-muted text-sm border-t border-border-subtle">Loading jobs...</div>

          <div v-else-if="adminJobs.length === 0" class="text-center py-16 border-t border-border-subtle">
            <div class="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-3">
              <font-awesome-icon :icon="['fas', 'globe']" class="text-text-muted text-lg" />
            </div>
            <p class="text-text-secondary font-medium">No job openings yet</p>
            <p class="text-sm text-text-muted mt-1">Create one using "Add new job".</p>
          </div>

          <div v-else class="overflow-x-auto">
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
              <tr
                  v-for="job in adminJobs"
                  :key="job.id"
                  class="border-t border-border-subtle hover:bg-surface/50 transition"
              >
                <td class="px-4 sm:px-5 py-4">
                  <p class="font-semibold text-text-primary">{{ job.job_title }}</p>

                </td>
                <td class="px-4 sm:px-5 py-4 text-text-secondary whitespace-nowrap">{{ job.job_type_name }}</td>
                <td class="px-4 sm:px-5 py-4 text-text-secondary whitespace-nowrap">{{ job.department }}</td>
                <td class="px-4 sm:px-5 py-4 text-text-secondary whitespace-nowrap">{{ formatDate(job.created_at) }}</td>
                <td class="px-4 sm:px-5 py-4">
                    <span class="..." :class="statusClasses(getJobStatusName(job))">
                      {{ getJobStatusName(job) }}
                    </span>
                </td>
                <td class="px-4 sm:px-5 py-4">
                  <div class="flex items-center gap-2">
                    <button
                        @click="handleEditJob(job)"
                        class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-border text-text-secondary hover:bg-surface transition cursor-pointer"
                        title="Edit"
                    >
                      <font-awesome-icon :icon="['fas', 'pen']" class="w-3 h-3" />
                    </button>
                    <button
                        @click="handleViewJob(job)"
                        class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-border text-text-secondary hover:bg-surface transition cursor-pointer"
                        title="View"
                    >
                      <font-awesome-icon :icon="['fas', 'eye']" class="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- CV Applications -->
        <div v-if="activeTab === 'cv-applications'" class="flex flex-col lg:flex-row gap-4 items-start">
          <!-- Left: Applicant list -->
          <div class="w-full lg:w-72 lg:shrink-0 bg-gradient-to-b from-accent-subtle to-white border border-border rounded-xl shadow-sm p-4">
            <div class="flex items-center justify-between mb-3">
              <p class="text-[11px] font-semibold text-text-muted tracking-wide uppercase">CV Submissions</p>
              <button
                  @click="fetchCVSubmissions().then(ensureSelection)"
                  :disabled="cvLoading"
                  class="text-text-muted hover:text-text-secondary disabled:opacity-50 cursor-pointer"
                  title="Refresh"
              >
                <font-awesome-icon
                    :icon="cvLoading ? ['fas', 'spinner'] : ['fas', 'arrow-rotate-right']"
                    :class="{ 'animate-spin': cvLoading }"
                    class="w-3.5 h-3.5"
                />
              </button>
            </div>

            <div class="relative mb-3">
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                  v-model="cvSearchQuery"
                  type="text"
                  placeholder="Search applicants..."
                  class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <!-- Loading skeleton -->
            <div v-if="cvLoading" class="space-y-2">
              <div v-for="i in 3" :key="i" class="p-3 rounded-lg bg-white border border-transparent animate-pulse flex gap-2.5">
                <div class="w-9 h-9 rounded-full bg-border shrink-0"></div>
                <div class="flex-1 space-y-1.5">
                  <div class="h-2.5 bg-border rounded w-3/4"></div>
                  <div class="h-2.5 bg-border rounded w-1/2"></div>
                </div>
              </div>
            </div>

            <!-- Empty -->
            <div v-else-if="filteredCVs.length === 0" class="text-center py-10 text-text-muted text-xs">
              {{ cvSearchQuery ? 'No applicants match your search.' : 'No CV submissions yet.' }}
            </div>

            <!-- Scrollable list -->
            <div v-else class="space-y-2 max-h-72 lg:max-h-[32rem] overflow-y-auto pr-1">
              <button
                  v-for="applicant in filteredCVs"
                  :key="applicant.id"
                  @click="selectedApplicantId = applicant.id"
                  class="w-full text-left p-3 rounded-lg border transition cursor-pointer"
                  :class="selectedApplicant?.id === applicant.id
                    ? 'bg-gradient-to-r from-accent-subtle to-white border-accent-subtle-border shadow-sm'
                    : 'bg-white border-transparent hover:bg-surface'"
              >
                <div class="flex items-start gap-2.5">
                  <div
                      class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      :class="[avatarStyle(applicant.id).bg, avatarStyle(applicant.id).text]"
                  >
                    {{ initials(applicant.full_name) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <p class="font-semibold text-text-primary text-sm truncate">{{ applicant.full_name }}</p>
                      <span class="text-[11px] text-text-muted shrink-0">{{ formatDate(applicant.submitted_at) }}</span>
                    </div>
                    <p class="text-xs font-semibold text-accent truncate">{{ applicant.desired_position }}</p>
                    <p class="text-xs text-text-muted truncate">{{ applicant.email }}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Right: Applicant detail -->
          <div v-if="selectedApplicant" class="w-full flex-1 bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <!-- Header -->
            <div class="relative bg-gradient-to-r from-accent-subtle via-white to-primary-subtle p-4 sm:p-6">
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div class="min-w-0">
                  <h2 class="text-lg sm:text-xl font-bold text-text-primary truncate">{{ selectedApplicant.full_name }}</h2>
                  <p class="text-sm font-medium text-text-secondary mt-0.5 truncate">{{ selectedApplicant.email }}</p>
                </div>
                <span class="text-[11px] font-semibold px-3 py-1 rounded-full bg-primary-subtle text-primary shrink-0">
                  {{ applicantStatus }}
                </span>
              </div>

              <!-- Info cards -->
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-5">
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

                <button
                    @click="viewCV(selectedApplicant)"
                    class="bg-white border border-primary/30 hover:bg-primary-subtle rounded-lg p-3 text-left transition cursor-pointer group"
                >
                  <p class="text-[10px] font-semibold text-text-muted tracking-wide uppercase">CV</p>
                  <p class="text-sm font-semibold text-primary mt-1 truncate flex items-center gap-1.5">
                    <font-awesome-icon :icon="['fas', 'file-lines']" class="text-[13px]"/>
                    View CV
                    <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']"
                                       class="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"/>
                  </p>
                </button>
              </div>
            </div>

            <!-- Cover letter -->
            <div class="px-4 sm:px-6 py-5 border-t border-border-subtle">
              <p class="text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-2">Cover Letter</p>
              <div class="bg-gradient-to-r from-primary-subtle/60 to-surface border border-border-subtle rounded-lg p-4">
                <p v-if="selectedApplicant.cover_letter" class="text-sm text-primary">{{ selectedApplicant.cover_letter }}</p>
                <p v-else class="text-sm text-text-muted italic">No cover letter provided.</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-5 border-t border-border-subtle">
              <button
                  @click="sendEmail(selectedApplicant.email)"
                  :disabled="cvStore.isSendingEmail"
                  class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed rounded-full transition shadow-sm cursor-pointer"
              >
                <font-awesome-icon
                    :icon="cvStore.isSendingEmail ? ['fas', 'spinner'] : ['fas', 'paper-plane']"
                    :spin="cvStore.isSendingEmail"
                    class="w-3.5 h-3.5"
                />
                {{ cvStore.isSendingEmail ? 'Sending...' : 'Email candidate' }}
              </button>

              <select
                  v-model="applicantStatus"
                  class="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-text-primary bg-white border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
              </select>

              <button
                  @click="removeApplicant(selectedApplicant.id)"
                  class="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-text-muted bg-surface border border-border-subtle rounded-full hover:bg-surface-alt hover:text-text-secondary transition cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <!-- ══════════ Post/Edit Job Modal ══════════ -->
        <BaseModal
            :is-open="showJobModal"
            mode="form"
            size="xl"
            :title="modalTitle"
            subtitle="Select job type and details — publish immediately or save as draft."
            :submit-text="isSubmitting ? 'Saving...' : 'Save job post'"
            :loading="isSubmitting"
            @close="closeJobModal"
            @cancel="closeJobModal"
            @save="handleCreateJob"
        >
          <form @submit.prevent="handleCreateJob">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 w-full">
              <!-- Job Title -->
              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Job Title</label>
                <input
                    v-model="formData.job_title"
                    type="text"
                    placeholder="e.g. Senior React Developer"
                    class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p v-if="formErrors.job_title" class="text-xs text-danger mt-1">{{ formErrors.job_title }}</p>
              </div>

              <!-- Job Type -->
              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Job Type</label>
                <div class="relative">
                  <select
                      v-model="formData.job_type"
                      class="w-full min-w-0 appearance-none px-3.5 py-2.5 pr-10 text-sm bg-white border border-border rounded-lg text-text-primary cursor-pointer transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option :value="null" disabled class="text-text-muted">Select type</option>
                    <option
                        v-for="type in jobTypes"
                        :key="type.id"
                        :value="type.id"
                        class="text-text-primary py-2"
                    >
                      {{ type.name }}
                    </option>
                  </select>

                  <font-awesome-icon
                      :icon="['fas', 'chevron-down']"
                      class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted w-3 h-3"
                  />
                </div>
                <p v-if="formErrors.job_type" class="text-xs text-danger mt-1">{{ formErrors.job_type }}</p>
              </div>

              <!-- Department -->
              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Department</label>
                <input
                    v-model="formData.department"
                    type="text"
                    placeholder="Engineering"
                    class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p v-if="formErrors.department" class="text-xs text-danger mt-1">{{ formErrors.department }}</p>
              </div>

              <!-- Location -->
              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Location</label>
                <input
                    v-model="formData.location"
                    type="text"
                    placeholder="Islamabad / Remote"
                    class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <p v-if="formErrors.location" class="text-xs text-danger mt-1">{{ formErrors.location }}</p>
              </div>

              <!-- Salary Range -->
              <div class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Salary Range</label>
                <input
                    v-model="formData.salary_range"
                    type="number"
                    placeholder="e.g. 220000"
                    class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <!-- Status -->
              <div v-if="formData.id" class="w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Status</label>
                <div class="relative">
                  <select
                      v-model="formData.status"
                      class="w-full min-w-0 appearance-none px-3.5 py-2.5 pr-10 text-sm bg-white border border-border rounded-lg text-text-primary cursor-pointer transition-colors hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option v-for="s in jobStatus" :key="s.id" :value="s.id">
                      {{ s.name }}
                    </option>
                  </select>
                  <font-awesome-icon
                      :icon="['fas', 'chevron-down']"
                      class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted w-3 h-3"
                  />
                </div>
              </div>

              <!-- Description -->
              <div class="md:col-span-2 w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Description</label>
                <textarea
                    v-model="formData.description"
                    rows="4"
                    placeholder="Role overview, responsibilities..."
                    class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                ></textarea>
                <p v-if="formErrors.description" class="text-xs text-danger mt-1">{{ formErrors.description }}</p>
              </div>

              <!-- Requirements -->
              <div class="md:col-span-2 w-full min-w-0">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Requirements</label>
                <textarea
                    v-model="formData.requirements"
                    rows="4"
                    placeholder="Skills, experience, education..."
                    class="w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border border-border rounded-lg placeholder:text-text-muted resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                ></textarea>
                <p v-if="formErrors.requirements" class="text-xs text-danger mt-1">{{ formErrors.requirements }}</p>
              </div>
            </div>

            <!-- Checkbox -->
            <label v-if="!formData.id" class="flex items-center gap-2 mt-5 cursor-pointer select-none">
              <input
                  type="checkbox"
                  :checked="isClosed"
                  @change="toggleStatus($event.target.checked)"
                  class="w-4 h-4 rounded accent-primary"
              />
              <span class="text-sm font-semibold text-text-primary">Publish immediately on careers page</span>
            </label>
          </form>
        </BaseModal>

        <!-- ══════════ View Job Detail Modal ══════════ -->
        <BaseDetailModal
            :is-open="showViewModal"
            mode="view"
            :title="'Job Details'"
            :subtitle="viewingJob ? '' : ''"
            @close="closeViewModal"
        >
          <div v-if="viewingJob" class="space-y-5">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <p class="font-display text-lg font-bold text-headingCard">{{viewingJob.job_title}}</p>
            </div>

            <!-- Info grid -->
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

            <!-- Description -->
            <div>
              <p class="text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-2">Description</p>
              <div class="bg-surface border border-border-subtle rounded-lg p-4 text-sm text-text-secondary whitespace-pre-line">
                {{ viewingJob.description || 'No description provided.' }}
              </div>
            </div>

            <!-- Requirements -->
            <div>
              <p class="text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-2">Requirements</p>
              <div class="bg-surface border border-border-subtle rounded-lg p-4 text-sm text-text-secondary whitespace-pre-line">
                {{ viewingJob.requirements || 'No requirements provided.' }}
              </div>
            </div>
          </div>
        </BaseDetailModal>

        <!-- Delete confirmation -->
        <div
            v-if="showDeleteConfirm"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto"
        >
          <div
              @click="cancelDelete"
              class="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
          ></div>

          <div class="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border z-10 transform transition-all">
            <h3 class="text-lg font-bold text-text-primary mb-2">Delete CV Submission</h3>
            <p class="text-sm text-text-muted mb-6">
              Are you sure you want to delete this CV submission? This action cannot be undone.
            </p>

            <div class="flex items-center justify-end gap-3">
              <button
                  @click="cancelDelete"
                  class="px-4 py-2 text-sm font-semibold text-text-secondary bg-surface hover:bg-surface-alt rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                  @click="confirmDelete"
                  class="px-4 py-2 text-sm font-semibold text-white bg-danger hover:bg-danger-hover rounded-xl transition-colors shadow-sm shadow-danger/20 cursor-pointer"
              >
                Yes, Delete
              </button>
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