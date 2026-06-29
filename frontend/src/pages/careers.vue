<template>
  <div class="min-h-screen bg-neutral-100 font-primary text-headingMain antialiased selection:bg-primary-500/20">
    <Navbar />

    <!-- Hero Section -->
    <section class="relative overflow-hidden px-6 py-20 text-center bg-secondary-50 mt-5">
      <div
          class="absolute inset-0 pointer-events-none bg-[linear-gradient(120deg,#fdf1e7_0%,#f7e9ec_30%,#eee9f2_55%,#e7eaf5_80%)]"
          aria-hidden="true"
      ></div>
      <div class="relative z-10 max-w-3xl mx-auto">
        <span class="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-neutral-400/10 text-secondary-600 border border-borderDefault mb-5">
          <span class="w-1.5 h-1.5 rounded-full bg-accent-1 animate-pulse"></span>
          Careers
        </span>
        <h1 class="font-display text-4xl sm:text-5xl font-extrabold text-headingMain leading-tight">
          Build the future<br />
          <em class="not-italic text-secondary-600">with us</em>
        </h1>
        <p class="mt-4 text-textBody text-base sm:text-lg font-primary">
          Join Rasant Solutions — innovation, growth, and meaningful work <br />
          across AI products and custom software.
        </p>
      </div>
    </section>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto sm:px-6 pb-24">
      <div id="careersJobsSection" class="mt-6">
        <div
            class="relative rounded-[20px] overflow-hidden w-full transition-all duration-700 ease-out bg-card border border-borderDefault shadow-blue"
            :class="cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
        >
          <!-- Header row -->
          <div class="flex flex-wrap items-center justify-between gap-3 px-6 pt-5 pb-4 border-b border-borderDefault">
            <h2 class="font-display text-[22px] font-bold text-headingSection leading-tight">Open positions</h2>
            <span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-secondary-50 text-secondary-700 border border-secondary-200">
              <span class="w-1.5 h-1.5 rounded-full bg-secondary-500"></span>
              Currently fully staffed
            </span>
          </div>

          <!-- Split body -->
          <div class="grid grid-cols-1 lg:grid-cols-[1fr_260px]">

            <!-- Left -->
            <div class="px-6 py-6 flex flex-col sm:flex-row sm:items-start gap-4 lg:border-r lg:border-borderDefault">
              <div class="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border border-borderDefault bg-tagPinkBg shadow-sm">
                <i class="fa-solid fa-briefcase text-lg text-secondary-600" aria-hidden="true"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] text-textBody leading-relaxed font-primary">
                  Explore roles at <span class="font-semibold text-headingCard">Rasant Solutions</span> and apply directly below.
                </p>
                <h3 class="font-display text-base font-bold text-headingCard mt-2">No open roles at the moment</h3>
                <p class="text-[13px] text-textBody leading-relaxed mt-1 max-w-md font-primary">
                  Our team is operating at full strength right now, but great talent always finds room.
                  Send us your CV and our recruitment team will reach out personally the moment a role matches your skills.
                </p>
                <button
                    type="button"
                    @click="openModal('')"
                    class="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[13px] whitespace-nowrap transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer bg-buttonBackground text-white hover:bg-buttonHover shadow-orange"
                >
                  Submit your CV
                  <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <!-- Right: stats -->
            <div class="bg-neutral-100/60 border-t lg:border-t-0 border-borderDefault divide-y divide-borderDefault">
              <div class="flex items-center justify-between px-5 py-2.5">
                <span class="flex items-center gap-2 text-[12px] text-textSupporting font-primary uppercase tracking-wide">
                  <i class="fa-regular fa-clock text-accent-1" aria-hidden="true"></i>
                  avg. response
                </span>
                <span class="font-display text-sm font-bold text-headingSection">48h</span>
              </div>
              <div class="flex items-center justify-between px-5 py-2.5">
                <span class="flex items-center gap-2 text-[12px] text-textSupporting font-primary uppercase tracking-wide">
                  <i class="fa-solid fa-users text-accent-1" aria-hidden="true"></i>
                  teams hiring soon
                </span>
                <span class="font-display text-sm font-bold text-headingSection">5</span>
              </div>
              <div class="flex items-center justify-between px-5 py-2.5">
                <span class="flex items-center gap-2 text-[12px] text-textSupporting font-primary uppercase tracking-wide">
                  <i class="fa-regular fa-face-smile text-accent-1" aria-hidden="true"></i>
                  friendly env.
                </span>
                <span class="font-display text-sm font-bold text-headingSection">100%</span>
              </div>
              <div class="flex items-center justify-between px-5 py-2.5">
                <span class="flex items-center gap-2 text-[12px] text-textSupporting font-primary uppercase tracking-wide">
                  <i class="fa-solid fa-code text-accent-1" aria-hidden="true"></i>
                  active projects
                </span>
                <span class="font-display text-sm font-bold text-headingSection">10+</span>
              </div>
              <div class="flex items-center justify-between px-5 py-2.5">
                <span class="flex items-center gap-2 text-[12px] text-textSupporting font-primary uppercase tracking-wide">
                  <i class="fa-solid fa-medal text-accent-1" aria-hidden="true"></i>
                  talent network
                </span>
                <span class="font-display text-sm font-bold text-headingSection">Top 2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

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
          class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-neutral-950/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cvModalTitle"
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
          <div class="relative w-full max-w-lg bg-card rounded-xl shadow-2xl border border-borderDefault overflow-hidden flex flex-col max-h-[90vh]">

            <!-- Modal Header -->
            <div class="p-6 border-b border-borderDefault flex items-start justify-between bg-gradient-to-br from-primary-50 via-accent-1/10 to-card shrink-0">
              <div class="space-y-1">
                <span class="inline-block px-2.5 py-0.5 rounded bg-accent-1/10 text-accent-2 text-[10px] font-bold uppercase tracking-wider">
                  Join our team
                </span>
                <h3 id="cvModalTitle" class="font-display text-xl font-bold text-headingMain">Submit Your CV</h3>
                <p class="text-xs text-textBody">Share your profile — we'll match you with the right role.</p>
              </div>
              <button
                  type="button"
                  @click="closeModal"
                  class="text-2xl text-textBody hover:text-headingMain hover:rotate-90 transition-all duration-200 leading-none p-1 cursor-pointer"
                  aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <!-- Modal Body -->
            <Transition
                enter-active-class="transition-all duration-300 ease-out"
                enter-from-class="opacity-0 scale-90"
                enter-to-class="opacity-100 scale-100"
                mode="out-in"
            >
              <!-- Success state -->
              <div
                  v-if="submitSuccess"
                  key="success"
                  class="p-8 text-center my-auto space-y-3"
              >
                <div class="w-14 h-14 bg-accent-1/20 text-accent-2 rounded-full flex items-center justify-center text-2xl mx-auto border border-accent-1/30 shadow-lg shadow-accent-1/25">
                  <i class="fa-solid fa-check" aria-hidden="true"></i>
                </div>
                <h4 class="font-display text-lg font-bold text-headingMain">Application received!</h4>
                <p class="text-sm text-textBody max-w-xs mx-auto">
                  Thank you — our team will review your CV and reach out if there's a match.
                </p>
              </div>

              <!-- Form state -->
              <form
                  v-else
                  key="form"
                  @submit.prevent="handleSubmit"
                  novalidate
                  class="flex flex-col overflow-hidden"
              >
                <!-- Scrollable fields -->
                <div class="p-6 space-y-4 overflow-y-auto">

                  <!-- Full Name -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-headingMain flex items-center gap-0.5">
                      Full Name <span class="text-error">*</span>
                    </label>
                    <input
                        type="text"
                        v-model="formData.name"
                        placeholder="Enter your full name"
                        autocomplete="name"
                        :class="formErrors.name
                          ? 'border-error/60 focus:border-error focus:ring-error/10'
                          : 'border-borderDefault focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-500/35'"
                        class="w-full text-sm px-3.5 py-2.5 rounded-lg border bg-neutral-100 focus:outline-none focus:ring-2 placeholder:text-textSupporting transition-all duration-200 hover:bg-card focus:bg-card"
                    />
                    <p v-if="formErrors.name" class="text-[11px] text-error flex items-center gap-1">
                      <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                      {{ formErrors.name }}
                    </p>
                  </div>

                  <!-- Email -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-headingMain flex items-center gap-0.5">
                      Email Address <span class="text-error">*</span>
                    </label>
                    <input
                        type="email"
                        v-model="formData.email"
                        placeholder="Enter your email address"
                        autocomplete="email"
                        @input="onEmailInput"
                        @blur="onEmailInput"
                        :class="formErrors.email
                          ? 'border-error/60 focus:border-error focus:ring-error/10'
                          : 'border-borderDefault focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-500/35'"
                        class="w-full text-sm px-3.5 py-2.5 rounded-lg border bg-neutral-100 focus:outline-none focus:ring-2 placeholder:text-textSupporting transition-all duration-200 hover:bg-card focus:bg-card"
                    />
                    <p v-if="formErrors.email" class="text-[11px] text-error flex items-center gap-1">
                      <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                      {{ formErrors.email }}
                    </p>
                  </div>

                  <!-- Phone -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-headingMain flex items-center gap-0.5">
                      Phone / Contact <span class="text-error">*</span>
                    </label>
                    <input
                        type="tel"
                        v-model="formData.contact"
                        placeholder="Enter your phone or WhatsApp number"
                        autocomplete="tel"
                        :class="formErrors.contact
                          ? 'border-error/60 focus:border-error focus:ring-error/10'
                          : 'border-borderDefault focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-500/35'"
                        class="w-full text-sm px-3.5 py-2.5 rounded-lg border bg-neutral-100 focus:outline-none focus:ring-2 placeholder:text-textSupporting transition-all duration-200 hover:bg-card focus:bg-card"
                    />
                    <p v-if="formErrors.contact" class="text-[11px] text-error flex items-center gap-1">
                      <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                      {{ formErrors.contact }}
                    </p>
                  </div>

                  <!-- Desired Position -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-headingMain flex items-center gap-0.5">
                      Desired Position <span class="text-error">*</span>
                    </label>
                    <input
                        type="text"
                        v-model="formData.position"
                        placeholder="e.g., Frontend Developer, Project Manager"
                        :class="formErrors.position
                          ? 'border-error/60 focus:border-error focus:ring-error/10'
                          : 'border-borderDefault focus:border-primary-500 focus:ring-primary-500/15 hover:border-primary-500/35'"
                        class="w-full text-sm px-3.5 py-2.5 rounded-lg border bg-neutral-100 focus:outline-none focus:ring-2 placeholder:text-textSupporting transition-all duration-200 hover:bg-card focus:bg-card"
                    />
                    <p v-if="formErrors.position" class="text-[11px] text-error flex items-center gap-1">
                      <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                      {{ formErrors.position }}
                    </p>
                  </div>

                  <!-- File Upload -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-headingMain flex items-center gap-0.5">
                      Upload CV (PDF, DOC, DOCX) <span class="text-error">*</span>
                    </label>
                    <div
                        @dragover.prevent="isDragging = true"
                        @dragleave.prevent="isDragging = false"
                        @drop.prevent="handleFileDrop"
                        @click="triggerFileSelect"
                        :class="[
                          isDragging
                            ? 'border-primary-500 bg-primary-500/5 scale-[1.02]'
                            : fileUploaded
                              ? 'border-primary-500 border-solid bg-accent-1/5'
                              : formErrors.file
                                ? 'border-error/50 bg-error/5 border-2 border-dashed'
                                : 'border-primary-500/35 bg-primary-50 hover:bg-primary-100/50 border-2 border-dashed',
                        ]"
                        class="relative rounded-xl p-6 text-center transition-all duration-200 cursor-pointer group hover:shadow-lg hover:shadow-primary-500/10"
                    >
                      <div
                          class="text-2xl mb-1 select-none transition-colors duration-200"
                          :class="formErrors.file ? 'text-error' : 'text-primary-500'"
                          aria-hidden="true"
                      >
                        <i :class="formErrors.file ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-folder-open'"></i>
                      </div>
                      <p class="text-xs font-semibold text-headingMain">Drag &amp; drop your CV here</p>
                      <p class="text-[11px] text-textBody my-1">or</p>
                      <button
                          type="button"
                          class="cursor-pointer px-3 py-1.5 bg-card border border-borderDefault rounded-md shadow-sm text-[11px] font-medium text-textBody group-hover:border-primary-500/35 transition-all duration-200"
                      >
                        Browse files
                      </button>
                      <span
                          class="block text-[11px] font-medium mt-2 truncate max-w-[200px] mx-auto"
                          :class="fileUploaded ? 'text-accent-2 font-semibold' : 'text-textBody'"
                      >
                        {{ fileName }}
                      </span>
                      <input
                          type="file"
                          ref="fileInput"
                          @change="handleFileSelect"
                          accept=".pdf,.doc,.docx"
                          class="hidden"
                      />
                    </div>
                    <div class="flex items-center justify-between mt-0.5">
                      <p v-if="formErrors.file" class="text-[11px] text-error flex items-center gap-1">
                        <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                        {{ formErrors.file }}
                      </p>
                      <p v-else class="text-[10px] text-textBody">Maximum file size: 5MB</p>
                    </div>
                  </div>

                  <!-- Cover Letter -->
                  <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-headingMain">
                      Cover Letter
                      <span class="text-textSupporting font-normal">(optional)</span>
                    </label>
                    <textarea
                        v-model="formData.coverLetter"
                        placeholder="Tell us why you'd be a great fit for our team..."
                        class="w-full text-sm px-3.5 py-2.5 rounded-lg border border-borderDefault bg-neutral-100 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 placeholder:text-textSupporting transition-all duration-200 hover:border-primary-500/35 hover:bg-card focus:bg-card h-24 resize-none"
                    ></textarea>
                  </div>

                </div>

                <!-- Modal Footer -->
                <div class="p-4 border-t border-borderDefault flex flex-col gap-3 bg-gradient-to-b from-card to-neutral-100 shrink-0">

                  <Transition
                      enter-active-class="transition-all duration-200 ease-out"
                      enter-from-class="opacity-0 -translate-y-1"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-active-class="transition-all duration-150 ease-in"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div
                        v-if="submitError"
                        class="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-error/8 border border-error/20"
                    >
                      <i class="fa-solid fa-triangle-exclamation text-error text-xs mt-0.5 shrink-0"></i>
                      <p class="text-[12px] text-error leading-snug">{{ submitError }}</p>
                    </div>
                  </Transition>

                  <button
                      type="submit"
                      :disabled="isSubmitting"
                      class="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-buttonBackground hover:bg-buttonHover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-orange hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group cursor-pointer"
                  >
                    <span class="relative z-10">
                      {{ isSubmitting ? 'Submitting...' : 'Submit application' }}
                    </span>
                    <span
                        aria-hidden="true"
                        class="relative z-10 transition-transform duration-200 group-hover:translate-x-1"
                    >&rarr;</span>
                    <div
                        class="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-[shineLoop_0.98s_ease-in-out_infinite_alternate]"
                    ></div>
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
import { useCareers } from '@/composables/useCareers.js'
import Navbar from '../components/navbar.vue'
import Footer from '../components/footer.vue'

const {
  isModalOpen, submitSuccess, isDragging,
  fileName, fileUploaded, fileInput,
  cardsVisible, isSubmitting, submitError,
  formData, formErrors,
  openModal, closeModal,
  triggerFileSelect, handleFileSelect, handleFileDrop,
  handleSubmit, resetForm, onEmailInput,
} = useCareers()
</script>

<style scoped>
@keyframes shineLoop {
  0%   { transform: translateX(-200%); }
  100% { transform: translateX(400%); }
}
</style>