<template>
  <div class="min-h-screen bg-gradient-to-b from-neutral-100 via-primary-50/20 to-neutral-100 font-primary text-headingMain antialiased">
    <Navbar />

    <div class="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-10">

      <!-- Loading state -->
      <div v-if="loading" class="py-6 space-y-4">
        <AppSkeleton variant="detail" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-12">
        <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-4xl text-error" />
        <p class="mt-4 text-textSupporting">{{ error }}</p>
        <button @click="goBack" class="mt-4 text-primary-500 hover:text-primary-600 font-semibold">
          Go back to careers
        </button>
      </div>

      <!-- Job details -->
      <template v-else-if="job">
        <!-- Header (no container/box - plain layout, sits below navbar) -->
        <div class="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 class="font-display text-2xl md:text-3xl font-bold bg-gradient-to-r from-secondary-600 via-primary-600 to-accent-3 bg-clip-text text-transparent">
              {{ job.job_title }}
            </h1>
            <div class="flex flex-wrap items-center gap-3 mt-3">
              <span
                  v-if="job.job_type_name"
                  class="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-sm shadow-primary-500/20"
              >
                {{ job.job_type_name }}
              </span>
              <span class="text-sm text-textSupporting">•</span>
              <span class="text-sm text-textSupporting">{{ job.department }}</span>
              <span v-if="job.location" class="text-sm text-textSupporting">• {{ job.location }}</span>
            </div>
          </div>
          <div class="flex gap-2 shrink-0">
            <ShineButton
                size="md"
                @click="openApplyModal"
            >
              Apply now
            </ShineButton>
          </div>
        </div>

        <!-- Content -->
        <div class="space-y-6">
          <!-- Info grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-gradient-to-br from-primary-50/70 to-white border border-primary-100 rounded-lg p-4">
              <p class="text-[10px] font-semibold text-primary-600 tracking-wide uppercase">Job Type</p>
              <p class="text-sm font-semibold text-text-primary mt-1">{{ job.job_type_name || '—' }}</p>
            </div>
            <div class="bg-gradient-to-br from-secondary-50/70 to-white border border-secondary-100 rounded-lg p-4">
              <p class="text-[10px] font-semibold text-secondary-600 tracking-wide uppercase">Department</p>
              <p class="text-sm font-semibold text-text-primary mt-1">{{ job.department || '—' }}</p>
            </div>
            <div class="bg-gradient-to-br from-accent-1/10 to-white border border-accent-1/20 rounded-lg p-4">
              <p class="text-[10px] font-semibold text-accent-2 tracking-wide uppercase">Location</p>
              <p class="text-sm font-semibold text-text-primary mt-1">{{ job.location || '—' }}</p>
            </div>
            <div class="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-lg p-4">
              <p class="text-[10px] font-semibold text-amber-600 tracking-wide uppercase">Salary Range</p>
              <p class="text-sm font-semibold text-text-primary mt-1">{{ job.salary_range || '—' }}</p>
            </div>
            <div class="bg-gradient-to-br from-primary-50/50 via-secondary-50/40 to-white border border-border-subtle rounded-lg p-4 sm:col-span-2 lg:col-span-1">
              <p class="text-[10px] font-semibold text-text-muted tracking-wide uppercase">Posted</p>
              <p class="text-sm font-semibold text-text-primary mt-1">{{ formatDate(job.created_at) }}</p>
            </div>
          </div>

          <!-- Description -->
          <div>
            <h3 class="text-sm font-bold text-headingMain mb-3 flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'align-left']" class="text-primary-500 text-xs" />
              Job Description
            </h3>
            <div class="bg-gradient-to-br from-primary-50/40 via-white to-white border border-border-subtle rounded-lg p-5 text-sm text-text-secondary whitespace-pre-line leading-relaxed">
              {{ job.description || 'No description provided.' }}
            </div>
          </div>

          <!-- Requirements -->
          <div>
            <h3 class="text-sm font-bold text-headingMain mb-3 flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'list-check']" class="text-secondary-500 text-xs" />
              Requirements
            </h3>
            <div class="bg-gradient-to-br from-secondary-50/40 via-white to-white border border-border-subtle rounded-lg p-5 text-sm text-text-secondary whitespace-pre-line leading-relaxed">
              {{ job.requirements || 'No requirements provided.' }}
            </div>
          </div>

        </div>
      </template>
    </div>

    <!-- CV Submit Modal -->
    <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
      <div
          v-if="isModalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          @click.self="closeModal"
      >
        <Transition
            appear
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div class="relative w-full max-w-3xl bg-card rounded-2xl shadow-2xl border border-borderDefault overflow-hidden flex flex-col">
            <!-- Modal content - reuse from careers.vue or create separate component -->
            <div class="relative px-6 py-5 md:px-8 md:py-6 border-b border-borderDefault flex items-start justify-between gap-4 bg-gradient-to-br from-primary-50/90 via-white to-secondary-50/40 shrink-0">
              <div class="flex items-start gap-4 min-w-0">
                <div class="hidden sm:flex w-12 h-12 rounded-xl bg-white border border-primary-100 shadow-sm items-center justify-center shrink-0">
                  <img :src="careersStepSubmitSvg" alt="" class="w-8 h-8" aria-hidden="true" />
                </div>
                <div class="space-y-1 min-w-0">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-1/10 text-accent-2 text-[10px] font-bold uppercase tracking-wider border border-accent-1/15">
                    <span class="w-1.5 h-1.5 rounded-full bg-accent-2 animate-pulse"></span>
                    Apply for {{ job?.job_title || 'this position' }}
                  </span>
                  <h3 id="cvModalTitle" class="font-display text-xl md:text-2xl font-bold text-headingMain">Submit your CV</h3>
                  <p class="text-sm text-textBody">Tell us about yourself — we'll match you with the right opportunity.</p>
                </div>
              </div>
              <button
                  type="button"
                  @click="closeModal"
                  class="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-textBody hover:text-headingMain hover:bg-neutral-100 transition-all duration-200 cursor-pointer"
                  aria-label="Close modal"
              >
                <i class="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
              </button>
            </div>

            <!-- Form (reuse from careers.vue) -->
            <div class="px-6 py-6 md:px-8 md:py-7">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-headingMain flex items-center gap-1.5">
                    <i class="fa-solid fa-user text-primary-500/70 text-[10px]" aria-hidden="true"></i>
                    Full Name <span class="text-error">*</span>
                  </label>
                  <input
                      type="text"
                      v-model="formData.name"
                      placeholder="Your full name"
                      autocomplete="name"
                      class="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderDefault bg-neutral-50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 placeholder:text-textSupporting transition-all duration-200 hover:bg-white focus:bg-white"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-headingMain flex items-center gap-1.5">
                    <i class="fa-solid fa-envelope text-primary-500/70 text-[10px]" aria-hidden="true"></i>
                    Email Address <span class="text-error">*</span>
                  </label>
                  <input
                      type="email"
                      v-model="formData.email"
                      placeholder="name@example.com"
                      autocomplete="email"
                      class="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderDefault bg-neutral-50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 placeholder:text-textSupporting transition-all duration-200 hover:bg-white focus:bg-white"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-headingMain flex items-center gap-1.5">
                    <i class="fa-solid fa-phone text-primary-500/70 text-[10px]" aria-hidden="true"></i>
                    Phone / Contact <span class="text-error">*</span>
                  </label>
                  <input
                      type="tel"
                      v-model="formData.contact"
                      placeholder="Phone or WhatsApp"
                      autocomplete="tel"
                      class="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderDefault bg-neutral-50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 placeholder:text-textSupporting transition-all duration-200 hover:bg-white focus:bg-white"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-headingMain flex items-center gap-1.5">
                    <i class="fa-solid fa-briefcase text-primary-500/70 text-[10px]" aria-hidden="true"></i>
                    Desired Position <span class="text-error">*</span>
                  </label>
                  <input
                      type="text"
                      v-model="formData.position"
                      :placeholder="`e.g. ${job?.job_title || 'Vue Developer'}`"
                      class="w-full text-sm px-3.5 py-2.5 rounded-xl border border-borderDefault bg-neutral-50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 placeholder:text-textSupporting transition-all duration-200 hover:bg-white focus:bg-white"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div class="space-y-1.5">
                  <label class="text-xs font-semibold text-headingMain flex items-center gap-1.5">
                    <i class="fa-solid fa-file-arrow-up text-primary-500/70 text-[10px]" aria-hidden="true"></i>
                    Upload CV <span class="text-error">*</span>
                  </label>
                  <div
                      @dragover.prevent="isDragging = true"
                      @dragleave.prevent="isDragging = false"
                      @drop.prevent="handleFileDrop"
                      @click="triggerFileSelect"
                      class="relative flex items-center gap-4 rounded-xl border-2 border-dashed border-primary-500/30 px-4 py-4 transition-all duration-200 cursor-pointer group min-h-[104px] bg-primary-50/60 hover:bg-primary-50 hover:border-primary-500/50"
                  >
                    <div class="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-white text-primary-500 border border-primary-100 shadow-sm" aria-hidden="true">
                      <i class="fa-solid fa-cloud-arrow-up"></i>
                    </div>
                    <div class="flex-1 min-w-0 text-left">
                      <p class="text-sm font-semibold text-headingMain">Drag & drop or browse</p>
                      <p class="text-[11px] text-textBody mt-0.5">PDF, DOC, DOCX · Max 5MB</p>
                      <p class="text-[11px] font-medium mt-1 text-textSupporting">{{ fileName }}</p>
                    </div>
                    <input
                        type="file"
                        ref="fileInput"
                        @change="handleFileSelect"
                        accept=".pdf,.doc,.docx"
                        class="hidden"
                    />
                  </div>
                </div>

                <div class="space-y-1.5 flex flex-col">
                  <label class="text-xs font-semibold text-headingMain flex items-center gap-1.5">
                    <i class="fa-solid fa-pen text-primary-500/70 text-[10px]" aria-hidden="true"></i>
                    Cover Letter
                    <span class="text-textSupporting font-normal">(optional)</span>
                  </label>
                  <textarea
                      v-model="formData.coverLetter"
                      placeholder="Brief note on your experience and what you're looking for..."
                      class="flex-1 w-full min-h-[104px] text-sm px-3.5 py-3 rounded-xl border border-borderDefault bg-neutral-50 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 placeholder:text-textSupporting transition-all duration-200 hover:border-primary-500/35 hover:bg-white focus:bg-white resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="px-6 py-4 md:px-8 border-t border-borderDefault flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-neutral-50/80 via-white to-primary-50/30 shrink-0">
              <p class="text-[11px] text-textSupporting hidden sm:block">
                <i class="fa-solid fa-lock text-[10px] mr-1 opacity-60" aria-hidden="true"></i>
                Your information is kept confidential.
              </p>
              <button
                  type="submit"
                  @click="handleSubmit"
                  :disabled="isSubmitting"
                  class="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-buttonBackground hover:bg-buttonHover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-orange hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group cursor-pointer"
              >
                <span class="relative z-10">
                  {{ isSubmitting ? 'Submitting...' : 'Submit application' }}
                </span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '../../components/navbar.vue'
import AppSkeleton from '@/components/AppSkeleton.vue'
import ShineButton from '@/components/ShineButton.vue'
import { useJobStore } from '@/stores/jobStore.js'
import { useCvStore } from '@/stores/cvStore.js'
import { useToast } from '@/composables/useToast.js'
import careersStepSubmitSvg from '@/assets/svg/careers-step-submit.svg'

const route = useRoute()
const router = useRouter()
const jobStore = useJobStore()
const cvStore = useCvStore()
const { showToast } = useToast()

// State
const job = ref(null)
const loading = ref(true)
const error = ref(null)

// Modal state
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const isDragging = ref(false)
const fileName = ref('No file chosen')
const fileInput = ref(null)
const formData = reactive({
  name: '',
  email: '',
  contact: '',
  position: '',
  coverLetter: '',
  file: null
})

// Functions
const goBack = () => {
  router.push({ name: 'Careers' })
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const fetchJobDetails = async () => {
  try {
    loading.value = true
    error.value = null
    const jobId = route.params.id
    await jobStore.fetchPublicJobs()
    const foundJob = jobStore.publicJobs.find(j => j.id == jobId)
    if (foundJob) {
      job.value = foundJob
    } else {
      error.value = 'Job not found'
    }
  } catch (err) {
    error.value = 'Failed to load job details'
    console.error('Error fetching job:', err)
  } finally {
    loading.value = false
  }
}

const openApplyModal = () => {
  if (job.value) {
    formData.position = job.value.job_title
    isModalOpen.value = true
  }
}

const closeModal = () => {
  isModalOpen.value = false
  // Reset form
  formData.name = ''
  formData.email = ''
  formData.contact = ''
  formData.position = job.value?.job_title || ''
  formData.coverLetter = ''
  formData.file = null
  fileName.value = 'No file chosen'
}

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    formData.file = file
    fileName.value = file.name
  }
}

const handleFileDrop = (event) => {
  const file = event.dataTransfer.files?.[0]
  if (file) {
    formData.file = file
    fileName.value = file.name
  }
  isDragging.value = false
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    // Basic validation
    if (!formData.name || !formData.email || !formData.contact || !formData.position || !formData.file) {
      showToast('Please fill all required fields', 'error')
      return
    }

    const formDataObj = new FormData()
    formDataObj.append('full_name', formData.name)
    formDataObj.append('email', formData.email)
    formDataObj.append('phone', formData.contact)
    formDataObj.append('desired_position', formData.position)
    formDataObj.append('cover_letter', formData.coverLetter || '')
    formDataObj.append('cv_file', formData.file)

    const result = await cvStore.submitCV(formDataObj)

    if (result.success) {
      showToast('Application submitted successfully!', 'success')
      closeModal()
    } else {
      showToast(result.error || 'Failed to submit application', 'error')
    }
  } catch (error) {
    console.error('Submit error:', error)
    showToast('An error occurred while submitting your application', 'error')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchJobDetails()
})
</script>

<style scoped>
/* Add any custom styles here */
</style>