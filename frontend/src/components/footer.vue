<template>
  <footer class="relative overflow-hidden px-[5%] pb-8 border-t-4 border-[#2A5F9E] bg-gradient-to-b from-[#EFF6FF] via-[#F8FAFC] to-white">
    <!-- Decorative blobs -->
    <div class="absolute -top-20 -right-16 w-80 h-80 bg-[radial-gradient(circle,rgba(143,185,244,0.22)_0%,transparent_68%)] pointer-events-none"></div>
    <div class="absolute -bottom-24 left-[8%] w-64 h-64 bg-[radial-gradient(circle,rgba(201,196,248,0.16)_0%,transparent_70%)] pointer-events-none"></div>

    <!-- Footer Top -->
    <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
      <!-- Brand -->
      <div class="lg:col-span-1">
        <router-link to="/" aria-label="Rasant Solutions home" class="inline-flex">
          <img src="../assets/images/rasant-logo.png" alt="" width="212" height="42" decoding="async" class="h-10 w-auto" />
        </router-link>
        <p class="mt-[18px] text-sm leading-relaxed text-slate-600 max-w-[280px]">
          We build intelligent digital products that help businesses grow, innovate, and deliver.
        </p>
      </div>

      <!-- Services -->
      <div>
        <h4 class="text-xs font-bold uppercase tracking-[1.5px] text-[#1E3A5F] mb-[18px] pb-2.5 border-b-2 border-[rgba(42,95,158,0.12)]">
          Services
        </h4>
        <ul class="space-y-2.5">
          <li><router-link to="/#services" class="text-sm text-slate-700 hover:text-[#2A5F9E] hover:translate-x-1 transition-all duration-200 inline-block">Custom Software</router-link></li>
          <li><router-link to="/#services" class="text-sm text-slate-700 hover:text-[#2A5F9E] hover:translate-x-1 transition-all duration-200 inline-block">Web Development</router-link></li>
          <li><router-link to="/#services" class="text-sm text-slate-700 hover:text-[#2A5F9E] hover:translate-x-1 transition-all duration-200 inline-block">Mobile Apps</router-link></li>
          <li><router-link to="/#services" class="text-sm text-slate-700 hover:text-[#2A5F9E] hover:translate-x-1 transition-all duration-200 inline-block">Cloud &amp; DevOps</router-link></li>
        </ul>
      </div>

      <!-- Company -->
      <div>
        <h4 class="text-xs font-bold uppercase tracking-[1.5px] text-[#1E3A5F] mb-[18px] pb-2.5 border-b-2 border-[rgba(42,95,158,0.12)]">
          Company
        </h4>
        <ul class="space-y-2.5">
          <li><router-link to="/#about" class="text-sm text-slate-700 hover:text-[#2A5F9E] hover:translate-x-1 transition-all duration-200 inline-block">About Us</router-link></li>
          <li><router-link to="/careers" class="text-sm text-slate-700 hover:text-[#2A5F9E] hover:translate-x-1 transition-all duration-200 inline-block">Careers</router-link></li>
          <li><router-link to="/#products" class="text-sm text-slate-700 hover:text-[#2A5F9E] hover:translate-x-1 transition-all duration-200 inline-block">Projects</router-link></li>
          <li><router-link to="/pricing" class="text-sm text-slate-700 hover:text-[#2A5F9E] hover:translate-x-1 transition-all duration-200 inline-block">Pricing</router-link></li>
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <h4 class="text-xs font-bold uppercase tracking-[1.5px] text-[#1E3A5F] mb-[18px] pb-2.5 border-b-2 border-[rgba(42,95,158,0.12)]">
          Contact
        </h4>
        <ul class="space-y-2.5">
          <li><router-link to="/contact" class="text-sm text-slate-700 hover:text-[#2A5F9E] hover:translate-x-1 transition-all duration-200 inline-block">Get a Quote</router-link></li>
          <li><router-link to="mailto:hello@rasantsolutions.com" class="text-sm text-slate-700 hover:text-[#2A5F9E] hover:translate-x-1 transition-all duration-200 inline-block">hello@rasantsolutions.com</router-link></li>
          <li><router-link to="tel:+923000000000" class="text-sm text-slate-700 hover:text-[#2A5F9E] hover:translate-x-1 transition-all duration-200 inline-block">+92 300 0000000</router-link></li>
        </ul>
      </div>
    </div>

    <!-- Footer Bottom -->
    <div class="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-[rgba(42,95,158,0.12)]">
      <p class="text-sm text-slate-600">&copy; 2025 Rasant Solutions. All rights reserved.</p>
      
      <div class="flex gap-2.5 flex-wrap" aria-label="Social media">
        <a href="#" aria-label="LinkedIn" class="w-11 h-11 rounded-xl bg-white border border-slate-300 flex items-center justify-center shadow-[0_2px_8px_rgba(30,58,95,0.06)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(42,95,158,0.18)] hover:bg-[#0A66C2] hover:border-[#0A66C2] group">
          <img src="../assets/icons/social-linkedin.svg" alt="" width="20" height="20" decoding="async" class="w-5 h-5 transition duration-250 group-hover:filter group-hover:brightness-0 group-hover:invert" />
        </a>
        <a href="#" aria-label="X" class="w-11 h-11 rounded-xl bg-white border border-slate-300 flex items-center justify-center shadow-[0_2px_8px_rgba(30,58,95,0.06)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(42,95,158,0.18)] hover:bg-[#1E3A5F] hover:border-[#1E3A5F] group">
          <img src="../assets/icons/social-x.svg" alt="" width="20" height="20" decoding="async" class="w-5 h-5 transition duration-250 group-hover:filter group-hover:brightness-0 group-hover:invert" />
        </a>
        <a href="#" aria-label="GitHub" class="w-11 h-11 rounded-xl bg-white border border-slate-300 flex items-center justify-center shadow-[0_2px_8px_rgba(30,58,95,0.06)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(42,95,158,0.18)] hover:bg-[#1E3A5F] hover:border-[#1E3A5F] group">
          <img src="../assets/icons/social-github.svg" alt="" width="20" height="20" decoding="async" class="w-5 h-5 transition duration-250 group-hover:filter group-hover:brightness-0 group-hover:invert" />
        </a>
        <a href="#" aria-label="Instagram" class="w-11 h-11 rounded-xl bg-white border border-slate-300 flex items-center justify-center shadow-[0_2px_8px_rgba(30,58,95,0.06)] transition-all duration-250 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(42,95,158,0.18)] hover:bg-[#E1306C] hover:border-[#E1306C] group">
          <img src="../assets/icons/social-instagram.svg" alt="" width="20" height="20" decoding="async" class="w-5 h-5 transition duration-250 group-hover:filter group-hover:brightness-0 group-hover:invert" />
        </a>
      </div>
    </div>
  </footer>
</template>