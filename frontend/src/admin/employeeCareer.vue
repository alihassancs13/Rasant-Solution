<script setup>
import { ref, computed } from 'vue'
import AdminSidebar from '../components/adminSidebar.vue'
import TopHeader from '../components/header.vue'
import StatCard from '../components/statCard.vue'
import { useEmployeeCareer } from '../composables/Admin/useEmployeeCareer.js'

const activeTab = ref('site-openings')

const tabs = [
  { key: 'site-openings', label: 'Site openings', icon: ['fas', 'globe'] },
  { key: 'post-job', label: 'Post new job', icon: ['fas', 'plus'] },
  { key: 'cv-applications', label: 'CV applications', icon: ['fas', 'desktop'] }
]

const jobs = ref([
  {
    id: 'JOB-001',
    role: 'Senior React Developer',
    type: 'Full-time',
    department: 'Engineering',
    posted: '28 May 2025',
    status: 'Published'
  },
  {
    id: 'JOB-002',
    role: 'AI / ML Engineer',
    type: 'Remote',
    department: 'Product',
    posted: '2 Jun 2025',
    status: 'Published'
  }
])

const statusClasses = (status) => {
  if (status === 'Published') return 'bg-emerald-100 text-emerald-700'
  if (status === 'Draft') return 'bg-slate-100 text-slate-600'
  return 'bg-amber-100 text-amber-700'
}

// New job form state
const newJob = ref({
  title: '',
  jobType: 'Full-time',
  department: '',
  location: '',
  salaryRange: '',
  description: '',
  requirements: '',
  publishImmediately: true
})

const jobTypeOptions = ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship']

const clearJobForm = () => {
  newJob.value = {
    title: '',
    jobType: 'Full-time',
    department: '',
    location: '',
    salaryRange: '',
    description: '',
    requirements: '',
    publishImmediately: true
  }
}

const saveJobPost = () => {
  jobs.value.unshift({
    id: `JOB-${String(jobs.value.length + 1).padStart(3, '0')}`,
    role: newJob.value.title || 'Untitled role',
    type: newJob.value.jobType,
    department: newJob.value.department || '—',
    posted: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: newJob.value.publishImmediately ? 'Published' : 'Draft'
  })
  clearJobForm()
  activeTab.value = 'site-openings'
}

// ─── CV Applications — real data from backend ───────────────────────
const {
  cvSubmissions, cvLoading, cvError, cvSearchQuery,
  fetchCVSubmissions, deleteCV, filteredCVs,
  formatDate, initials, viewCV,
} = useEmployeeCareer()

const selectedApplicantId = ref(null)

// Keep selection valid once real data arrives
const selectedApplicant = computed(() => {
  if (!filteredCVs.value.length) return null
  return filteredCVs.value.find(a => a.id === selectedApplicantId.value) || filteredCVs.value[0]
})

// Auto-select the first applicant whenever the list changes and nothing is selected
const ensureSelection = () => {
  if (filteredCVs.value.length && !filteredCVs.value.some(a => a.id === selectedApplicantId.value)) {
    selectedApplicantId.value = filteredCVs.value[0].id
  }
}

const statusOptions = ['New', 'Reviewed', 'Shortlisted', 'Rejected']

// Backend model doesn't track a review status yet — keep it locally per id
// so the dropdown still works without breaking anything.
const localStatusMap = ref({})
const applicantStatus = computed({
  get: () => localStatusMap.value[selectedApplicant.value?.id] || 'New',
  set: (val) => {
    if (selectedApplicant.value) {
      localStatusMap.value[selectedApplicant.value.id] = val
    }
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

const removeApplicant = async (id) => {
  await deleteCV(id)
  ensureSelection()
}

fetchCVSubmissions().then(ensureSelection)
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Right side: header + page content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-16 sm:p-4 md:pl-4">
        <TopHeader userName="System Admin" role="admin" :notificationCount="3" />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-4 space-y-4">        <!-- Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
              label="Live on Site"
              :value="2"
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
              :value="0"
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
          <div class="flex w-max items-center bg-white border border-slate-200 rounded-full shadow-sm p-1">

            <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="activeTab = tab.key"
                class="flex items-center gap-4 px-6 py-1.5 sm:px-0 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0"                :class="activeTab === tab.key
        ? 'bg-blue-600 text-white shadow-sm'
        : 'text-slate-500 hover:bg-slate-50'"
            >
              <font-awesome-icon :icon="tab.icon" class="w-3.5 h-3.5" />
              {{ tab.label }}
            </button>

          </div>
        </div>
        <router-view />

        <!-- Jobs Cards -->
        <div v-if="activeTab === 'site-openings'" class="space-y-3">
          <div
              v-for="job in jobs"
              :key="job.id"
              class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow"
          >
            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <!-- Left: Role info -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-semibold text-slate-900">{{ job.role }}</h3>
                  <span
                      class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0"
                      :class="statusClasses(job.status)"
                  >
                    {{ job.status }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5">{{ job.id }}</p>

                <!-- Meta row -->
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-slate-600">
                  <span class="flex items-center gap-1.5">
                    <font-awesome-icon :icon="['fas', 'briefcase']" class="w-3 h-3 text-slate-400" />
                    {{ job.type }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <font-awesome-icon :icon="['fas', 'building']" class="w-3 h-3 text-slate-400" />
                    {{ job.department }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <font-awesome-icon :icon="['fas', 'calendar']" class="w-3 h-3 text-slate-400" />
                    {{ job.posted }}
                  </span>
                </div>
              </div>

              <!-- Right: Actions -->
              <div class="flex items-center gap-2 shrink-0 sm:self-start">
                <button class="flex-1 sm:flex-none w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                  <font-awesome-icon :icon="['fas', 'xmark']" class="w-3.5 h-3.5" />
                </button>
                <button class="flex-1 sm:flex-none w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 transition">
                  <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="w-3.5 h-3.5" />
                </button>
                <button class="flex-1 sm:flex-none w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition">
                  <font-awesome-icon :icon="['fas', 'trash']" class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="jobs.length === 0" class="text-center py-16 bg-white border border-slate-200 rounded-xl">
            <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <font-awesome-icon :icon="['fas', 'globe']" class="text-slate-400 text-lg" />
            </div>
            <p class="text-slate-600 font-medium">No job openings yet</p>
            <p class="text-sm text-slate-400 mt-1">Create one from the "Post new job" tab.</p>
          </div>
        </div>

        <!-- Create Job Opening Form -->
        <div
            v-if="activeTab === 'post-job'"
            class="relative bg-gradient-to-b from-white to-orange-50/50 border border-slate-200 rounded-xl shadow-sm overflow-hidden p-4 sm:p-6"
        >
          <!-- Top accent gradient bar -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400"></div>

          <h2 class="text-lg font-bold text-slate-900">Create job opening</h2>
          <p class="text-sm text-slate-400 mt-0.5">Select job type and details — publish immediately or save as draft.</p>

          <form class="mt-6" @submit.prevent="saveJobPost">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <!-- Job Title -->
              <div>
                <label class="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Job Title</label>
                <input
                    v-model="newJob.title"
                    type="text"
                    placeholder="e.g. Senior React Developer"
                    class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>

              <!-- Job Type -->
              <div>
                <label class="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Job Type</label>
                <select
                    v-model="newJob.jobType"
                    class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                >
                  <option v-for="option in jobTypeOptions" :key="option" :value="option">{{ option }}</option>
                </select>
              </div>

              <!-- Department -->
              <div>
                <label class="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Department</label>
                <input
                    v-model="newJob.department"
                    type="text"
                    placeholder="Engineering"
                    class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>

              <!-- Location -->
              <div>
                <label class="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Location</label>
                <input
                    v-model="newJob.location"
                    type="text"
                    placeholder="Islamabad / Remote"
                    class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>

              <!-- Salary Range -->
              <div>
                <label class="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Salary Range</label>
                <input
                    v-model="newJob.salaryRange"
                    type="text"
                    placeholder="Rs. 150,000 - 220,000 / month"
                    class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label class="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Description</label>
                <textarea
                    v-model="newJob.description"
                    rows="4"
                    placeholder="Role overview, responsibilities..."
                    class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                ></textarea>
              </div>

              <!-- Requirements -->
              <div class="md:col-span-2">
                <label class="block text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Requirements</label>
                <textarea
                    v-model="newJob.requirements"
                    rows="4"
                    placeholder="Skills, experience, education..."
                    class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 resize-y focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                ></textarea>
              </div>
            </div>

            <!-- Publish checkbox -->
            <label class="flex items-center gap-2 mt-5 cursor-pointer select-none">
              <input
                  v-model="newJob.publishImmediately"
                  type="checkbox"
                  class="w-4 h-4 rounded accent-blue-600"
              />
              <span class="text-sm font-semibold text-slate-700">Publish immediately on careers page</span>
            </label>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5">
              <button
                  type="submit"
                  class="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition shadow-sm"
              >
                Save job post
              </button>
              <button
                  type="button"
                  @click="clearJobForm"
                  class="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <!-- CV Applications -->
        <div v-if="activeTab === 'cv-applications'" class="flex flex-col lg:flex-row gap-4 items-start">
          <!-- Left: Applicant list -->
          <div class="w-full lg:w-72 lg:shrink-0 bg-gradient-to-b from-orange-50/60 to-white border border-slate-200 rounded-xl shadow-sm p-4">
            <div class="flex items-center justify-between mb-3">
              <p class="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">CV Submissions</p>
              <button
                  @click="fetchCVSubmissions().then(ensureSelection)"
                  :disabled="cvLoading"
                  class="text-slate-400 hover:text-slate-600 disabled:opacity-50 cursor-pointer"
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
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                  v-model="cvSearchQuery"
                  type="text"
                  placeholder="Search applicants..."
                  class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <!-- Error -->
            <div v-if="cvError" class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs mb-3">
              <font-awesome-icon :icon="['fas', 'circle-exclamation']" />
              {{ cvError }}
            </div>

            <!-- Loading skeleton -->
            <div v-if="cvLoading" class="space-y-2">
              <div v-for="i in 3" :key="i" class="p-3 rounded-lg bg-white border border-transparent animate-pulse flex gap-2.5">
                <div class="w-9 h-9 rounded-full bg-slate-200 shrink-0"></div>
                <div class="flex-1 space-y-1.5">
                  <div class="h-2.5 bg-slate-200 rounded w-3/4"></div>
                  <div class="h-2.5 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>

            <!-- Empty -->
            <div v-else-if="filteredCVs.length === 0" class="text-center py-10 text-slate-400 text-xs">
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
                    ? 'bg-gradient-to-r from-orange-50 to-white border-orange-100 shadow-sm'
                    : 'bg-white border-transparent hover:bg-slate-50'"
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
                      <p class="font-semibold text-slate-900 text-sm truncate">{{ applicant.full_name }}</p>
                      <span class="text-[11px] text-slate-400 shrink-0">{{ formatDate(applicant.submitted_at) }}</span>
                    </div>
                    <p class="text-xs font-semibold text-orange-600 truncate">{{ applicant.desired_position }}</p>
                    <p class="text-xs text-slate-400 truncate">{{ applicant.email }}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Right: Applicant detail -->
          <div v-if="selectedApplicant" class="w-full flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <!-- Header -->
            <div class="relative bg-gradient-to-r from-orange-50/70 via-white to-blue-50/70 p-4 sm:p-6">
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div class="min-w-0">
                  <h2 class="text-lg sm:text-xl font-bold text-slate-900 truncate">{{ selectedApplicant.full_name }}</h2>
                  <p class="text-sm font-medium text-amber-600 mt-0.5 truncate">{{ selectedApplicant.email }}</p>
                </div>
                <span class="text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-600 shrink-0">
                  {{ applicantStatus }}
                </span>
              </div>

              <!-- Info cards -->
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-5">
                <div class="bg-white border border-slate-200 rounded-lg p-3">
                  <p class="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">Position</p>
                  <p class="text-sm font-semibold text-slate-900 mt-1 truncate">{{ selectedApplicant.desired_position }}</p>
                </div>
                <div class="bg-white border border-slate-200 rounded-lg p-3">
                  <p class="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">Contact</p>
                  <p class="text-sm font-semibold text-slate-900 mt-1 truncate">{{ selectedApplicant.phone || '—' }}</p>
                </div>
                <div class="bg-white border border-slate-200 rounded-lg p-3">
                  <p class="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">Submitted</p>
                  <p class="text-sm font-semibold text-slate-900 mt-1 truncate">{{ formatDate(selectedApplicant.submitted_at) }}</p>
                </div>

                <!-- ✅ CV File → now opens the actual uploaded CV -->
                <button
                    @click="viewCV(selectedApplicant)"
                    class="bg-white border border-blue-200 hover:bg-blue-50 rounded-lg p-3 text-left transition cursor-pointer group"
                >
                  <p class="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">CV</p>
                  <p class="text-sm font-semibold text-blue-600 mt-1 truncate flex items-center gap-1.5">
                    <font-awesome-icon :icon="['fas', 'file-lines']" class="text-[13px]"/>
                    View CV
                    <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']"
                                       class="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"/>
                  </p>
                </button>
              </div>
            </div>

            <!-- Cover letter -->
            <div class="px-4 sm:px-6 py-5 border-t border-slate-100">
              <p class="text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-2">Cover Letter</p>
              <div class="bg-gradient-to-r from-blue-50/60 to-slate-50 border border-slate-100 rounded-lg p-4">
                <p v-if="selectedApplicant.cover_letter" class="text-sm text-blue-700">{{ selectedApplicant.cover_letter }}</p>
                <p v-else class="text-sm text-slate-400 italic">No cover letter provided.</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-5 border-t border-slate-100">
              <button
                  @click="sendEmail(selectedApplicant.email)"
                  class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-full transition shadow-sm cursor-pointer"
              >
                <font-awesome-icon :icon="['fas', 'paper-plane']" class="w-3.5 h-3.5" />
                Email candidate
              </button>

              <select
                  v-model="applicantStatus"
                  class="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
              </select>

              <button
                  @click="removeApplicant(selectedApplicant.id)"
                  class="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded-full hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
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

<style>
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;     /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;             /* Chrome, Safari, Opera */
}
</style>