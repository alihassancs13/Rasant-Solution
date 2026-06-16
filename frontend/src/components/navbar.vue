<template>
  <div class="relative w-full z-50">
    <div 
      v-if="isMobileMenuOpen" 
      @click="toggleMobileMenu"
      class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 z-40 md:hidden"
    ></div>

    <!-- Global Desktop Dropdown Backdrop Mask (Darkened to 25% black opacity) -->
      <div 
        v-if="activeDropdown" 
        class="fixed inset-0 bg-slate-900/55 backdrop-blur-[5px] transition-all duration-300 pointer-events-none hidden md:block z-30"
      ></div>

    <header class="fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-200/80 shadow-sm flex items-center justify-between px-6 md:px-12 z-50 transition-all duration-300">
      <a href="#" class="flex items-center shrink-0 group" aria-label="Rasant Solutions home">
        <img 
          src="../assets/rasant-logo.svg" 
          alt="Rasant Solutions Logo" 
          class="h-[42px] w-auto transition-transform duration-200 group-hover:scale-[1.01]" 
          decoding="async"
        />
      </a>

      <div class="hidden md:flex items-center h-full relative">
        <ul class="flex items-center gap-8 h-full m-0 p-0 list-none">
          
          <li 
            class="relative h-full flex items-center group/nav"
            @mouseenter="activeDropdown = 'services'"
            @mouseleave="activeDropdown = null"
          >
            <a href="#services" class="flex items-center gap-1.5 font-medium text-[15px] text-slate-700 hover:text-blue-600 transition-colors duration-200 h-full cursor-pointer">
              Services 
              <i class="fa-solid fa-chevron-down text-[11px] transition-transform duration-200 group-hover/nav:rotate-180"></i>
            </a>
            
            <div 
              class="absolute top-[80px] left-1/2 -translate-x-1/2 w-[340px] bg-white border border-slate-100 rounded-2xl shadow-xl p-4 flex flex-col gap-1 transition-all duration-200 origin-top z-50"
              :class="[activeDropdown === 'services' ? 'opacity-100 scale-100 pointer-events-auto visible' : 'opacity-0 scale-[0.97] pointer-events-none invisible']"
            >
              <div class="absolute top-0 inset-x-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-orange-300 via-pink-400 to-blue-400"></div>

              <a href="#services" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group/item transition-colors duration-200">
                <div class="flex items-center gap-3.5">
                  <div class="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-lg shadow-sm border border-purple-100/40">⚙️</div>
                  <div>
                    <h4 class="font-bold text-[14px] text-slate-800 m-0">Custom Software</h4>
                    <p class="text-[12px] text-slate-500 font-normal m-0">Enterprise apps &amp; APIs</p>
                  </div>
                </div>
                <span class="text-slate-400 font-medium translate-x-[-4px] opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all duration-200">→</span>
              </a>

              <a href="#services" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group/item transition-colors duration-200">
                <div class="flex items-center gap-3.5">
                  <div class="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-lg shadow-sm border border-indigo-100/40">📱</div>
                  <div>
                    <h4 class="font-bold text-[14px] text-slate-800 m-0">Web &amp; Mobile</h4>
                    <p class="text-[12px] text-slate-500 font-normal m-0">React, Flutter &amp; Next.js</p>
                  </div>
                </div>
                <span class="text-slate-400 font-medium translate-x-[-4px] opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all duration-200">→</span>
              </a>

              <a href="#services" class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group/item transition-colors duration-200">
                <div class="flex items-center gap-3.5">
                  <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-lg shadow-sm border border-blue-100/40">☁️</div>
                  <div>
                    <h4 class="font-bold text-[14px] text-slate-800 m-0">Cloud &amp; DevOps</h4>
                    <p class="text-[12px] text-slate-500 font-normal m-0">AWS &amp; Kubernetes</p>
                  </div>
                </div>
                <span class="text-slate-400 font-medium translate-x-[-4px] opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all duration-200">→</span>
              </a>
            </div>
          </li>

          <li 
            class="relative h-full flex items-center group/nav"
            @mouseenter="activeDropdown = 'projects'"
            @mouseleave="activeDropdown = null"
          >
            <a href="#products" class="flex items-center gap-1.5 font-medium text-[15px] text-slate-700 hover:text-blue-600 transition-colors duration-200 h-full cursor-pointer">
              Projects 
              <i class="fa-solid fa-chevron-down text-[11px] transition-transform duration-200 group-hover/nav:rotate-180"></i>
            </a>

            <div 
              class="absolute top-[80px] left-1/2 -translate-x-1/2 w-[460px] bg-white border border-slate-100 rounded-2xl shadow-xl p-5 grid grid-cols-2 gap-3 transition-all duration-200 origin-top z-50"
              :class="[activeDropdown === 'projects' ? 'opacity-100 scale-100 pointer-events-auto visible' : 'opacity-0 scale-[0.97] pointer-events-none invisible']"
            >
              <div class="absolute top-0 inset-x-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-orange-300 via-pink-400 to-blue-400"></div>

              <a href="http://localhost:5173/" class="block p-4 border border-slate-100 rounded-xl hover:border-blue-500/30 hover:bg-slate-50/50 transition-all duration-200">
                <div class="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-1.5">Call Center</div>
                <h4 class="font-bold text-[15px] text-slate-800 mb-0.5">Sentra AI</h4>
                <p class="text-[12px] text-slate-500 font-normal">AI call center platform</p>
              </a>

              <router-link 
              to="/ai-agent" 
              class="block p-4 border border-slate-100 rounded-xl hover:border-blue-500/30 hover:bg-slate-50/50 transition-all duration-200"
            >
              <div class="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded mb-1.5">Voice</div>
              <h4 class="font-bold text-[15px] text-slate-800 mb-0.5">AI Agent</h4>
              <p class="text-[12px] text-slate-500 font-normal">Talking voice agents</p>
            </router-link>

              <a href="#" class="block p-4 border border-slate-100 rounded-xl hover:border-blue-500/30 hover:bg-slate-50/50 transition-all duration-200">
                <div class="inline-block text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded mb-1.5">Chat</div>
                <h4 class="font-bold text-[15px] text-slate-800 mb-0.5">Chatbot</h4>
                <p class="text-[12px] text-slate-500 font-normal">Text and messaging bots</p>
              </a>

              <a href="#" class="block p-4 border border-slate-100 rounded-xl hover:border-blue-500/30 hover:bg-slate-50/50 transition-all duration-200">
                <div class="inline-block text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded mb-1.5">SDLC</div>
                <h4 class="font-bold text-[15px] text-slate-800 mb-0.5">Orchestri</h4>
                <p class="text-[12px] text-slate-500 font-normal">AI multi-agent dev workflow</p>
              </a>
            </div>
          </li>

          <li class="h-full flex items-center">
            <a href="#" class="font-medium text-[15px] text-slate-700 hover:text-blue-600 transition-colors duration-200">Contact</a>
          </li>
        </ul>
      </div>

      <div class="hidden md:flex items-center gap-4">
        <a href="#" class="px-5 py-2.5 border border-blue-400/30 text-[14px] font-semibold rounded-full text-blue-900 hover:bg-blue-50 transition-all duration-200 shadow-sm">
          Login
        </a>
        <button 
          type="button"
          class="bg-[#2A5F9E] hover:bg-[#1E4F87] relative overflow-hidden px-6 py-2.5 text-[14px] font-semibold text-white rounded-full transition-all duration-200 shadow-[0_0_25px_rgba(74,144,226,0.45)] active:scale-[0.98] cursor-pointer flex items-center justify-center"
        >
          Get Quote
          <div class="absolute inset-0 w-1/4 h-full bg-white/10 pointer-events-none animate-shine-loop"></div>
        </button>
      </div>

      <button 
        @click="toggleMobileMenu" 
        class="flex flex-col gap-1.5 md:hidden w-8 h-8 justify-center items-end group p-1 z-50 focus:outline-none"
        aria-label="Toggle Navigation Control Drawer Menu"
      >
        <span class="h-0.5 bg-slate-800 rounded-full transition-all duration-300" :class="[isMobileMenuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6']"></span>
        <span class="h-0.5 bg-slate-800 rounded-full transition-all duration-300" :class="[isMobileMenuOpen ? 'w-0 opacity-0' : 'w-4 group-hover:w-6']"></span>
        <span class="h-0.5 bg-slate-800 rounded-full transition-all duration-300" :class="[isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5 group-hover:w-6']"></span>
      </button>
    </header>

    <nav 
      class="fixed top-0 right-0 bottom-0 w-[280px] bg-white border-l border-slate-100 shadow-2xl pt-24 px-6 flex flex-col gap-4 transform transition-transform duration-300 ease-out z-40 md:hidden"
      :class="[isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full']"
    >
      <a href="#services" @click="isMobileMenuOpen = false" class="text-[16px] font-semibold text-slate-700 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-50 transition-all">Services</a>
      <a href="#products" @click="isMobileMenuOpen = false" class="text-[16px] font-semibold text-slate-700 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-50 transition-all">Projects</a>
      <a href="#" @click="isMobileMenuOpen = false" class="text-[16px] font-semibold text-slate-700 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-50 transition-all">Contact</a>
      
      <button 
        type="button"
        @click="isMobileMenuOpen = false" 
        class="text-[16px] font-semibold text-blue-900 bg-blue-50/60 p-2 rounded-lg transition-all cursor-pointer text-left w-full sm:w-auto"
      >
        Login
      </button>
      
      <a href="#" @click="isMobileMenuOpen = false" class="mt-4 text-center px-5 py-3 bg-blue-600 text-[14px] font-bold text-white rounded-xl shadow-lg shadow-blue-100 transition-all">
        Get a Free Quote
      </a>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeDropdown = ref(null);
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};
</script>