<script setup>
import { ref, computed } from 'vue'
import AdminSidebar from '../components/adminSidebar.vue'
import TopHeader from '../components/header.vue'
import StatCard from '../components/statCard.vue'

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

// CV Applications state
const applicants = ref([
  {
    id: 1,
    name: 'Ayesha Khan',
    initials: 'AK',
    avatarBg: 'bg-indigo-200',
    avatarText: 'text-indigo-700',
    position: 'Senior React Developer',
    email: 'ayesha.khan@email.com',
    date: '10 Jun 2025',
    contact: '—',
    cvFile: 'Ayesha_Khan_CV.pdf',
    submitted: '10 Jun 2025',
    source: 'careers.html',
    coverLetter: 'I have 6 years building React dashboards for fintech and would love to contribute to Sentra AI.',
    status: 'New'
  },
  {
    id: 2,
    name: 'Hassan Ali',
    initials: 'HA',
    avatarBg: 'bg-blue-200',
    avatarText: 'text-blue-700',
    position: 'AI / ML Engineer',
    email: 'hassan.ali@email.com',
    date: '8 Jun 2025',
    contact: '—',
    cvFile: 'Hassan_Ali_CV.pdf',
    submitted: '8 Jun 2025',
    source: 'careers.html',
    coverLetter: 'Excited about applying ML to real hiring pipelines — happy to share past project results.',
    status: 'Reviewed'
  }
])

const applicantSearch = ref('')
const selectedApplicantId = ref(applicants.value[0].id)

const filteredApplicants = computed(() => {
  const q = applicantSearch.value.trim().toLowerCase()
  if (!q) return applicants.value
  return applicants.value.filter(a =>
      a.name.toLowerCase().includes(q) || a.position.toLowerCase().includes(q)
  )
})

const selectedApplicant = computed(() =>
    applicants.value.find(a => a.id === selectedApplicantId.value) || applicants.value[0]
)

const statusOptions = ['New', 'Reviewed', 'Shortlisted', 'Rejected']

const removeApplicant = (id) => {
  const idx = applicants.value.findIndex(a => a.id === id)
  if (idx === -1) return
  applicants.value.splice(idx, 1)
  if (applicants.value.length) {
    selectedApplicantId.value = applicants.value[0].id
  }
}
</script>

<template>
  <div class="flex h-screen bg-slate-50">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Right side: header + page content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-4">
        <TopHeader userName="System Admin" role="admin" :notificationCount="3" />
      </div>

      <main class="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <!-- Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
              label="Live on Site"
              :value="2"
              subtitle="Published jobs"
              :icon="['fas', 'globe']"
              color="orange"
          />

          <StatCard
              label="New CVs"
              :value="1"
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
              :value="2"
              subtitle=""
              :icon="['fas', 'clipboard-list']"
              color="teal"
              link="/careers"
              linkLabel="View careers page"
          />
        </div>

        <!-- Pill Tab Navigation -->
        <div class="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-full shadow-sm p-1">
          <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              :class="activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'"
          >
            <font-awesome-icon :icon="tab.icon" class="w-3.5 h-3.5" />
            {{ tab.label }}
          </button>
        </div>

        <router-view />

        <!-- Jobs Table -->
        <div v-if="activeTab === 'site-openings'" class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead>
            <tr class="border-b border-slate-100">
              <th class="text-left font-semibold text-[11px] text-slate-400 tracking-wide uppercase px-5 py-4">Role</th>
              <th class="text-left font-semibold text-[11px] text-slate-400 tracking-wide uppercase px-5 py-4">Type</th>
              <th class="text-left font-semibold text-[11px] text-slate-400 tracking-wide uppercase px-5 py-4">Department</th>
              <th class="text-left font-semibold text-[11px] text-slate-400 tracking-wide uppercase px-5 py-4">Posted</th>
              <th class="text-left font-semibold text-[11px] text-slate-400 tracking-wide uppercase px-5 py-4">Status</th>
              <th class="text-left font-semibold text-[11px] text-slate-400 tracking-wide uppercase px-5 py-4">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="job in jobs"
                :key="job.id"
                class="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60 transition-colors"
            >
              <td class="px-5 py-4">
                <p class="font-semibold text-slate-900">{{ job.role }}</p>
                <p class="text-xs text-slate-400">{{ job.id }}</p>
              </td>
              <td class="px-5 py-4 text-slate-600">{{ job.type }}</td>
              <td class="px-5 py-4 text-slate-600">{{ job.department }}</td>
              <td class="px-5 py-4 text-slate-600">{{ job.posted }}</td>
              <td class="px-5 py-4">
                  <span
                      class="text-xs font-semibold px-3 py-1 rounded-full"
                      :class="statusClasses(job.status)"
                  >
                    {{ job.status }}
                  </span>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
                    <font-awesome-icon :icon="['fas', 'xmark']" class="w-3.5 h-3.5" />
                  </button>
                  <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 transition">
                    <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="w-3.5 h-3.5" />
                  </button>
                  <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition">
                    <font-awesome-icon :icon="['fas', 'trash']" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Create Job Opening Form -->
        <div
            v-if="activeTab === 'post-job'"
            class="relative bg-gradient-to-b from-white to-orange-50/50 border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6"
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
            <div class="flex items-center gap-3 mt-5">
              <button
                  type="submit"
                  class="px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition shadow-sm"
              >
                Save job post
              </button>
              <button
                  type="button"
                  @click="clearJobForm"
                  class="px-5 py-2.5 text-sm font-semibold text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 rounded-lg transition"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <!-- CV Applications -->
        <div v-if="activeTab === 'cv-applications'" class="flex gap-4 items-start">
          <!-- Left: Applicant list -->
          <div class="w-72 shrink-0 bg-gradient-to-b from-orange-50/60 to-white border border-slate-200 rounded-xl shadow-sm p-4">
            <p class="text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-3">CV Submissions</p>

            <div class="relative mb-3">
              <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                  v-model="applicantSearch"
                  type="text"
                  placeholder="Search applicants..."
                  class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div class="space-y-2">
              <button
                  v-for="applicant in filteredApplicants"
                  :key="applicant.id"
                  @click="selectedApplicantId = applicant.id"
                  class="w-full text-left p-3 rounded-lg border transition"
                  :class="selectedApplicantId === applicant.id
                    ? 'bg-gradient-to-r from-orange-50 to-white border-orange-100 shadow-sm'
                    : 'bg-white border-transparent hover:bg-slate-50'"
              >
                <div class="flex items-start gap-2.5">
                  <div
                      class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      :class="[applicant.avatarBg, applicant.avatarText]"
                  >
                    {{ applicant.initials }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <p class="font-semibold text-slate-900 text-sm truncate">{{ applicant.name }}</p>
                      <span class="text-[11px] text-slate-400 shrink-0">{{ applicant.date }}</span>
                    </div>
                    <p class="text-xs font-semibold text-orange-600 truncate">{{ applicant.position }}</p>
                    <p class="text-xs text-slate-400 truncate">{{ applicant.email }}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Right: Applicant detail -->
          <div v-if="selectedApplicant" class="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <!-- Header -->
            <div class="relative bg-gradient-to-r from-orange-50/70 via-white to-blue-50/70 p-6">
              <span class="absolute top-5 right-6 text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-600">
                {{ selectedApplicant.status }}
              </span>
              <h2 class="text-xl font-bold text-slate-900">{{ selectedApplicant.name }}</h2>
              <p class="text-sm font-medium text-amber-600 mt-0.5">{{ selectedApplicant.email }}</p>

              <!-- Info cards -->
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
                <div class="bg-white border border-slate-200 rounded-lg p-3">
                  <p class="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">Position</p>
                  <p class="text-sm font-semibold text-slate-900 mt-1 truncate">{{ selectedApplicant.position }}</p>
                </div>
                <div class="bg-white border border-slate-200 rounded-lg p-3">
                  <p class="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">Contact</p>
                  <p class="text-sm font-semibold text-slate-900 mt-1 truncate">{{ selectedApplicant.contact }}</p>
                </div>
                <div class="bg-white border border-slate-200 rounded-lg p-3">
                  <p class="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">CV File</p>
                  <p class="text-sm font-semibold text-slate-900 mt-1 truncate">{{ selectedApplicant.cvFile }}</p>
                </div>
                <div class="bg-white border border-slate-200 rounded-lg p-3">
                  <p class="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">Submitted</p>
                  <p class="text-sm font-semibold text-slate-900 mt-1 truncate">{{ selectedApplicant.submitted }}</p>
                </div>
                <div class="bg-white border border-slate-200 rounded-lg p-3">
                  <p class="text-[10px] font-semibold text-slate-400 tracking-wide uppercase">Source</p>
                  <p class="text-sm font-semibold text-slate-900 mt-1 truncate">{{ selectedApplicant.source }}</p>
                </div>
              </div>
            </div>

            <!-- Cover letter -->
            <div class="px-6 py-5 border-t border-slate-100">
              <p class="text-[11px] font-semibold text-slate-500 tracking-wide uppercase mb-2">Cover Letter</p>
              <div class="bg-gradient-to-r from-blue-50/60 to-slate-50 border border-slate-100 rounded-lg p-4">
                <p class="text-sm text-blue-700">{{ selectedApplicant.coverLetter }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3 px-6 py-5 border-t border-slate-100">
              <button class="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-full transition shadow-sm">
                <font-awesome-icon :icon="['fas', 'paper-plane']" class="w-3.5 h-3.5" />
                Email candidate
              </button>

              <select
                  v-model="selectedApplicant.status"
                  class="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
              </select>

              <button
                  @click="removeApplicant(selectedApplicant.id)"
                  class="px-5 py-2.5 text-sm font-semibold text-slate-400 bg-slate-50 border border-slate-100 rounded-full hover:bg-slate-100 hover:text-slate-600 transition"
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