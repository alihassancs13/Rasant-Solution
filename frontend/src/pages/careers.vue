<template>
  <div class="min-h-screen bg-[#F8FAFC] font-['Inter'] text-[#1E3A5F] antialiased selection:bg-[#4A90E2]/20">
    <Navbar />

    <!-- Hero Section -->
    <section class="relative overflow-hidden px-6 py-20 text-center bg-pink-50 mt-5">
      <div class="absolute inset-0 opacity-70 mix-blend-multiply pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.09),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_top_left,rgba(219,39,119,0.06),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(241,245,249,1),transparent_60%)]" aria-hidden="true"></div>

      <div class="relative z-10 max-w-3xl mx-auto">
    <span class="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-400/10 text-orange-700 border border-slate-300/30 mb-5">
      <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
      Careers
    </span>

        <h1 class="font-['Space_Grotesk',sans-serif] text-4xl sm:text-5xl font-extrabold text-[#1e3a5f] leading-tight">
          Build the future<br />
          <em class="not-italic text-orange-700">with us</em>
        </h1>

        <p class="mt-4 text-slate-500 text-base sm:text-lg font-['Inter']">
          Join Rasant Solutions — innovation, growth, and meaningful work <br> across AI products and custom software.
        </p>
      </div>
    </section>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto px-6 pb-24">

      <!-- Jobs Section -->
      <div id="careersJobsSection" class="space-y-12 mt-8">
        <div class="text-left border-b border-[#E2E8F0] pb-6 transition-all duration-700 ease-out" :class="cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'">
          <h2 class="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#1E3A5F] mb-2">Open positions</h2>
          <p class="text-[#64748B] text-sm sm:text-base">Explore roles at Rasant Solutions and apply directly below.</p>
        </div>

        <!-- No Jobs Message + CTA (merged card) -->
        <div
            class="relative rounded-[24px] py-12 px-8 sm:px-12 overflow-hidden w-full transition-all duration-700 delay-150 ease-out bg-orange-700 ]"
            :class="cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
        >
          <div class="absolute -top-24 -right-16 w-72 h-72 rounded-full pointer-events-none ]"></div>
          <div class="absolute -bottom-24 -left-10 w-64 h-64 rounded-full pointer-events-none ]"></div>
          <div class="absolute inset-0 opacity-50 pointer-events-none bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:24px_24px]"></div>

          <div class="relative z-10">
            <div class="flex items-center justify-between gap-7 flex-wrap">

              <div class="flex items-center gap-7 flex-wrap flex-1 min-w-[260px]">
                <div class="shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center border border-white/[0.18] bg-white/10">
                  <i class="fa-solid fa-briefcase text-[26px] text-white" aria-hidden="true"></i>
                </div>

                <div class="flex-1 text-left">
              <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10.5px] font-bold tracking-wide uppercase mb-3 bg-white text-orange-600 border border-teal-300/25">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                Currently fully staffed
              </span>
                  <h3 class="font-['Space_Grotesk'] text-[22px] sm:text-2xl font-bold text-white mb-2">No open roles at the moment</h3>
                  <p class="text-sm sm:text-[15px] leading-relaxed text-white/72 max-w-2xl">
                    Our team is operating at full strength right now — but talent demands change quickly.
                    Leave your CV with us below, and our recruitment team will reach out directly as soon as an opening aligns with your expertise.
                  </p>
                </div>
              </div>

              <div class="shrink-0 ml-auto lg:ml-0">
                <button
                    type="button"
                    @click="openModal('')"
                    class="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer bg-white text-orange-600 hover:bg-orange-100 shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
                >
                  Submit your CV
                  <span aria-hidden="true">&rarr;</span>
                </button>
              </div>

            </div>

            <div class="flex items-center gap-9 mt-8 pt-6 flex-wrap border-t border-white/[0.14]">
              <div>
                <div class="font-['Space_Grotesk'] text-xl font-bold text-white">48h</div>
                <div class="text-xs mt-0.5 text-white/55">avg. response</div>
              </div>
              <div class="w-px h-[30px] bg-white/[0.14]"></div>
              <div>
                <div class="font-['Space_Grotesk'] text-xl font-bold text-white">5</div>
                <div class="text-xs mt-0.5 text-white/55">teams hiring soon</div>
              </div>
              <div class="w-px h-[30px] bg-white/[0.14]"></div>
              <div>
                <div class="font-['Space_Grotesk'] text-xl font-bold text-white">100%</div>
                <div class="text-xs mt-0.5 text-white/55">friendly environment</div>
              </div>
              <div class="w-px h-[30px] bg-white/[0.14]"></div>
              <div>
                <div class="font-['Space_Grotesk'] text-xl font-bold text-white">10+</div>
                <div class="text-xs mt-0.5 text-white/55">Active Projects</div>
              </div>
              <div class="w-px h-[30px] bg-white/[0.14]"></div>
              <div>
                <div class="font-['Space_Grotesk'] text-xl font-bold text-white">Top 2%</div>
                <div class="text-xs mt-0.5 text-white/55">talent network</div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </main>

    <!-- Modal -->
    <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-[#0F172A]/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="cvModalTitle">
        <Transition
            appear
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
            <!-- Modal Header -->
            <div class="p-6 border-b border-[#E2E8F0] flex items-start justify-between" style="background: linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 55%, #fff 100%);">
              <div class="space-y-1">
                <span class="inline-block px-2.5 py-0.5 rounded bg-[#14B8A6]/10 text-[#0D9488] text-[10px] font-bold uppercase tracking-wider">Join our team</span>
                <h3 id="cvModalTitle" class="font-['Space_Grotesk'] text-xl font-bold text-[#1E3A5F]">Submit Your CV</h3>
                <p class="text-xs text-[#64748B]">Share your profile — we'll match you with the right role.</p>
              </div>
              <button type="button" @click="closeModal" class="text-2xl text-[#64748B] hover:text-[#1E3A5F] hover:rotate-90 transition-all duration-200 leading-none p-1 cursor-pointer" aria-label="Close">
                &times;
              </button>
            </div>

            <!-- Modal Content -->
            <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 scale-90"
                enter-to-class="opacity-100 scale-100"
                mode="out-in"
            >
              <div v-if="submitSuccess" class="p-8 text-center my-auto space-y-3">
                <div class="w-14 h-14 bg-gradient-to-br from-[#D1FAE5] to-[#A7F3D0] text-[#065F46] rounded-full flex items-center justify-center text-2xl mx-auto border border-[#A7F3D0] shadow-lg shadow-[#14B8A6]/25">
                  <i class="fa-solid fa-check" aria-hidden="true"></i>
                </div>
                <h4 class="font-['Space_Grotesk'] text-lg font-bold text-[#1E3A5F]">Application received!</h4>
                <p class="text-sm text-[#64748B] max-w-xs mx-auto">Thank you — our team will review your CV and reach out if there's a match.</p>
              </div>

              <form v-else @submit.prevent="handleSubmit" class="flex flex-col overflow-y-auto">
                <div class="p-6 space-y-4 overflow-y-auto">
                  <!-- Name -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-[#1E3A5F] flex items-center gap-0.5">Full Name <span class="text-[#DC2626]">*</span></label>
                    <input type="text" v-model="formData.name" placeholder="Enter your full name" required autocomplete="name" class="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#FAFBFC] focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/15 placeholder:text-[#94A3B8] transition-all duration-200 hover:border-[#4A90E2]/35 hover:bg-white focus:bg-white" />
                  </div>

                  <!-- Email -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-[#1E3A5F] flex items-center gap-0.5">Email Address <span class="text-[#DC2626]">*</span></label>
                    <input type="email" v-model="formData.email" placeholder="Enter your email address" required autocomplete="email" class="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#FAFBFC] focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/15 placeholder:text-[#94A3B8] transition-all duration-200 hover:border-[#4A90E2]/35 hover:bg-white focus:bg-white" />
                  </div>

                  <!-- Phone -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-[#1E3A5F] flex items-center gap-0.5">Phone / Contact <span class="text-[#DC2626]">*</span></label>
                    <input type="tel" v-model="formData.contact" placeholder="Enter your phone or WhatsApp number" required autocomplete="tel" class="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#FAFBFC] focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/15 placeholder:text-[#94A3B8] transition-all duration-200 hover:border-[#4A90E2]/35 hover:bg-white focus:bg-white" />
                  </div>

                  <!-- Desired Position -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-[#1E3A5F] flex items-center gap-0.5">Desired Position <span class="text-[#DC2626]">*</span></label>
                    <input type="text" v-model="formData.position" placeholder="e.g., Frontend Developer, Project Manager" required class="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#FAFBFC] focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/15 placeholder:text-[#94A3B8] transition-all duration-200 hover:border-[#4A90E2]/35 hover:bg-white focus:bg-white" />
                  </div>

                  <!-- File Upload -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-[#1E3A5F] flex items-center gap-0.5">Upload CV (PDF, DOC, DOCX) <span class="text-[#DC2626]">*</span></label>
                    <div @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleFileDrop" :class="[
                      isDragging ? 'border-[#4A90E2] bg-[#4A90E2]/5 scale-[1.02]' : 'border-[#4A90E2]/35 bg-[#F8FAFF] hover:bg-[#EFF6FF]',
                      fileUploaded ? 'border-[#4A90E2] border-solid bg-[#F0FDFA]' : 'border-2 border-dashed'
                    ]" class="relative rounded-xl p-6 text-center transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-[#4A90E2]/10" @click="triggerFileSelect">
                      <div class="text-2xl mb-1 select-none" aria-hidden="true">
                        <i class="fa-solid fa-folder-open" aria-hidden="true"></i>
                      </div>
                      <p class="text-xs font-semibold text-[#1E3A5F]">Drag &amp; drop your CV here</p>
                      <p class="text-[11px] text-[#64748B] my-1">or</p>
                      <button type="button" class="cursor-pointer px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-md shadow-sm text-[11px] font-medium text-[#475569] group-hover:border-[#4A90E2]/35 transition-all duration-200">Browse files</button>
                      <span class="block text-[11px] font-medium text-[#64748B] mt-2 truncate max-w-[200px] mx-auto" :class="fileUploaded ? 'text-[#0D9488] font-semibold' : ''">
                        {{ fileName }}
                      </span>
                      <input type="file" ref="fileInput" @change="handleFileSelect" accept=".pdf,.doc,.docx" class="hidden" />
                    </div>
                    <p class="text-[10px] text-[#64748B]">Maximum file size: 5MB</p>
                  </div>

                  <!-- Cover Letter -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-[#1E3A5F]">Cover Letter <span class="text-[#64748B] font-normal">(optional)</span></label>
                    <textarea v-model="formData.coverLetter" placeholder="Tell us why you'd be a great fit for our team..." class="w-full text-sm px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] bg-[#FAFBFC] focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/15 placeholder:text-[#94A3B8] transition-all duration-200 hover:border-[#4A90E2]/35 hover:bg-white focus:bg-white h-24 resize-none"></textarea>
                  </div>
                </div>

                <!-- Modal Footer -->
                <div class="p-4 border-t border-[#E2E8F0] flex items-center justify-end" style="background: linear-gradient(180deg, #fff 0%, #F8FAFC 100%);">
                  <button type="submit" class="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#4A90E2] hover:bg-[#3A7BC8] text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-[#4A90E2]/30 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group cursor-pointer">
                    <span class="relative z-10">Submit application</span>
                    <span aria-hidden="true" class="relative z-10 transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                    <div class="absolute inset-0 top-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-[shineLoop_0.98s_ease-in-out_infinite_alternate]"></div>
                  </button>
                </div>
              </form>
            </Transition>
          </div>
        </Transition>
      </div>
    </Transition>

    <Footer />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import Navbar from '@/components/navbar.vue'
import Footer from '@/components/footer.vue'

// State
const isModalOpen = ref(false)
const submitSuccess = ref(false)
const isDragging = ref(false)
const fileName = ref('No file chosen')
const fileUploaded = ref(false)
const fileInput = ref(null)

// Animation
const heroVisible = ref(false)
const cardsVisible = ref(false)

onMounted(() => {
  requestAnimationFrame(() => {
    heroVisible.value = true
    cardsVisible.value = true
  })
})

const formData = reactive({
  name: '',
  email: '',
  contact: '',
  position: '',
  coverLetter: '',
  file: null
})

// Modal
const openModal = (defaultPosition = '') => {
  formData.position = defaultPosition
  isModalOpen.value = true
  submitSuccess.value = false
}

const closeModal = () => {
  isModalOpen.value = false
  resetForm()
}

// File Upload
const triggerFileSelect = () => {
  fileInput.value?.click()
}

const processUploadedFile = (uploadedFile) => {
  if (uploadedFile) {
    if (uploadedFile.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.')
      return
    }
    formData.file = uploadedFile
    fileName.value = uploadedFile.name
    fileUploaded.value = true
  }
}

const handleFileSelect = (event) => {
  const selectedFile = event.target.files[0]
  processUploadedFile(selectedFile)
}

const handleFileDrop = (event) => {
  isDragging.value = false
  const droppedFile = event.dataTransfer.files[0]
  processUploadedFile(droppedFile)
}

// Form Submit
const handleSubmit = () => {
  if (!formData.file) {
    alert('Please upload your CV before submitting.')
    return
  }
  submitSuccess.value = true
}

const resetForm = () => {
  formData.name = ''
  formData.email = ''
  formData.contact = ''
  formData.position = ''
  formData.coverLetter = ''
  formData.file = null
  fileName.value = 'No file chosen'
  fileUploaded.value = false
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<style scoped>
/* Shine Loop effect */
@keyframes shineLoop {
  0% { transform: translateX(-200%); }
  100% { transform: translateX(400%); }
}
</style>