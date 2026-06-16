<template>
  <footer class="bg-linear-to-b from-[#EFF6FF] via-[#F8FAFC] to-white text-slate-700 border-t-4 border-[#2A5F9E] p-4">
    <div class="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
      <div>
        <router-link to="/" aria-label="Rasant Solutions home" class="inline-flex">
          <img src="../assets/rasant-logo.png" alt="" width="212" height="42" decoding="async" class="h-10 w-auto" />
        </router-link>
        <p class="mt-4 text-sm text-slate-500 leading-relaxed">
          We build intelligent digital products that help businesses grow, innovate, and deliver.
        </p>
      </div>

      <div>
        <h4 class="text-slate-900 font-semibold mb-4">Services</h4>
        <ul class="space-y-2 text-sm">
          <li><router-link to="/#services" class="hover:text-[#2A5F9E] transition-colors">Custom Software</router-link></li>
          <li><router-link to="/#services" class="hover:text-[#2A5F9E] transition-colors">Web &amp; Mobile</router-link></li>
          <li><router-link to="/#services" class="hover:text-[#2A5F9E] transition-colors">Cloud &amp; DevOps</router-link></li>
        </ul>
      </div>

      <div>
        <h4 class="text-slate-900 font-semibold mb-4">Company</h4>
        <ul class="space-y-2 text-sm">
          <li><router-link to="/#about" class="hover:text-[#2A5F9E] transition-colors">About</router-link></li>
          <li><router-link to="/pricing" class="hover:text-[#2A5F9E] transition-colors">Pricing</router-link></li>
          <li><router-link to="/contact" class="hover:text-[#2A5F9E] transition-colors">Contact</router-link></li>
        </ul>
      </div>

      <div>
        <h4 class="text-slate-900 font-semibold mb-4">Contact</h4>
        <ul class="space-y-2 text-sm">
          <li><router-link to="mailto:hello@rasantsolutions.com" class="hover:text-[#2A5F9E] transition-colors">hello@rasantsolutions.com</router-link></li>
          <li><router-link to="tel:+923000000000" class="hover:text-[#2A5F9E] transition-colors">+92 300 000 0000</router-link></li>
        </ul>
      </div>
    </div>

    <div class="border-t border-slate-200">
      <div class="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p class="text-slate-900 font-medium">Connect with us</p>
          <span class="block text-sm text-slate-500">Follow Rasant Solutions for product updates and insights</span>
        </div>
        <div class="flex gap-3" aria-label="Social media">
          <router-link to="#" aria-label="LinkedIn" class="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <img src="../assets/social-linkedin.svg" alt="" width="20" height="20" decoding="async" />
          </router-link>
          <router-link to="#" aria-label="X" class="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <img src="../assets/social-x.svg" alt="" width="20" height="20" decoding="async" />
          </router-link>
          <router-link to="#" aria-label="GitHub" class="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <img src="../assets/social-github.svg" alt="" width="20" height="20" decoding="async" />
          </router-link>
          <router-link to="#" aria-label="Instagram" class="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <img src="../assets/social-instagram.svg" alt="" width="20" height="20" decoding="async" />
          </router-link>
        </div>
      </div>
    </div>

    <div class="border-t border-slate-200">
      <div class="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-slate-500">
        © 2025 Rasant Solutions. All rights reserved.
      </div>
    </div>
  </footer>
</template>