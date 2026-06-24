<template>
  <div class="min-h-screen bg-section-white font-primary text-headingMain antialiased selection:bg-primary-500/20">
    <Navbar />

    <section class="relative overflow-hidden px-6 py-20 text-center bg-secondary-50 mt-5">
      <div class="absolute inset-0 opacity-70 mix-blend-multiply pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.09),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_top_left,rgba(219,39,119,0.06),transparent_40%),radial-gradient(circle_at_bottom_right,var(--color-neutral-100),transparent_60%)]" aria-hidden="true"></div>

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
        <div class="flex flex-col gap-3.5">
          <div class="animate-reveal-left flex items-start gap-4 p-4 sm:p-5 bg-section-white border border-borderDefault rounded-xl shadow-sm hover:shadow-md hover:border-card-hover-border hover:translate-x-1 transition-all duration-300" style="animation-delay: 0.05s;">
            <div class="w-11 h-11 rounded-xl bg-accent-3/10 border border-accent-3/20 flex items-center justify-center text-xl shrink-0">
              <i class="fas fa-envelope text-accent-3 text-headingMain"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-headingMain mb-1 font-display">Email Us</h4>
              <a href="mailto:hello@rasantsolutions.com" class="text-sm text-textBody hover:text-accent-3 transition-colors font-primary">hello@rasantsolutions.com</a>
            </div>
          </div>

          <div class="animate-reveal-left flex items-start gap-4 p-4 sm:p-5 bg-section-white border border-borderDefault rounded-xl shadow-sm hover:shadow-md hover:border-card-hover-border hover:translate-x-1 transition-all duration-300" style="animation-delay: 0.12s;">
            <div class="w-11 h-11 rounded-xl bg-accent-3/10 border border-accent-3/20 flex items-center justify-center text-xl shrink-0">
              <i class="fas fa-phone text-headingMain"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-headingMain mb-1 font-display">Call Us</h4>
              <a href="tel:+923000000000" class="text-sm text-textBody hover:text-accent-3 transition-colors font-primary">+92 300 000 0000</a>
            </div>
          </div>

          <div class="animate-reveal-left flex items-start gap-4 p-4 sm:p-5 bg-section-white border border-borderDefault rounded-xl shadow-sm hover:shadow-md hover:border-card-hover-border hover:translate-x-1 transition-all duration-300" style="animation-delay: 0.19s;">
            <div class="w-11 h-11 rounded-xl bg-accent-3/10 border border-accent-3/20 flex items-center justify-center text-xl shrink-0">
              <i class="fas fa-location-dot text-headingMain"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-headingMain mb-1 font-display">Visit Us</h4>
              <p class="text-sm text-textBody font-primary">Islamabad, Pakistan</p>
            </div>
          </div>

          <div class="animate-reveal-left p-4 sm:p-5 bg-section-white border border-borderDefault border-l-4 border-l-secondary-600 rounded-xl shadow-sm mt-1" style="animation-delay: 0.26s;">
            <h4 class="text-xs font-bold uppercase tracking-wide text-secondary-600 mb-2 font-display">
              Business Hours
            </h4>
            <p class="text-sm text-textBody leading-relaxed font-primary">Mon – Fri: 10:00 AM – 7:00 PM PKT</p>
            <div class="inline-flex items-center gap-2 mt-3 text-xs font-semibold text-headingMain bg-accent-1/10 border border-accent-1/30 px-3 py-1.5 rounded-full font-primary">
              <span class="w-1.5 h-1.5 rounded-full bg-accent-1 animate-pulse"></span> Available for new projects
            </div>
          </div>
        </div>

        <div class="animate-reveal-right relative bg-section-white border border-borderDefault rounded-2xl shadow-lg p-5 sm:p-7 lg:p-9 overflow-hidden" style="animation-delay: 0.1s;">
          <div class="absolute top-0 left-0 right-0 h-1 bg-secondary-600"></div>

          <div class="mb-5">
            <h2 class="text-xl font-bold text-headingMain tracking-tight font-display">
              Send a message
            </h2>
            <p class="text-sm text-textBody mt-1 font-primary">Tell us about your project — we'll reply within one business day.</p>
          </div>

          <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="relative">
                <input type="text" id="fname" name="name" placeholder=" " required autocomplete="name"
                       class="peer w-full rounded-[11px] border border-borderDefault bg-section-white px-4 pt-4 pb-2 text-sm text-headingMain outline-none transition-colors duration-200 focus:border-accent-3 focus:ring-[3px] focus:ring-accent-3/10 [&:not(:placeholder-shown)]:border-accent-3 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-accent-3/10 font-primary" />
                <label for="fname"
                       class="absolute left-4 top-4 text-sm text-textBody pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-accent-3 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-accent-3 font-primary">
                  <i class="far fa-user mr-1.5"></i>Full Name
                </label>
              </div>
              <div class="relative">
                <input type="email" id="femail" name="email" placeholder=" " required autocomplete="email"
                       class="peer w-full rounded-[11px] border border-borderDefault bg-section-white px-4 pt-4 pb-2 text-sm text-headingMain outline-none transition-colors duration-200 focus:border-accent-3 focus:ring-[3px] focus:ring-accent-3/10 [&:not(:placeholder-shown)]:border-accent-3 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-accent-3/10 font-primary" />
                <label for="femail"
                       class="absolute left-4 top-4 text-sm text-textBody pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-accent-3 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-accent-3 font-primary">
                  <i class="far fa-envelope mr-1.5"></i>Email Address
                </label>
              </div>
            </div>

            <div class="relative">
              <input type="tel" id="fphone" name="phone" placeholder=" " autocomplete="tel"
                     class="peer w-full rounded-[11px] border border-borderDefault bg-section-white px-4 pt-4 pb-2 text-sm text-headingMain outline-none transition-colors duration-200 focus:border-accent-3 focus:ring-[3px] focus:ring-accent-3/10 [&:not(:placeholder-shown)]:border-accent-3 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-accent-3/10 font-primary" />
              <label for="fphone"
                     class="absolute left-4 top-4 text-sm text-textBody pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-accent-3 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-accent-3 font-primary">
                <i class="fas fa-phone mr-1.5"></i>Phone (optional)
              </label>
            </div>

            <div class="relative">
              <textarea id="fmessage" name="message" placeholder=" " required
                        class="peer w-full rounded-[11px] border border-borderDefault bg-section-white px-4 pt-[22px] pb-2 text-sm text-headingMain outline-none resize-y min-h-[110px] transition-colors duration-200 focus:border-accent-3 focus:ring-[3px] focus:ring-accent-3/10 [&:not(:placeholder-shown)]:border-accent-3 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-accent-3/10 font-primary"></textarea>
              <label for="fmessage"
                     class="absolute left-4 top-4 text-sm text-textBody pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-accent-3 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-accent-3 font-primary">
                <i class="far fa-comment mr-1.5"></i>Tell us about your project
              </label>
            </div>

            <ShineButton type="submit" size="lg" class="w-full">
              <i class="fas fa-paper-plane"></i>
              Send Message
            </ShineButton>
          </form>
        </div>
      </section>

      <div class="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
        <div class="animate-reveal flex items-center gap-4 bg-section-white border border-borderDefault rounded-2xl shadow-sm px-4 sm:px-6 py-4 sm:py-5" style="animation-delay: 0.3s;">
          <font-awesome-icon :icon="['fas', 'video']" class="text-headingMain text-xl" />
          <p class="text-sm text-textBody leading-relaxed font-primary">
            <strong class="text-headingMain font-display">Remote-first, globally delivered.</strong> We work with clients across 20+ countries. Schedule a video call at a time that works for you — no office visit required.
          </p>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import Footer from '@/components/footer.vue';
import Navbar from '@/components/navbar.vue';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import ShineButton from "@/components/ShineButton.vue";

const handleSubmit = (e) => {
  e.preventDefault();
  alert('Message sent! Our team will get back to you within 24 hours.');
};
</script>

<style scoped>
/* Animation keyframes */
@keyframes revealLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes revealRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-reveal-left {
  animation: revealLeft 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
}

.animate-reveal-right {
  animation: revealRight 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
}

.animate-reveal {
  animation: reveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
}
</style>