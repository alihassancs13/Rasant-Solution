<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AdminSidebar from '../../../components/adminSidebar.vue'
import TopHeader from '../../../components/header.vue'
import StatCard from '../../../components/statCard.vue'
import { useEmployeeCareer } from '../../../composables/useEmployeeCareer.js'
import { useJobs } from '../../../composables/useJobs.js'
import { useJobStore } from '../../../stores/jobStore.js'
import { useCvStore } from '../../../stores/cvStore.js'
import { useToast } from '../../../composables/useToast.js'
const { showToast } = useToast()

const jobStore = useJobStore()
const cvStore = useCvStore()

const activeTab = ref('site-openings')
const jobTypes = ref([])

const tabs = [
  { key: 'site-openings', label: 'Site openings', icon: ['fas', 'globe'] },
  { key: 'post-job', label: 'Post new job', icon: ['fas', 'plus'] },
  { key: 'cv-applications', label: 'CV applications', icon: ['fas', 'desktop'] }
]

const {
  formData, formErrors, isClosed, isSubmitting,
  toggleStatus, createJob, resetForm,
  adminJobs, loadingAdmin, fetchAdminJobs,
  updateJob,
} = useJobs()

const statusClasses = (statusName) => {
  if (statusName === 'Published') return 'bg-success-subtle text-success'
  if (statusName === 'Draft') return 'bg-surface-alt text-text-secondary'
  return 'bg-warning-subtle text-warning'
}

const publishedCount = computed(
    () => adminJobs.value.filter((j) => j.status_name === 'Published').length
)
const draftCount = computed(
    () => adminJobs.value.filter((j) => j.status_name === 'Draft').length
)

// ── Custom Job Type Dropdown ───────────────────────────────────
const isJobTypeOpen = ref(false)

const getJobTypeName = (id) => {
  if (!id) return 'Select type'
  const type = jobTypes.value.find(t => t.id === id)
  return type ? type.name : 'Select type'
}

const selectJobType = (id) => {
  formData.job_type = id
  isJobTypeOpen.value = false
}

const fetchJobTypes = async () => {
  try {
    await jobStore.fetchJobTypes()
    jobTypes.value = jobStore.jobTypes || []
  } catch (err) {
    console.error('Job types fetch error:', err)
    showToast('Failed to load job types.', 'error')
    jobTypes.value = []
  }
}

// createJob/updateJob composable (useJobs.js) already shows a toast internally.
// Here we only handle page-level side effects (tab switch, list refresh) — no duplicate toast.
const handleCreateJob = async () => {
  const created = await createJob()
  if (created) {
    await fetchAdminJobs()
    activeTab.value = 'site-openings'
  }
}

const handleCloseJob = async (job) => {
  const updated = await updateJob(job.id, { status: 3 })
  if (updated) {
    await fetchAdminJobs()
  }
}

onMounted(() => {
  fetchAdminJobs()
  fetchJobTypes()
})

// ─── CV Applications ───────────────────────────────────────────
// useEmployeeCareer() already calls fetchCVSubmissions() internally on mount,
// so we don't call it again here — avoids duplicate fetch + duplicate error banner/toast.
const {
  cvSubmissions, cvLoading, cvError, cvSearchQuery,
  fetchCVSubmissions, deleteCV, filteredCVs,
  formatDate, initials,
} = useEmployeeCareer()

const selectedApplicantId = ref(null)

// ─── Download CV (store handles blob + auto-download, single toast) ───
const downloadCV = async (applicant) => {
  const result = await cvStore.downloadCV(applicant.id, `CV_${applicant.full_name.replace(/\s/g, '_')}.pdf`)
  if (result.success) {
    showToast('CV downloaded successfully.', 'success')
  } else {
    showToast(result.error || 'Failed to download CV.', 'error')
  }
}

// ─── Update CV Status (store, single toast) ────────────────────
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

// ─── Delete CV (composable already toasts, no duplicate here) ─────
const removeApplicant = async (id) => {
  if (!confirm('Are you sure you want to delete this CV submission?')) return
  await deleteCV(id)
  await fetchCVSubmissions()
  ensureSelection()
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
  showToast(`Email sent to ${email}`, 'success')
}

const handleViewCV = (applicant) => {
  downloadCV(applicant)
}

// Close job-type dropdown when clicking outside
const closeDropdown = (event) => {
  if (isJobTypeOpen.value) {
    const dropdown = document.getElementById('job-type-dropdown')
    if (dropdown && !dropdown.contains(event.target)) {
      isJobTypeOpen.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})
</script>
<template>
  <div class="flex h-screen bg-surface">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Right side: header + page content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <TopHeader userName="System Admin" role="admin" :notificationCount="3" />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-4 space-y-4">
        <!-- Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
              label="Live on Site"
              :value="publishedCount"
              subtitle="Published jobs"
              :icon="['fas', 'globe']"
              color="orange"
          />

          <StatCard
              label="New CVs"
              :value="filteredCVs.length"
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
              :value="filteredCVs.length"
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

        <!-- Jobs Cards -->
        <div v-if="activeTab === 'site-openings'" class="space-y-3">
          <div v-if="loadingAdmin" class="text-center py-10 text-text-muted text-sm">Loading jobs...</div>

          <div
              v-for="job in adminJobs"
              :key="job.id"
              class="bg-white border border-border rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-semibold text-text-primary">{{ job.job_title }}</h3>
                  <span
                      class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0"
                      :class="statusClasses(job.status_name)"
                  >
                    {{ job.status_name }}
                  </span>
                </div>
                <p class="text-xs text-text-muted mt-0.5">JOB-{{ String(job.id).padStart(3, '0') }}</p>

                <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-text-secondary">
                  <span class="flex items-center gap-1.5">
                    <font-awesome-icon :icon="['fas', 'briefcase']" class="w-3 h-3 text-text-muted" />
                    {{ job.job_type_name }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <font-awesome-icon :icon="['fas', 'building']" class="w-3 h-3 text-text-muted" />
                    {{ job.department }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <font-awesome-icon :icon="['fas', 'calendar']" class="w-3 h-3 text-text-muted" />
                    {{ formatDate(job.created_at) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0 sm:self-start">
                <button
                    @click="handleCloseJob(job)"
                    class="flex-1 sm:flex-none w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-border text-text-secondary hover:bg-surface transition"
                    title="Mark as Closed"
                >
                  <font-awesome-icon :icon="['fas', 'xmark']" class="w-3.5 h-3.5" />
                </button>
                <button class="flex-1 sm:flex-none w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-secondary-subtle-border text-secondary hover:bg-secondary-subtle transition">
                  <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div v-if="!loadingAdmin && adminJobs.length === 0" class="text-center py-16 bg-white border border-border rounded-xl">
            <div class="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-3">
              <font-awesome-icon :icon="['fas', 'globe']" class="text-text-muted text-lg" />
            </div>
            <p class="text-text-secondary font-medium">No job openings yet</p>
            <p class="text-sm text-text-muted mt-1">Create one from the "Post new job" tab.</p>
          </div>
        </div>

        <!-- Create Job Opening Form -->
        <div
            v-if="activeTab === 'post-job'"
            class="relative bg-gradient-to-b from-white to-accent-subtle border border-border rounded-xl shadow-sm overflow-visible p-4 sm:p-6"
        >
          <!-- Top accent gradient bar -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-primary to-secondary"></div>

          <h2 class="text-lg font-bold text-text-primary">Create job opening</h2>
          <p class="text-sm text-text-muted mt-0.5">Select job type and details — publish immediately or save as draft.</p>

          <form class="mt-6 w-full max-w-full" @submit.prevent="handleCreateJob">
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

              <!-- Job Type - Custom Dropdown -->
              <div class="w-full min-w-0 relative" id="job-type-dropdown">
                <label class="block text-[11px] font-semibold text-text-muted tracking-wide uppercase mb-1.5">Job Type</label>
                <div class="relative">
                  <button
                      @click="isJobTypeOpen = !isJobTypeOpen"
                      type="button"
                      class="w-full min-w-0 max-w-full px-3.5 py-2.5 text-base sm:text-sm bg-white border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span class="truncate">{{ getJobTypeName(formData.job_type) }}</span>
                    <font-awesome-icon
                        :icon="['fas', 'chevron-down']"
                        class="text-text-muted w-3 h-3 flex-shrink-0 ml-2 transition-transform"
                        :class="{ 'rotate-180': isJobTypeOpen }"
                    />
                  </button>

                  <!-- Dropdown menu -->
                  <div
                      v-if="isJobTypeOpen"
                      class="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    <div
                        v-for="type in jobTypes"
                        :key="type.id"
                        @click="selectJobType(type.id)"
                        class="px-3.5 py-2.5 hover:bg-blue-50 cursor-pointer text-sm text-text-primary transition-colors border-b border-gray-50 last:border-0"
                    >
                      {{ type.name }}
                    </div>
                    <div v-if="!jobTypes.length" class="px-3.5 py-2.5 text-sm text-text-muted text-center">
                      No job types available
                    </div>
                  </div>
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
            <label class="flex items-center gap-2 mt-5 cursor-pointer select-none">
              <input
                  type="checkbox"
                  :checked="isClosed"
                  @change="toggleStatus($event.target.checked)"
                  class="w-4 h-4 rounded accent-primary"
              />
              <span class="text-sm font-semibold text-text-primary">Publish immediately on careers page</span>
            </label>

            <!-- Buttons -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5">
              <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover disabled:opacity-60 rounded-lg transition shadow-sm"
              >
                {{ isSubmitting ? 'Saving...' : 'Save job post' }}
              </button>
              <button
                  type="button"
                  @click="resetForm"
                  class="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-primary bg-white border border-primary hover:bg-primary-subtle rounded-lg transition"
              >
                Clear
              </button>
            </div>
          </form>
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
                  class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition shadow-sm cursor-pointer"
              >
                <font-awesome-icon :icon="['fas', 'paper-plane']" class="w-3.5 h-3.5" />
                Email candidate
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

/* Custom dropdown styles */
#job-type-dropdown {
  position: relative;
  z-index: 10;
}

#job-type-dropdown .absolute {
  position: absolute;
  z-index: 9999;
}

/* Ensure dropdown options are visible on mobile */
@media (max-width: 640px) {
  #job-type-dropdown .absolute {
    position: fixed;
    top: auto;
    left: 50%;
    transform: translateX(-50%);
    width: 90% !important;
    max-width: 400px;
    max-height: 50vh;
    margin-top: 4px;
  }
}
</style>