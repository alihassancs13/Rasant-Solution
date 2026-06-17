<template>
  <div class="min-h-screen bg-white font-['Inter'] text-[#1E293B] antialiased selection:bg-[#4A90E2]/20">
    <Navbar />

    <section class="relative overflow-hidden py-20 lg:py-24 bg-gradient-to-r from-[#FFF5EE] via-[#FFF1F2] to-[#F3F4F6]">
  <!-- Smooth background mesh gradient blending peach, pink, and light purple tones -->
  <div class="absolute inset-0 opacity-60 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(255,237,213,0.5),transparent_45%),radial-gradient(circle_at_top_right,rgba(243,232,255,0.6),transparent_50%)]" aria-hidden="true"></div>
  
  <div class="relative max-w-4xl mx-auto px-6 text-center z-10">
    <!-- Careers Badge -->
    <span class="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-400/10 text-orange-700 border border-slate-300/30 mb-5">
      <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
      Careers
    </span>

    <!-- Main Headline (Brought up slightly to 3xl / 4xl) -->
    <h1 class="font-['Space_Grotesk'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F2942] tracking-tight leading-[1.2] mb-5">
      Build the future<br />
      <em class="not-italic text-[#C2410C]">with us</em>
    </h1>

    <!-- Subtitle Text (Brought up to a clean text-sm / text-base balance) -->
    <p class="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed font-normal">
      Join Rasant Solutions — innovation, growth, and meaningful work across AI products and custom software.
    </p>
  </div>
</section>
    <main class="max-w-5xl mx-auto px-6 pb-24">
      
      <div v-if="hasOpenings" id="careersJobsSection" class="space-y-12">
        <div class="text-left border-b border-slate-100 pb-6">
          <h2 class="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">Open positions</h2>
          <p class="text-slate-500 text-sm sm:text-base">Explore roles at Rasant Solutions and apply directly below.</p>
        </div>

        <div class="space-y-6" id="careersJobsGrid">
          <div class="group relative bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/50">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div class="space-y-3 max-w-2xl">
                <h3 class="font-['Space_Grotesk'] text-xl font-bold text-[#0F172A] tracking-tight group-hover:text-[#2A5F9E] transition-colors">
                  Senior React Developer
                </h3>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                  <span class="px-2.5 py-0.5 rounded-md bg-[#F26522]/15 text-[#E05314] text-[11px] font-bold uppercase tracking-wider">Full-time</span>
                  <span>Engineering</span>
                  <span>Islamabad</span>
                  <span class="text-slate-400">|</span>
                  <span class="font-semibold text-slate-700">PKR 180,000 – 250,000 / month</span>
                </div>
                <p class="text-sm text-slate-600 leading-relaxed pt-1">
                  Lead front-end delivery for Sentra AI and Orchestri — build polished React dashboards, design systems, and real-time interfaces used by enterprise clients.
                </p>
              </div>
              <div class="flex-shrink-0">
                <button @click="openModal('Senior React Developer')" class="w-full sm:w-auto px-6 py-2.5 bg-[#4A90E2] hover:bg-[#357ABD] text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-[#4A90E2]/20 active:scale-[0.98]">
                  Apply now
                </button>
              </div>
            </div>
          </div>

          <div class="group relative bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/50">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div class="space-y-3 max-w-2xl">
                <h3 class="font-['Space_Grotesk'] text-xl font-bold text-[#0F172A] tracking-tight group-hover:text-[#2A5F9E] transition-colors">
                  AI / ML Engineer
                </h3>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                  <span class="px-2.5 py-0.5 rounded-md bg-[#F26522]/15 text-[#E05314] text-[11px] font-bold uppercase tracking-wider">Remote</span>
                  <span>Product</span>
                  <span>Remote</span>
                  <span class="text-slate-400">|</span>
                  <span class="font-semibold text-slate-700">PKR 200,000 – 320,000 / month</span>
                </div>
                <p class="text-sm text-slate-600 leading-relaxed pt-1">
                  Design and ship voice and chat AI pipelines — LLM integrations, prompt tooling, and evaluation for Rasant's AI Agent and Chatbot products.
                </p>
              </div>
              <div class="flex-shrink-0">
                <button @click="openModal('AI / ML Engineer')" class="w-full sm:w-auto px-6 py-2.5 bg-[#4A90E2] hover:bg-[#357ABD] text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-[#4A90E2]/20 active:scale-[0.98]">
                  Apply now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-r from-slate-50 to-slate-100/70 border border-slate-200/60 rounded-2xl p-8 text-center max-w-3xl mx-auto mt-12 space-y-4">
          <p class="text-slate-600 text-sm sm:text-base font-medium">
            Don't see the right fit? Submit your CV and we'll keep you in mind for future roles.
          </p>
          <button 
            type="button" 
            @click="openModal('')" 
            class="inline-flex items-center justify-center px-8 py-3 rounded-xl text-white font-semibold text-sm transition-all bg-gradient-to-br from-[#2A5F9E] to-[#4A90E2] shadow-lg shadow-[#2A5F9E]/35 hover:brightness-110 active:scale-[0.98]"
          >
            Submit Your CV
          </button>
        </div>
      </div>

      <div v-else id="careersEmpty" class="max-w-2xl mx-auto text-center border border-slate-100 rounded-3xl p-8 sm:p-12 bg-slate-50/50 shadow-sm">
        <div class="text-4xl mb-4 select-none" aria-hidden="true">👥</div>
        <h2 class="font-['Space_Grotesk'] text-2xl font-bold text-[#0F172A] mb-2">No Current Openings</h2>
        <h3 class="text-base font-medium text-slate-500 mb-4">But Great Talent is Always Welcome!</h3>
        <p class="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
          While we don't have specific positions open right now, we're always looking for exceptional talent to join Rasant Solutions. If you're passionate about innovation and want to be part of a team that values creativity and growth, we'd love to consider your application for future opportunities.
        </p>
        <button 
          type="button" 
          @click="openModal('')" 
          class="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#F26522] to-[#E05314] hover:brightness-110 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-[#F26522]/20 active:scale-[0.98]"
        >
          <span aria-hidden="true">📄</span> Submit Your CV for Consideration
        </button>
        <p class="text-xs text-slate-400 mt-4">We'll review your profile and contact you when suitable positions become available.</p>
      </div>

    </main>

    <div 
      v-if="isModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm"
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="cvModalTitle"
    >
      <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        
        <div class="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div class="space-y-1">
            <span class="inline-block px-2.5 py-0.5 rounded bg-[#4A90E2]/10 text-[#2A5F9E] text-[10px] font-bold uppercase tracking-wider">Join our team</span>
            <h3 id="cvModalTitle" class="font-['Space_Grotesk'] text-xl font-bold text-[#0F172A]">Submit Your CV</h3>
            <p class="text-xs text-slate-500">Share your profile — we'll match you with the right role.</p>
          </div>
          <button 
            type="button" 
            @click="closeModal" 
            class="text-2xl text-slate-400 hover:text-slate-600 transition-colors leading-none p-1"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div v-if="submitSuccess" class="p-8 text-center my-auto space-y-3">
          <div class="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-2xl mx-auto border border-emerald-100 shadow-sm">✓</div>
          <h4 class="font-['Space_Grotesk'] text-lg font-bold text-[#0F172A]">Application received!</h4>
          <p class="text-sm text-slate-500 max-w-xs mx-auto">Thank you — our team will review your CV and reach out if there's a match.</p>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="flex flex-col overflow-y-auto">
          <div class="p-6 space-y-4 overflow-y-auto">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 flex items-center gap-0.5">Full Name <span class="text-red-500">*</span></label>
              <input type="text" v-model="formData.name" placeholder="Enter your full name" required autocomplete="name" class="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/10 placeholder:text-slate-400 transition-all" />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 flex items-center gap-0.5">Email Address <span class="text-red-500">*</span></label>
              <input type="email" v-model="formData.email" placeholder="Enter your email address" required autocomplete="email" class="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/10 placeholder:text-slate-400 transition-all" />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 flex items-center gap-0.5">Phone / Contact <span class="text-red-500">*</span></label>
              <input type="tel" v-model="formData.contact" placeholder="Enter your phone or WhatsApp number" required autocomplete="tel" class="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/10 placeholder:text-slate-400 transition-all" />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 flex items-center gap-0.5">Desired Position <span class="text-red-500">*</span></label>
              <input type="text" v-model="formData.position" placeholder="e.g., Frontend Developer, Project Manager" required class="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/10 placeholder:text-slate-400 transition-all" />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700 flex items-center gap-0.5">Upload CV (PDF, DOC, DOCX) <span class="text-red-500">*</span></label>
              <div 
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleFileDrop"
                :class="[isDragging ? 'border-[#4A90E2] bg-[#4A90E2]/5' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50']"
                class="relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group"
                @click="triggerFileSelect"
              >
                <div class="text-2xl mb-1 select-none" aria-hidden="true">📄</div>
                <p class="text-xs font-semibold text-slate-700">Drag &amp; drop your CV here</p>
                <p class="text-[11px] text-slate-400 my-1">or</p>
                <button type="button" class="px-3 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm text-[11px] font-medium text-slate-600 group-hover:border-slate-300 transition-all">Browse files</button>
                <span class="block text-[11px] font-medium text-slate-500 mt-2 truncate max-w-[200px] mx-auto">{{ fileName }}</span>
                
                <input 
                  type="file" 
                  ref="fileInput" 
                  @change="handleFileSelect" 
                  accept=".pdf,.doc,.docx" 
                  class="hidden" 
                />
              </div>
              <p class="text-[10px] text-slate-400">Maximum file size: 5MB</p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-700">Cover Letter <span class="text-slate-400 font-normal">(optional)</span></label>
              <textarea v-model="formData.coverLetter" placeholder="Tell us why you'd be a great fit for our team…" class="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/10 placeholder:text-slate-400 transition-all h-24 resize-none"></textarea>
            </div>
          </div>

          <div class="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-end">
            <button 
              type="submit" 
              class="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#4A90E2] hover:bg-[#357ABD] text-white font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-[0.99]"
            >
              <span>Submit application</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </form>

      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

// Import placeholders for layout pieces (adjust file locations depending on exact layout)
import Navbar from '../components/navbar.vue'
import Footer from '../components/footer.vue'

// State configurations
const hasOpenings = ref(true) // Toggle to false to see the structured 'No Openings' view
const isModalOpen = ref(false)
const submitSuccess = ref(false)
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

// Modal Open/Close Logic
const openModal = (defaultPosition = '') => {
  formData.position = defaultPosition
  isModalOpen.value = true
  submitSuccess.value = false
}

const closeModal = () => {
  isModalOpen.value = false
  resetForm()
}

// Custom Upload Input Handling Mechanics
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

// Form Handlers
const handleSubmit = () => {
  if (!formData.file) {
    alert('Please upload your CV before submitting.')
    return
  }
  // Data extraction logic for store integration ready here
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
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<style scoped>
/* Space Grotesk and Inter imported globally in index.html or layout config */
</style>