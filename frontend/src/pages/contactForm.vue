<template>
  <div>
    <!-- adjust path to your existing reusable Navbar component -->
    <Navbar />

    <section class="relative overflow-hidden px-6 py-20 text-center bg-pink-50 mt-5">
  <div class="absolute inset-0 opacity-70 mix-blend-multiply pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.09),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_top_left,rgba(219,39,119,0.06),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(241,245,249,1),transparent_60%)]" aria-hidden="true"></div>

  <div class="relative z-10 max-w-3xl mx-auto">
    <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-orange-800 mb-4 select-none">
      <span class="relative flex h-2 w-2">
      <span class="animate-ping absolute inline-flex  h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
      </span>
        Contact
      </div>

      <h1 class="font-['Space_Grotesk',sans-serif] text-4xl sm:text-5xl font-bold text-[#1e3a5f] leading-tight">
        Let's start your<br />
        <em class="italic text-orange-700">next project</em>
      </h1>

        <p class="mt-4 text-slate-500 text-base sm:text-lg">
          Share your idea and our team will respond within 24 hours with a free consultation and project estimate.
        </p>
      </div>
    </section>

    <div class="bg-slate-50">
      <section class="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-9">
        <!-- left: contact info -->
        <div class="flex flex-col gap-3.5">
          <div class="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 hover:translate-x-1 transition-all">
            <div class="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0">✉️</div>
            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-1">Email Us</h4>
              <a href="mailto:hello@rasantsolutions.com" class="text-sm text-slate-500 hover:text-indigo-600 transition-colors">hello@rasantsolutions.com</a>
            </div>
          </div>

          <div class="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 hover:translate-x-1 transition-all">
            <div class="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0">📱</div>
            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-1">Call Us</h4>
              <a href="tel:+923000000000" class="text-sm text-slate-500 hover:text-indigo-600 transition-colors">+92 300 000 0000</a>
            </div>
          </div>

          <div class="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 hover:translate-x-1 transition-all">
            <div class="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0">📍</div>
            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-1">Visit Us</h4>
              <p class="text-sm text-slate-500">Islamabad, Pakistan</p>
            </div>
          </div>

          <div class="p-5 bg-white border border-slate-200 border-l-4 border-l-indigo-600 rounded-2xl shadow-sm mt-1">
            <h4 class="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-2">Business Hours</h4>
            <p class="text-sm text-slate-500 leading-relaxed">Mon – Fri: 9:00 AM – 6:00 PM PKT<br />Sat: 10:00 AM – 2:00 PM PKT</p>
            <div class="inline-flex items-center gap-2 mt-3 text-xs font-semibold text-slate-900 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span> Available for new projects
            </div>
          </div>
        </div>

        <!-- right: contact form -->
        <div class="relative bg-white border border-slate-200 rounded-2xl shadow-lg p-7 sm:p-9 overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-1 bg-orange-800"></div>

          <div class="mb-5">
            <h2 class="text-xl font-bold text-slate-900 tracking-tight">Send a message</h2>
            <p class="text-sm text-slate-500 mt-1">Tell us about your project — we'll reply within one business day.</p>
          </div>

          <form class="flex flex-col gap-4.5" action="#" method="post">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="relative">
                <input type="text" id="fname" name="name" placeholder=" " required autocomplete="name"
                  class="peer w-full rounded-[11px] border border-slate-200 bg-white px-4 pt-4 pb-2 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/10 [&:not(:placeholder-shown)]:border-indigo-600 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-indigo-600/10" />
                <label for="fname"
                  class="absolute left-4 top-4 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-indigo-600">Full Name</label>
              </div>
              <div class="relative">
                <input type="email" id="femail" name="email" placeholder=" " required autocomplete="email"
                  class="peer w-full rounded-[11px] border border-slate-200 bg-white px-4 pt-4 pb-2 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/10 [&:not(:placeholder-shown)]:border-indigo-600 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-indigo-600/10" />
                <label for="femail"
                  class="absolute left-4 top-4 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-indigo-600">Email Address</label>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="relative">
                <input type="tel" id="fphone" name="phone" placeholder=" " autocomplete="tel"
                  class="peer w-full rounded-[11px] border border-slate-200 bg-white px-4 pt-4 pb-2 text-sm text-slate-900 outline-none transition-colors duration-200 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/10 [&:not(:placeholder-shown)]:border-indigo-600 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-indigo-600/10" />
                <label for="fphone"
                  class="absolute left-4 top-4 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-indigo-600">Phone (optional)</label>
              </div>
              <div class="relative">
                <select id="fservice" name="service" required
                  class="peer w-full rounded-[11px] border border-slate-200 bg-white px-4 pt-[22px] pb-2 text-sm text-slate-900 outline-none cursor-pointer transition-colors duration-200 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/10 valid:border-indigo-600 valid:ring-[3px] valid:ring-indigo-600/10">
                  <option value="" disabled selected hidden></option>
                  <option value="sentra">Sentra AI — Call Center</option>
                  <option value="ai-agent">AI Agent — Automation</option>
                  <option value="chatbot">Chatbot — Conversational</option>
                  <option value="orchestri">Orchestri — SDLC Platform</option>
                  <option value="custom">Custom Project</option>
                </select>
                <label for="fservice"
                  class="absolute left-4 top-4 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-indigo-600 peer-valid:top-1.5 peer-valid:text-[10px] peer-valid:font-semibold peer-valid:uppercase peer-valid:tracking-wide peer-valid:text-indigo-600">Project Type</label>
              </div>
            </div>

            <div class="relative">
              <textarea id="fmessage" name="message" placeholder=" " required
                class="peer w-full rounded-[11px] border border-slate-200 bg-white px-4 pt-[22px] pb-2 text-sm text-slate-900 outline-none resize-y min-h-[110px] transition-colors duration-200 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/10 [&:not(:placeholder-shown)]:border-indigo-600 [&:not(:placeholder-shown)]:ring-[3px] [&:not(:placeholder-shown)]:ring-indigo-600/10"></textarea>
              <label for="fmessage"
                class="absolute left-4 top-4 text-sm text-slate-500 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wide peer-focus:text-indigo-600 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wide peer-[:not(:placeholder-shown)]:text-indigo-600">Tell us about your project</label>
            </div>

            <div>
              <button type="submit" class="w-full rounded-xl bg-orange-800 text-white font-semibold py-3.5 hover:bg-orange-900 transition-colors relative overflow-hidden group">
              <div class="absolute inset-0 top-0 w-1/3 h-full bg-linear-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-[shineLoop_0.98s_ease-in-out_infinite_alternate]"></div>
              
              <span class="relative z-10">Send Message</span>
            </button>
            </div>
          </form>
        </div>
      </section>

      <div class="max-w-6xl mx-auto px-6 pb-14">
        <div class="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-5">
          <span class="text-2xl">🌍</span>
          <p class="text-sm text-slate-500 leading-relaxed">
            <strong class="text-slate-900">Remote-first, globally delivered.</strong> We work with clients across 20+ countries. Schedule a video call at a time that works for you — no office visit required.
          </p>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
// adjust these two import paths to match your project structure
import Footer from '@/components/footer.vue';
import Navbar from '@/components/navbar.vue';
</script>