<template>
  <div class="relative w-full z-50">

    <!-- Mobile Backdrop -->
    <div
        v-if="isMobileMenuOpen"
        @click="closeMobileMenu"
        class="fixed inset-0 bg-neutral-950/45 backdrop-blur-[4px] transition-opacity duration-400 z-40 md:hidden"
    ></div>

    <!-- Desktop Dropdown Backdrop -->
    <Transition name="backdrop-fade">
      <div
          v-if="activeDropdown"
          class="fixed inset-0 bg-neutral-950/45 backdrop-blur-[4px] pointer-events-none hidden md:block z-30"
      ></div>
    </Transition>

    <!-- ===== HEADER ===== -->
    <header
        id="navbar"
        class="fixed top-0 left-0 right-0 h-16 md:h-20 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 z-50 bg-white shadow-[0_4px_30px_rgba(15,23,42,0.08)]"
    >
      <!-- Logo -->
      <router-link to="/" class="flex items-center shrink-0 z-[2]" aria-label="Rasant Solutions home" @click="handleLogoClick">
        <img
            src="../assets/images/rasant-logo.png"
            alt="Rasant Solutions Logo"
            class="h-11 sm:h-12 md:h-14 w-auto transition-opacity duration-200 hover:opacity-86"
            decoding="async"
        />
      </router-link>

      <!-- ===== DESKTOP NAV CENTER ===== -->
      <div class="hidden md:flex items-stretch h-full absolute left-1/2 -translate-x-1/2">
        <ul class="flex items-center gap-0.5 h-full list-none m-0 p-0">

          <!-- Services -->
          <li
              class="relative h-full flex items-center"
              @mouseenter="activeDropdown = 'services'"
              @mouseleave="activeDropdown = null"
          >
            <button
                type="button"
                class="flex items-center gap-1.5 px-3 lg:px-5 h-11 rounded-xl font-display font-bold text-[14px] lg:text-[15px] tracking-[-0.2px] transition-all duration-200 border-0 cursor-pointer whitespace-nowrap"
                :class="activeDropdown === 'services' || $route.hash === '#services'
                ? 'text-primary-500 bg-primary-500/12'
                : 'text-primary-900 bg-transparent hover:text-primary-500 hover:bg-primary-500/7'"
            >
              Services
            </button>

            <!-- Services Dropdown -->
            <div class="absolute top-full left-1/2 -translate-x-1/2 w-[280px] z-50">
              <Transition name="dropdown">
                <div
                    v-show="activeDropdown === 'services'"
                    class="bg-white rounded-[0_0_20px_20px] shadow-[0_20px_60px_rgba(15,23,42,0.14)] border border-neutral-300 border-t-[3px] border-t-primary-500 pt-3 pb-4 px-2.5"
                >
                  <button
                      @click="navigateToServicesSection('services')"
                      class="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-100 hover:translate-x-1 group/item transition-all duration-200 w-full text-left relative overflow-hidden"
                  >
                    <div class="w-10 h-10 rounded-[10px] bg-primary-500/10 flex items-center justify-center text-[18px] shrink-0">
                      <i class="fa-solid fa-code text-primary-500"></i>
                    </div>
                    <div class="flex-1">
                      <h4 class="text-[14px] font-display font-bold text-primary-900 mb-[3px] m-0">Custom Software</h4>
                      <p class="text-[12px] text-neutral-500 m-0 leading-[1.45]">Java, Grails, Python &amp; APIs</p>
                    </div>
                  </button>

                  <button
                      @click="navigateToServicesSection('services')"
                      class="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-100 hover:translate-x-1 group/item transition-all duration-200 w-full text-left relative overflow-hidden"
                  >
                    <div class="w-10 h-10 rounded-[10px] bg-accent-7/10 flex items-center justify-center text-[18px] shrink-0">
                      <i class="fa-solid fa-desktop text-accent-7"></i>
                    </div>
                    <div class="flex-1">
                      <h4 class="text-[14px] font-display font-bold text-primary-900 mb-[3px] m-0">Web Applications</h4>
                      <p class="text-[12px] text-neutral-500 m-0 leading-[1.45]">Vue.js, React, Tailwind &amp; HTML</p>
                    </div>
                  </button>

                  <button
                      @click="navigateToServicesSection('services')"
                      class="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-100 hover:translate-x-1 group/item transition-all duration-200 w-full text-left relative overflow-hidden"
                  >
                    <div class="w-10 h-10 rounded-[10px] bg-primary-400/10 flex items-center justify-center text-[18px] shrink-0">
                      <i class="fa-brands fa-wordpress text-primary-400"></i>
                    </div>
                    <div class="flex-1">
                      <h4 class="text-[14px] font-display font-bold text-primary-900 mb-[3px] m-0">WordPress &amp; CMS</h4>
                      <p class="text-[12px] text-neutral-500 m-0 leading-[1.45]">Sites, themes &amp; integrations</p>
                    </div>
                  </button>
                </div>
              </Transition>
            </div>
          </li>

          <!-- Projects -->
          <li
              class="relative h-full flex items-center"
              @mouseenter="activeDropdown = 'projects'"
              @mouseleave="activeDropdown = null"
          >
            <button
                type="button"
                class="flex items-center gap-1.5 px-3 lg:px-5 h-11 rounded-xl font-display font-bold text-[14px] lg:text-[15px] tracking-[-0.2px] transition-all duration-200 border-0 cursor-pointer whitespace-nowrap"
                :class="['/sentra', '/ai-agent', '/chatbot', '/orchestri', '/omnipost'].includes($route.path) || activeDropdown === 'projects'
                ? 'text-primary-500 bg-primary-500/12'
                : 'text-primary-900 bg-transparent hover:text-primary-500 hover:bg-primary-500/7'"
            >
              Projects
              <span
                  class="inline-block w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-neutral-600 transition-transform duration-300"
                  :class="activeDropdown === 'projects' ? 'rotate-180 !border-t-primary-500' : ''"
              ></span>
            </button>

            <!-- Projects Dropdown (wide grid) -->
            <Transition name="dropdown">
              <div
                  v-show="activeDropdown === 'projects'"
                  class="absolute top-full left-1/2 -translate-x-1/2 w-[520px] bg-white rounded-[0_0_20px_20px] shadow-[0_20px_60px_rgba(15,23,42,0.14)] border border-neutral-300 border-t-[3px] border-t-primary-500 p-5 grid grid-cols-2 gap-3 z-50"
              >
                <router-link
                    to="/sentra"
                    @click="activeDropdown = null"
                    class="block p-3.5 border border-neutral-300 rounded-[14px] hover:border-primary-500/30 hover:shadow-[0_8px_30px_rgba(74,144,226,0.08)] hover:-translate-y-[3px] transition-all duration-300 no-underline"
                >
                  <div class="text-[10px] font-bold uppercase tracking-[0.8px] text-primary-500 mb-1.5">Main Product</div>
                  <h4 class="font-display text-[14px] font-bold text-primary-900 mb-1 m-0">Sentra AI</h4>
                  <p class="text-[11px] text-neutral-500 m-0 leading-[1.4]">AI call center for omni-channel teams</p>
                  <!-- <p class="text-[11px] text-neutral-500 m-0 leading-[1.4]">AI call center — from Rs. 28,000/mo</p> -->
                  <div class="h-[3px] bg-neutral-200 rounded mt-2.5 overflow-hidden">
                    <span class="block h-full w-full bg-gradient-to-r from-secondary-500 via-accent-4 to-primary-500 rounded"></span>
                  </div>
                </router-link>

                <router-link
                    to="/ai-agent"
                    @click="activeDropdown = null"
                    class="block p-3.5 border border-neutral-300 rounded-[14px] hover:border-primary-500/30 hover:shadow-[0_8px_30px_rgba(74,144,226,0.08)] hover:-translate-y-[3px] transition-all duration-300 no-underline"
                >
                  <div class="text-[10px] font-bold uppercase tracking-[0.8px] text-primary-500 mb-1.5">Voice</div>
                  <h4 class="font-display text-[14px] font-bold text-primary-900 mb-1 m-0">AI Agent</h4>
                  <p class="text-[11px] text-neutral-500 m-0 leading-[1.4]">Talking voice agents for phone lines</p>
                  <!-- <p class="text-[11px] text-neutral-500 m-0 leading-[1.4]">Talking voice agents — from Rs. 45,000/mo</p> -->
                  <div class="h-[3px] bg-neutral-200 rounded mt-2.5 overflow-hidden">
                    <span class="block h-full w-[88%] bg-gradient-to-r from-secondary-500 via-accent-4 to-primary-500 rounded"></span>
                  </div>
                </router-link>

                <router-link
                    to="/chatbot"
                    @click="activeDropdown = null"
                    class="block p-3.5 border border-neutral-300 rounded-[14px] hover:border-primary-500/30 hover:shadow-[0_8px_30px_rgba(74,144,226,0.08)] hover:-translate-y-[3px] transition-all duration-300 no-underline"
                >
                  <div class="text-[10px] font-bold uppercase tracking-[0.8px] text-accent-3 mb-1.5">Chat</div>
                  <h4 class="font-display text-[14px] font-bold text-primary-900 mb-1 m-0">Chatbot</h4>
                  <p class="text-[11px] text-neutral-500 m-0 leading-[1.4]">Conversational bots for web and chat</p>
                  <!-- <p class="text-[11px] text-neutral-500 m-0 leading-[1.4]">Conversational bots — from Rs. 35,000/mo</p> -->
                  <div class="h-[3px] bg-neutral-200 rounded mt-2.5 overflow-hidden">
                    <span class="block h-full w-[94%] bg-gradient-to-r from-secondary-500 via-accent-4 to-primary-500 rounded"></span>
                  </div>
                </router-link>

                <router-link
                    to="/orchestri"
                    @click="activeDropdown = null"
                    class="block p-3.5 border border-neutral-300 rounded-[14px] hover:border-primary-500/30 hover:shadow-[0_8px_30px_rgba(74,144,226,0.08)] hover:-translate-y-[3px] transition-all duration-300 no-underline"
                >
                  <div class="text-[10px] font-bold uppercase tracking-[0.8px] text-secondary-600 mb-1.5">SDLC</div>
                  <h4 class="font-display text-[14px] font-bold text-primary-900 mb-1 m-0">Orchestri</h4>
                  <p class="text-[11px] text-neutral-500 m-0 leading-[1.4]">AI multi-agent SDLC automation</p>
                  <!-- <p class="text-[11px] text-neutral-500 m-0 leading-[1.4]">AI multi-agent SDLC — from Rs. 85,000/mo</p> -->
                  <div class="h-[3px] bg-neutral-200 rounded mt-2.5 overflow-hidden">
                    <span class="block h-full w-[76%] bg-gradient-to-r from-secondary-500 via-accent-4 to-primary-500 rounded"></span>
                  </div>
                </router-link>

                <router-link
                    to="/omnipost"
                    @click="activeDropdown = null"
                    class="block p-3.5 border border-neutral-300 rounded-[14px] hover:border-primary-500/30 hover:shadow-[0_8px_30px_rgba(74,144,226,0.08)] hover:-translate-y-[3px] transition-all duration-300 no-underline"
                >
                  <div class="text-[10px] font-bold uppercase tracking-[0.8px] text-accent-4 mb-1.5">Social</div>
                  <h4 class="font-display text-[14px] font-bold text-primary-900 mb-1 m-0">OmniPost</h4>
                  <p class="text-[11px] text-neutral-500 m-0 leading-[1.4]">AI social content platform</p>
                  <div class="h-[3px] bg-neutral-200 rounded mt-2.5 overflow-hidden">
                    <span class="block h-full w-[82%] bg-gradient-to-r from-secondary-500 via-accent-4 to-primary-500 rounded"></span>
                  </div>
                </router-link>
              </div>
            </Transition>
          </li>

          <!-- Careers -->
          <li class="h-full flex items-center">
            <router-link
                to="/careers"
                @click="closeMobileMenu"
                class="flex items-center px-3 lg:px-5 h-11 rounded-xl font-display font-bold text-[14px] lg:text-[15px] tracking-[-0.2px] transition-all duration-200 no-underline"
                :class="$route.path === '/careers' ? 'text-primary-500 bg-primary-500/12' : 'text-primary-900 hover:text-primary-500 hover:bg-primary-500/7'"
            >
              Careers
            </router-link>
          </li>

          <!-- Contact -->
          <li class="h-full flex items-center">
            <router-link
                to="/contact"
                @click="closeMobileMenu"
                class="flex items-center px-3 lg:px-5 h-11 rounded-xl font-display font-bold text-[14px] lg:text-[15px] tracking-[-0.2px] transition-all duration-200 no-underline"
                :class="$route.path === '/contact' ? 'text-primary-500 bg-primary-500/12' : 'text-primary-900 hover:text-primary-500 hover:bg-primary-500/7'"
            >
              Contact
            </router-link>
          </li>
        </ul>
      </div>

      <!-- ===== DESKTOP RIGHT BUTTONS ===== -->
      <!-- ===== DESKTOP RIGHT BUTTONS ===== -->
      <div class="hidden md:flex items-center gap-2 lg:gap-3 shrink-0 z-[2]">

        <!-- If Logged In: Show Dashboard Button -->
        <router-link
            v-if="isLoggedIn"
            to="/admin/overview"
            @click="closeMobileMenu"
            class="px-4 lg:px-5 py-2.5 border border-primary-500 bg-primary-500/5 text-[13px] lg:text-[14px] font-display font-bold rounded-full text-primary-500 hover:bg-primary-500/10 transition-all duration-200 no-underline"
        >
          Dashboard
        </router-link>

        <!-- If Not Logged In: Show Login Button -->
        <router-link
            v-else
            to="/login"
            @click="closeMobileMenu"
            class="px-4 lg:px-5 py-2.5 border border-neutral-300 text-[13px] lg:text-[14px] font-display font-bold rounded-full text-primary-900 hover:border-primary-500 hover:text-primary-500 hover:bg-primary-500/5 transition-all duration-200 no-underline"
        >
          Login
        </router-link>

        <ShineButton to="/contact" shape="pill" @click="closeMobileMenu">Get Quote</ShineButton>
      </div>

      <!-- ===== HAMBURGER ===== -->
      <button
          @click.stop="toggleMobileMenu"
          class="flex flex-col gap-[5px] md:hidden w-10 h-10 justify-center items-end bg-transparent border-0 p-2 cursor-pointer z-50 focus:outline-none"
          aria-label="Toggle Navigation Menu"
          type="button"
          :aria-expanded="isMobileMenuOpen"
      >
        <span
            class="h-0.5 bg-primary-900 rounded-full transition-all duration-300"
            :class="isMobileMenuOpen ? 'w-6 rotate-45 translate-y-[7px]' : 'w-6'"
        ></span>
        <span
            class="h-0.5 bg-primary-900 rounded-full transition-all duration-300"
            :class="isMobileMenuOpen ? 'w-0 opacity-0' : 'w-[18px]'"
            style="margin-left: auto;"
        ></span>
        <span
            class="h-0.5 bg-primary-900 rounded-full transition-all duration-300"
            :class="isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-[7px]' : 'w-[22px]'"
            style="margin-left: auto;"
        ></span>
      </button>
    </header>

    <!-- ===== MOBILE DRAWER ===== -->
    <nav
        class="fixed top-0 right-0 bottom-0 flex flex-col z-[1002] md:hidden overflow-hidden"
        style="width: min(320px, 88vw); box-shadow: -16px 0 48px rgba(15,23,42,0.35); background: linear-gradient(165deg, #152a45 0%, #1E3A5F 28%, #2A5F9E 62%, #4A90E2 100%); transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s;"
        :style="isMobileMenuOpen ? 'transform: translateX(0); visibility: visible;' : 'transform: translateX(100%); visibility: hidden;'"
        :aria-hidden="!isMobileMenuOpen"
    >
      <!-- Glow overlays -->
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 90% 8%, rgba(255,213,180,0.22) 0%, transparent 42%), radial-gradient(circle at 10% 92%, rgba(143,185,244,0.2) 0%, transparent 45%);"></div>

      <!-- Drawer Head -->
      <div class="relative z-[2] flex items-center justify-between gap-3 px-4 pb-3.5 border-b border-white/12 shrink-0" style="padding-top: max(18px, env(safe-area-inset-top));">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center font-display font-extrabold text-[13px] text-primary-900 shrink-0" style="background: linear-gradient(135deg, #FFD5B4, #8FB9F4); box-shadow: 0 6px 16px rgba(0,0,0,0.2);">RS</div>
          <div>
            <strong class="block font-display text-[14px] font-extrabold text-white">Rasant Solutions</strong>
            <span class="block text-[10px] text-white/72 mt-0.5">Menu</span>
          </div>
        </div>
        <button
            type="button"
            @click="closeMobileMenu"
            class="w-10 h-10 rounded-full border border-white/28 bg-white/14 text-white text-[28px] leading-none flex items-center justify-center shrink-0 hover:bg-white/24 hover:scale-105 transition-all duration-200 cursor-pointer"
            aria-label="Close menu"
        >×</button>
      </div>

      <!-- Drawer Body -->
      <div class="relative z-[2] flex-1 overflow-y-auto px-3 py-3" style="-webkit-overflow-scrolling: touch;">
        <!-- Services -->
        <button
            type="button"
            @click="activeDropdown = activeDropdown === 'services' ? null : 'services'"
            class="flex items-center gap-3 text-white font-display font-bold text-[15px] p-3 mb-2 rounded-[14px] border border-white/10 bg-white/7 hover:bg-white/16 hover:translate-x-1 transition-all duration-200 w-full text-left"
        >
          <span class="w-8 h-8 rounded-[10px] bg-white/12 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-code text-base"></i>
          </span>
          Services
        </button>
        <div v-show="activeDropdown === 'services'" class="ml-2 mb-2.5 pl-3 border-l-2 border-white/20 py-1 transition-all duration-300">
          <button @click="navigateToServicesSection('services')" class="block text-white/82 text-[13px] py-2 w-full text-left hover:text-white transition-colors duration-150 bg-transparent border-0 cursor-pointer">Custom Software</button>
          <button @click="navigateToServicesSection('services')" class="block text-white/82 text-[13px] py-2 w-full text-left hover:text-white transition-colors duration-150 bg-transparent border-0 cursor-pointer">Web Applications</button>
          <button @click="navigateToServicesSection('services')" class="block text-white/82 text-[13px] py-2 w-full text-left hover:text-white transition-colors duration-150 bg-transparent border-0 cursor-pointer">WordPress &amp; CMS</button>
        </div>

        <!-- Projects -->
        <button
            type="button"
            @click="activeDropdown = activeDropdown === 'projects' ? null : 'projects'"
            class="flex items-center gap-3 text-white font-display font-bold text-[15px] p-3 mb-2 rounded-[14px] border border-white/10 bg-white/7 hover:bg-white/16 hover:translate-x-1 transition-all duration-200 w-full text-left"
        >
          <span class="w-8 h-8 rounded-[10px] bg-white/12 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-rocket text-base"></i>
          </span>
          Projects
          <span class="ml-auto text-white/60">
            <i class="fa-solid" :class="activeDropdown === 'projects' ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
          </span>
        </button>
        <div v-show="activeDropdown === 'projects'" class="ml-2 mb-2.5 pl-3 border-l-2 border-white/20 py-1 transition-all duration-300">
          <router-link to="/sentra" @click="closeMobileMenu" class="block text-white/82 text-[13px] py-2 hover:text-white transition-colors no-underline">Sentra AI</router-link>
          <router-link to="/ai-agent" @click="closeMobileMenu" class="block text-white/82 text-[13px] py-2 hover:text-white transition-colors no-underline">AI Agent</router-link>
          <router-link to="/chatbot" @click="closeMobileMenu" class="block text-white/82 text-[13px] py-2 hover:text-white transition-colors no-underline">Chatbot</router-link>
          <router-link to="/orchestri" @click="closeMobileMenu" class="block text-white/82 text-[13px] py-2 hover:text-white transition-colors no-underline">Orchestri</router-link>
          <router-link to="/omnipost" @click="closeMobileMenu" class="block text-white/82 text-[13px] py-2 hover:text-white transition-colors no-underline">OmniPost</router-link>
        </div>

        <!-- Careers -->
        <router-link
            to="/careers"
            @click="closeMobileMenu"
            class="flex items-center gap-3 text-white font-display font-bold text-[15px] p-3 mb-2 rounded-[14px] border border-white/10 bg-white/7 hover:bg-white/16 hover:translate-x-1 transition-all duration-200 no-underline"
        >
          <span class="w-8 h-8 rounded-[10px] bg-white/12 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-briefcase text-base"></i>
          </span>
          Careers
        </router-link>

        <!-- Contact -->
        <router-link
            to="/contact"
            @click="closeMobileMenu"
            class="flex items-center gap-3 text-white font-display font-bold text-[15px] p-3 mb-2 rounded-[14px] border border-white/10 bg-white/7 hover:bg-white/16 hover:translate-x-1 transition-all duration-200 no-underline"
        >
          <span class="w-8 h-8 rounded-[10px] bg-white/12 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-envelope text-base"></i>
          </span>
          Contact
        </router-link>
      </div>

      <!-- Drawer Footer -->
      <div
          class="relative z-[2] shrink-0 px-4 flex flex-col gap-2.5 border-t border-white/12"
          style="padding-top: 14px; padding-bottom: max(18px, env(safe-area-inset-top)); background: rgba(8,18,36,0.28);"
      >
        <!-- If Logged In: Show Mobile Dashboard Button -->
        <router-link
            v-if="isLoggedIn"
            to="/admin/overview"
            @click="closeMobileMenu"
            class="w-full text-center py-3.5 rounded-xl font-display font-bold text-[14px] text-white no-underline transition-all duration-200 bg-primary-600 hover:bg-primary-500"
        >
          Dashboard
        </router-link>

        <!-- If Not Logged In: Show Mobile Login Button -->
        <router-link
            v-else
            to="/login"
            @click="closeMobileMenu"
            class="w-full text-center py-3.5 rounded-xl font-display font-bold text-[14px] text-white no-underline transition-all duration-200 bg-secondary-900 hover:bg-secondary-800"
        >
          Login
        </router-link>

        <router-link
            to="/contact"
            @click="closeMobileMenu"
            class="w-full text-center py-3.5 rounded-xl font-display font-bold text-[14px] text-white border border-white/35 bg-white/10 hover:bg-white/20 no-underline transition-all duration-200"
        >
          Get a Free Quote
        </router-link>
      </div>
    </nav>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import ShineButton from '@/components/ShineButton.vue';
// 1. Import your login store
import { useLoginStore } from '../stores/loginStore.js';

const router = useRouter();
const route = useRoute();

// 2. Initialize the store instance
const loginStore = useLoginStore();

// 3. Keep a clean reactive reference to your auth status
const isLoggedIn = computed(() => loginStore.isAuthenticated);

const activeDropdown = ref(null);
const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 60;
};

const handleLogoClick = (event) => {
  const currentPath = router.currentRoute.value.path;
  if (currentPath === '/' || currentPath === '/home') {
    event.preventDefault();
    window.location.reload();
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : '';
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';
  activeDropdown.value = null;
};

const navigateToServicesSection = (sectionId = 'services') => {
  closeMobileMenu();
  activeDropdown.value = null;

  const currentPath = router.currentRoute.value.path;
  if (currentPath === '/' || currentPath === '/home') {
    router.push({ hash: `#${sectionId}` });
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    router.push({ path: '/', hash: `#${sectionId}` }).then(() => {
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    });
  }
};
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}
</style>