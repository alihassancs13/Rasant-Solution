<template>
  <div class="min-h-screen bg-white font-['Inter'] text-[#1E293B] antialiased selection:bg-[#4A90E2]/20">
    <Navbar />

    <section class="relative overflow-hidden px-6 py-20 text-center bg-pink-50 mt-5">
      <div class="absolute inset-0 opacity-70 mix-blend-multiply pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.09),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_top_left,rgba(219,39,119,0.06),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(241,245,249,1),transparent_60%)]" aria-hidden="true"></div>

      <div class="relative z-10 max-w-3xl mx-auto">
        <span class="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-400/10 text-orange-700 border border-slate-300/30 mb-5">
          <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
          CONTACT
        </span>

        <h1 class="font-['Space_Grotesk',sans-serif] text-4xl sm:text-5xl font-extrabold text-[#1e3a5f] leading-tight">
          Let's start your<br />
          <em class="not-italic text-orange-700">next project</em>
        </h1>

        <p class="mt-4 text-slate-500 text-base sm:text-lg font-['Inter']">
          Share your idea and our team will respond within 24 hours with a free consultation and project estimate.
        </p>
      </div>
    </section>

    <div class="bg-slate-50">
      <section class="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6 sm:gap-9">
        <div class="flex flex-col gap-3.5">
          <div class="animate-reveal-left flex items-start gap-4 p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 hover:translate-x-1 transition-all duration-300" style="animation-delay: 0.05s;">
            <div class="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0">
              <i class="fas fa-envelope border-[#4A90E2]/12"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-1 font-['Space_Grotesk']">Email Us</h4>
              <a href="mailto:hello@rasantsolutions.com" class="text-sm text-slate-500 hover:text-indigo-600 transition-colors font-['Inter']">hello@rasantsolutions.com</a>
            </div>
          </div>

          <div class="animate-reveal-left flex items-start gap-4 p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 hover:translate-x-1 transition-all duration-300" style="animation-delay: 0.12s;">
            <div class="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0">
              <i class="fas fa-phone border-[#4A90E2]/12"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-1 font-['Space_Grotesk']">Call Us</h4>
              <a href="tel:+923000000000" class="text-sm text-slate-500 hover:text-indigo-600 transition-colors font-['Inter']">+92 300 000 0000</a>
            </div>
          </div>

          <div class="animate-reveal-left flex items-start gap-4 p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 hover:translate-x-1 transition-all duration-300" style="animation-delay: 0.19s;">
            <div class="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0">
              <i class="fas fa-location-dot border-[#4A90E2]/12"></i>
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-1 font-['Space_Grotesk']">Visit Us</h4>
              <p class="text-sm text-slate-500 font-['Inter']">Islamabad, Pakistan</p>
            </div>
          </div>

          <div class="animate-reveal-left p-4 sm:p-5 bg-white border border-slate-200 border-l-4 border-l-orange-600 rounded-2xl shadow-sm mt-1" style="animation-delay: 0.26s;">
            <h4 class="text-xs font-bold uppercase  tracking-wide text-orange-600 mb-2 font-['Space_Grotesk']">
              Business Hours
            </h4>
            <p class="text-sm text-slate-500 leading-relaxed font-['Inter']">Mon – Fri: 9:00 AM – 6:00 PM PKT</p>
            <div class="inline-flex items-center gap-2 mt-3 text-xs font-semibold text-slate-900 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full font-['Inter']">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span> Available for new projects
            </div>
          </div>
        </div>

        <div class="animate-reveal-right relative bg-white border border-slate-200 rounded-2xl shadow-lg p-5 sm:p-7 lg:p-9 overflow-hidden" style="animation-delay: 0.1s;">
          <div class="absolute top-0 left-0 right-0 h-1 bg-orange-600"></div>

          <div class="mb-5">
            <h2 class="text-xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Send a message
            </h2>
            <p class="text-sm text-slate-500 mt-1 font-['Inter']">Tell us about your project — we'll reply within one business day.</p>
          </div>

          <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="relative">
                <input type="text" id="fname" name="name" placeholder=" " required autocomplete="name"
                       class="peer w-full rounded-[11px] border border-slate-200 bg-white px-4 pt-4 pb-2 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/10 [&:not(:placeholder-shown)]:border-indigo-600 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-indigo-600/10 font-['Inter']" />
                <label for="fname"
                       class="absolute left-4 top-4 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-indigo-600 font-['Inter']">
                  <i class="far fa-user mr-1.5"></i>Full Name
                </label>
              </div>
              <div class="relative">
                <input type="email" id="femail" name="email" placeholder=" " required autocomplete="email"
                       class="peer w-full rounded-[11px] border border-slate-200 bg-white px-4 pt-4 pb-2 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/10 [&:not(:placeholder-shown)]:border-indigo-600 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-indigo-600/10 font-['Inter']" />
                <label for="femail"
                       class="absolute left-4 top-4 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-indigo-600 font-['Inter']">
                  <i class="far fa-envelope mr-1.5"></i>Email Address
                </label>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="relative">
                <input type="tel" id="fphone" name="phone" placeholder=" " autocomplete="tel"
                       class="peer w-full rounded-[11px] border border-slate-200 bg-white px-4 pt-4 pb-2 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/10 [&:not(:placeholder-shown)]:border-indigo-600 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-indigo-600/10 font-['Inter']" />
                <label for="fphone"
                       class="absolute left-4 top-4 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-indigo-600 font-['Inter']">
                  <i class="fas fa-phone mr-1.5"></i>Phone (optional)
                </label>
              </div>
              <div class="relative">
                <select id="fservice" name="service" required
                        class="peer w-full rounded-[11px] border border-slate-200 bg-white px-4 pt-[22px] pb-2 text-sm text-slate-900 outline-none cursor-pointer transition-colors duration-200 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/10 valid:border-indigo-600 valid:ring-[3px] valid:ring-indigo-600/10 font-['Inter']">
                  <option value="" disabled selected hidden></option>
                  <option value="sentra">Sentra AI — Call Center</option>
                  <option value="ai-agent">AI Agent — Automation</option>
                  <option value="chatbot">Chatbot — Conversational</option>
                  <option value="orchestri">Orchestri — SDLC Platform</option>
                  <option value="custom">Custom Project</option>
                </select>
                <label for="fservice"
                       class="absolute left-4 top-4 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-indigo-600 peer-valid:top-1.5 peer-valid:text-[10px] peer-valid:font-semibold peer-valid:uppercase peer-valid:tracking-wide peer-valid:text-indigo-600 font-['Inter']">
                  <i class="fas fa-project-diagram mr-1.5"></i>Project Type
                </label>
              </div>
            </div>

            <div class="relative">
              <textarea id="fmessage" name="message" placeholder=" " required
                        class="peer w-full rounded-[11px] border border-slate-200 bg-white px-4 pt-[22px] pb-2 text-sm text-slate-900 outline-none resize-y min-h-[110px] transition-colors duration-200 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/10 [&:not(:placeholder-shown)]:border-indigo-600 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-indigo-600/10 font-['Inter']"></textarea>
              <label for="fmessage"
                     class="absolute left-4 top-4 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-indigo-600 font-['Inter']">
                <i class="far fa-comment mr-1.5"></i>Tell us about your project
              </label>
            </div>

            <button type="submit" class="w-full rounded-xl bg-orange-600 text-white font-semibold py-3.5 hover:bg-orange-900 transition-colors relative overflow-hidden group font-['Inter']">
              <span class="relative z-10 inline-flex items-center justify-center">
                <i class="fas fa-paper-plane mr-2"></i>Send Message
              </span>
              <div class="absolute inset-0 top-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-[shineLoop_0.98s_ease-in-out_infinite_alternate]"></div>
            </button>
          </form>
        </div>
      </section>

      <div class="max-w-6xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
        <div class="animate-reveal flex items-center gap-4 bg-white border border-slate-200 rounded-2xl shadow-sm px-4 sm:px-6 py-4 sm:py-5" style="animation-delay: 0.3s;">
          <font-awesome-icon :icon="['fas', 'video']" />
          <p class="text-sm text-slate-500 leading-relaxed font-['Inter']">
            <strong class="text-slate-900 font-['Space_Grotesk']">Remote-first, globally delivered.</strong> We work with clients across 20+ countries. Schedule a video call at a time that works for you — no office visit required.
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

const handleSubmit = (e) => {
  e.preventDefault();
  alert('Message sent! Our team will get back to you within 24 hours.');
};
</script>

<style scoped>
/* Keyframes for entrance reveal animations */
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

@keyframes revealUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom animation utility classes */
.animate-reveal-left {
  opacity: 0;
  animation: revealLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-reveal-right {
  opacity: 0;
  animation: revealRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-reveal {
  opacity: 0;
  animation: revealUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Shine Loop effect rules */
@keyframes shineLoop {
  0% { transform: translateX(-200%); }
  100% { transform: translateX(400%); }
}
</style>