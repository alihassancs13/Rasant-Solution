<template>
  <div class="min-h-screen bg-section-white font-primary text-headingMain antialiased selection:bg-primary-500/20">
    <Navbar />

    <!-- Hero Section -->
    <section class="relative overflow-hidden px-6 py-20 text-center bg-secondary-50 mt-5">
      <div class="absolute inset-0 pointer-events-none bg-[linear-gradient(120deg,#fdf1e7_0%,#f7e9ec_30%,#eee9f2_55%,#e7eaf5_80%)]" aria-hidden="true"></div>
      <div class="relative z-10 max-w-3xl mx-auto">
        <span class="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-neutral-400/10 text-secondary-700 border border-borderDefault mb-5 font-display">
          <span class="w-1.5 h-1.5 rounded-full bg-accent-1 animate-pulse"></span>
          CONTACT
        </span>
        <h1 class="font-display text-4xl sm:text-5xl font-bold text-headingMain leading-tight">
          Let's start your<br />
          <em class="not-italic text-secondary-700">next project</em>
        </h1>
        <p class="mt-4 text-textBody text-base sm:text-lg font-primary">
          Share your idea and our team will respond within 24 hours with a free consultation and project estimate.
        </p>
      </div>
    </section>

    <div class="bg-neutral-100">
      <section class="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6 sm:gap-9">

        <!-- Left: Contact Info -->
        <MobileAutoSlide
            :items="contactCards"
            min-height="120px"
            stack-below="lg"
            desktop-class="grid-cols-1 gap-3.5"
            item-key="id"
        >
          <template #default="{ item: card }">
            <div
                :class="[
                  'flex items-start gap-4 p-4 sm:p-5 bg-section-white border border-borderDefault rounded-xl shadow-sm hover:shadow-md hover:border-card-hover-border hover:translate-x-1 transition-all duration-300',
                  card.variant === 'hours' ? 'border-l-4 border-l-secondary-600' : '',
                ]"
            >
              <div
                  v-if="card.icon"
                  class="w-11 h-11 rounded-xl bg-accent-3/10 border border-accent-3/20 flex items-center justify-center shrink-0"
              >
                <font-awesome-icon :icon="card.icon" class="text-headingMain text-lg" />
              </div>
              <div>
                <h4 :class="['font-bold text-headingMain mb-1 font-display', card.variant === 'hours' ? 'text-xs uppercase tracking-wide text-secondary-600' : 'text-sm']">
                  {{ card.title }}
                </h4>
                <a
                    v-if="card.href"
                    :href="card.href"
                    class="text-sm text-textBody hover:text-accent-3 transition-colors font-primary"
                >{{ card.text }}</a>
                <p v-else class="text-sm text-textBody font-primary leading-relaxed">{{ card.text }}</p>
                <div
                    v-if="card.badge"
                    class="inline-flex items-center gap-2 mt-3 text-xs font-semibold text-headingMain bg-accent-1/10 border border-accent-1/30 px-3 py-1.5 rounded-full font-primary"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-accent-1 animate-pulse"></span>
                  {{ card.badge }}
                </div>
              </div>
            </div>
          </template>
        </MobileAutoSlide>

        <!-- Right: Contact Form -->
        <div class="animate-reveal-right relative bg-section-white border border-borderDefault rounded-2xl shadow-lg p-5 sm:p-7 lg:p-9 overflow-hidden" style="animation-delay: 0.1s;">
          <div class="absolute top-0 left-0 right-0 h-1 bg-secondary-600"></div>

          <form class="flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Full Name -->
              <div class="relative">
                <input v-model="form.full_name" type="text" id="fname" placeholder=" " required autocomplete="name"
                       class="peer w-full rounded-[11px] border border-borderDefault bg-section-white px-4 pt-4 pb-2 text-sm text-headingMain outline-none transition-colors duration-200 focus:border-accent-3 focus:ring-[3px] focus:ring-accent-3/10 [&:not(:placeholder-shown)]:border-accent-3 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-accent-3/10 font-primary" />
                <label for="fname" class="absolute left-4 top-4 text-sm text-textBody pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-accent-3 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-accent-3 font-primary">
                  <font-awesome-icon :icon="['far', 'user']" class="mr-1.5" />Full Name
                </label>
                <p v-if="formErrors.full_name" class="text-xs text-red-500 mt-1">{{ formErrors.full_name }}</p>
              </div>

              <!-- Email -->
              <div class="relative">
                <input v-model="form.email" @input="onEmailInput" type="email" id="femail" placeholder=" " required autocomplete="email"
                       class="peer w-full rounded-[11px] border border-borderDefault bg-section-white px-4 pt-4 pb-2 text-sm text-headingMain outline-none transition-colors duration-200 focus:border-accent-3 focus:ring-[3px] focus:ring-accent-3/10 [&:not(:placeholder-shown)]:border-accent-3 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-accent-3/10 font-primary" />
                <label for="femail" class="absolute left-4 top-4 text-sm text-textBody pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-accent-3 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-accent-3 font-primary">
                  <font-awesome-icon :icon="['far', 'envelope']" class="mr-1.5" />Email Address
                </label>
                <p v-if="formErrors.email" class="text-xs text-red-500 mt-1">{{ formErrors.email }}</p>
              </div>
            </div>

            <!-- Phone -->
            <div class="relative">
              <input v-model="form.phone" type="tel" id="fphone" placeholder=" " autocomplete="tel"
                     class="peer w-full rounded-[11px] border border-borderDefault bg-section-white px-4 pt-4 pb-2 text-sm text-headingMain outline-none transition-colors duration-200 focus:border-accent-3 focus:ring-[3px] focus:ring-accent-3/10 [&:not(:placeholder-shown)]:border-accent-3 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-accent-3/10 font-primary" />
              <label for="fphone" class="absolute left-4 top-4 text-sm text-textBody pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-accent-3 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-accent-3 font-primary">
                <font-awesome-icon :icon="['fas', 'phone']" class="mr-1.5" />Phone (optional)
              </label>
              <p v-if="formErrors.phone" class="text-xs text-red-500 mt-1">{{ formErrors.phone }}</p>
            </div>

            <!-- Message -->
            <div class="relative">
              <textarea v-model="form.message" id="fmessage" placeholder=" " required
                        class="peer w-full rounded-[11px] border border-borderDefault bg-section-white px-4 pt-[22px] pb-2 text-sm text-headingMain outline-none resize-y min-h-[110px] transition-colors duration-200 focus:border-accent-3 focus:ring-[3px] focus:ring-accent-3/10 [&:not(:placeholder-shown)]:border-accent-3 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-accent-3/10 font-primary"></textarea>
              <label for="fmessage" class="absolute left-4 top-4 text-sm text-textBody pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-accent-3 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-accent-3 font-primary">
                <font-awesome-icon :icon="['far', 'comment']" class="mr-1.5" />Tell us about your project
              </label>
              <p v-if="formErrors.message" class="text-xs text-red-500 mt-1">{{ formErrors.message }}</p>
            </div>

            <ShineButton
                type="submit"
                size="lg"
                class="w-full"
                :disabled="loading"
            >
              <font-awesome-icon v-if="loading" :icon="['fas', 'spinner']" class="animate-spin" />
              <font-awesome-icon v-else :icon="['fas', 'paper-plane']" />
              {{ loading ? 'Sending...' : 'Send Message' }}
            </ShineButton>

          </form>
        </div>
      </section>

      <div class="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
        <div class="animate-reveal flex items-center gap-4 bg-section-white border border-borderDefault rounded-2xl shadow-sm px-4 sm:px-6 py-4 sm:py-5" style="animation-delay: 0.3s;">
          <font-awesome-icon :icon="['fas', 'video']" class="text-headingMain text-xl" />
          <p class="text-sm text-textBody leading-relaxed font-primary">
            <strong class="text-headingMain font-display">Globally delivered.</strong>
            We partner with clients across 20+ countries worldwide with proven expertise. Delivering reliable solutions to your business needs.
          </p>
        </div>
      </div>
    </div>

    <Footer />

    <!-- Toast notifications -->
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm" aria-live="polite" aria-atomic="true">
      <TransitionGroup
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-x-6"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition-all duration-200 ease-in absolute"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 translate-x-6"
          move-class="transition-transform duration-200"
      >
        <div
            v-for="t in toasts"
            :key="t.id"
            role="alert"
            :class="[
              'relative flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm backdrop-blur-sm',
              t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800'
                : t.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-primary-50 border-primary-200 text-primary-800',
            ]"
        >
          <font-awesome-icon
              :icon="t.type === 'success' ? ['fas', 'circle-check']
                : t.type === 'error' ? ['fas', 'circle-exclamation']
                : t.type === 'warning' ? ['fas', 'triangle-exclamation']
                : ['fas', 'circle-info']"
              :class="[
                t.type === 'success' ? 'text-emerald-600'
                  : t.type === 'error' ? 'text-red-600'
                  : t.type === 'warning' ? 'text-amber-600'
                  : 'text-primary-600',
                'text-base mt-0.5 shrink-0',
              ]"
          />
          <p class="flex-1 leading-snug">{{ t.message }}</p>
          <button
              type="button"
              @click="removeToast(t.id)"
              class="shrink-0 text-lg leading-none opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Dismiss notification"
          >&times;</button>
        </div>
      </TransitionGroup>
    </div>

  </div>
</template>

<script setup>
import { useContact } from '@/composables/useContactForm.js'
import ShineButton from '@/components/ShineButton.vue'
import Navbar from "@/components/navbar.vue"
import Footer from "../components/footer.vue"
import MobileAutoSlide from '@/components/MobileAutoSlide.vue'

const contactCards = [
  {
    id: 'email',
    icon: ['fas', 'envelope'],
    title: 'Email Us',
    href: 'mailto:career@rasantsol.com',
    text: 'career@rasantsol.com',
  },
  {
    id: 'phone',
    icon: ['fas', 'phone'],
    title: 'Call Us',
    href: 'tel:+92512716768',
    text: '051 2716768',
  },
  {
    id: 'address',
    icon: ['fas', 'location-dot'],
    title: 'Visit Us',
    text: 'Office no 1, Rasant Solutions, Karnal Sher Khan Shaheed Rd, near PSO pump, New Katarian Satellite Town, Islamabad',
  },
  {
    id: 'hours',
    variant: 'hours',
    title: 'Business Hours',
    text: 'Mon – Fri: 10:00 AM – 7:00 PM PKT',
    badge: 'Available for new projects',
  },
]

const { form, formErrors, loading, toasts, removeToast, handleSubmit, onEmailInput } = useContact()
</script>

<style scoped>
@keyframes revealLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes revealRight {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes reveal {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-reveal-left  { animation: revealLeft  0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
.animate-reveal-right { animation: revealRight 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
.animate-reveal       { animation: reveal      0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
</style>