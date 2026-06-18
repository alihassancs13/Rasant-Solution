<template>
  <div class="relative w-full z-50">

    <!-- Mobile Backdrop -->
    <div
        v-if="isMobileMenuOpen"
        @click="closeMobileMenu"
        class="fixed inset-0 bg-slate-900/45 backdrop-blur-[4px] transition-opacity duration-400 z-40 md:hidden"
    ></div>

    <!-- Desktop Dropdown Backdrop -->
    <Transition name="backdrop-fade">
      <div
          v-if="activeDropdown"
          class="fixed inset-0 bg-slate-900/45 backdrop-blur-[4px] pointer-events-none hidden md:block z-30"
      ></div>
    </Transition>

    <!-- ===== HEADER ===== -->
    <header
        id="navbar"
        class="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 md:px-12 z-50 transition-all duration-[450ms]"
        :class="[
        isScrolled || isMobileMenuOpen
          ? 'bg-white/96 shadow-[0_4px_30px_rgba(15,23,42,0.08)] backdrop-blur-[16px]'
          : 'bg-white/45 backdrop-blur-[12px]'
      ]"
    >

      <!-- Logo -->
      <router-link to="/home" class="flex items-center shrink-0 z-[2]" aria-label="Rasant Solutions home">
        <img
            src="../assets/images/rasant-logo.png"
            alt="Rasant Solutions Logo"
            class="h-[42px] w-auto transition-opacity duration-200 hover:opacity-86"
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
                class="flex items-center gap-1.5 px-5 h-11 rounded-xl font-['Space_Grotesk'] font-bold text-[15px] tracking-[-0.2px] transition-all duration-200 bg-transparent border-0 cursor-pointer whitespace-nowrap"
                :class="activeDropdown === 'services' ? 'text-blue-600 bg-blue-600/10' : 'text-[#1E3A5F] hover:text-blue-600 hover:bg-blue-600/7'"
            >
              Services
              <span
                  class="inline-block w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#64748B] transition-transform duration-300"
                  :class="activeDropdown === 'services' ? 'rotate-180 !border-t-blue-600' : ''"
              ></span>
            </button>

            <!-- Services Dropdown -->
            <Transition name="dropdown">
              <div
                  v-show="activeDropdown === 'services'"
                  class="absolute top-[calc(100%+2px)] left-1/2 -translate-x-1/2 w-[280px] bg-white rounded-[0_0_20px_20px] shadow-[0_20px_60px_rgba(15,23,42,0.14)] border border-[#E2E8F0] border-t-[3px] border-t-blue-500 pt-3 pb-4 px-2.5 z-50"
              >
                <button
                    @click="navigateToServicesSection('services')"
                    class="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 hover:translate-x-1 group/item transition-all duration-200 w-full text-left relative overflow-hidden"
                >
                  <div class="w-10 h-10 rounded-[10px] bg-blue-600/10 flex items-center justify-center text-[18px] shrink-0">
                    <i class="fa-solid fa-code text-blue-600"></i>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-[14px] font-['Space_Grotesk'] font-bold text-[#1E3A5F] mb-[3px] m-0">Custom Software</h4>
                    <p class="text-[12px] text-slate-500 m-0 leading-[1.45]">Enterprise apps, APIs &amp; AI integration</p>
                  </div>
                  <span class="text-blue-500 font-bold opacity-0 -translate-x-3 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 mt-2.5">→</span>
                </button>

                <button
                    @click="navigateToServicesSection('services')"
                    class="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 hover:translate-x-1 group/item transition-all duration-200 w-full text-left relative overflow-hidden"
                >
                  <div class="w-10 h-10 rounded-[10px] bg-sky-500/10 flex items-center justify-center text-[18px] shrink-0">
                    <i class="fa-solid fa-mobile-screen-button text-sky-500"></i>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-[14px] font-['Space_Grotesk'] font-bold text-[#1E3A5F] mb-[3px] m-0">Web &amp; Mobile</h4>
                    <p class="text-[12px] text-slate-500 m-0 leading-[1.45]">React, Flutter &amp; Next.js products</p>
                  </div>
                  <span class="text-blue-500 font-bold opacity-0 -translate-x-3 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 mt-2.5">→</span>
                </button>

                <button
                    @click="navigateToServicesSection('services')"
                    class="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 hover:translate-x-1 group/item transition-all duration-200 w-full text-left relative overflow-hidden"
                >
                  <div class="w-10 h-10 rounded-[10px] bg-blue-400/10 flex items-center justify-center text-[18px] shrink-0">
                    <i class="fa-solid fa-cloud text-blue-400"></i>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-[14px] font-['Space_Grotesk'] font-bold text-[#1E3A5F] mb-[3px] m-0">Cloud &amp; DevOps</h4>
                    <p class="text-[12px] text-slate-500 m-0 leading-[1.45]">AWS, Kubernetes &amp; CI/CD pipelines</p>
                  </div>
                  <span class="text-blue-500 font-bold opacity-0 -translate-x-3 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 mt-2.5">→</span>
                </button>
              </div>
            </Transition>
          </li>

          <!-- Projects -->
          <li
              class="relative h-full flex items-center"
              @mouseenter="activeDropdown = 'projects'"
              @mouseleave="activeDropdown = null"
          >
            <button
                type="button"
                class="flex items-center gap-1.5 px-5 h-11 rounded-xl font-['Space_Grotesk'] font-bold text-[15px] tracking-[-0.2px] transition-all duration-200 bg-transparent border-0 cursor-pointer whitespace-nowrap"
                :class="activeDropdown === 'projects' ? 'text-blue-600 bg-blue-600/10' : 'text-[#1E3A5F] hover:text-blue-600 hover:bg-blue-600/7'"
            >
              Projects
              <span
                  class="inline-block w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#64748B] transition-transform duration-300"
                  :class="activeDropdown === 'projects' ? 'rotate-180 !border-t-blue-600' : ''"
              ></span>
            </button>

            <!-- Projects Dropdown (wide grid) -->
            <Transition name="dropdown">
              <div
                  v-show="activeDropdown === 'projects'"
                  class="absolute top-[calc(100%+2px)] left-1/2 -translate-x-1/2 w-[520px] bg-white rounded-[0_0_20px_20px] shadow-[0_20px_60px_rgba(15,23,42,0.14)] border border-[#E2E8F0] border-t-[3px] border-t-blue-500 p-5 grid grid-cols-2 gap-3 z-50"
              >
                <router-link
                    to="/sentra"
                    @click="activeDropdown = null"
                    class="block p-3.5 border border-[#E2E8F0] rounded-[14px] hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(74,144,226,0.08)] hover:-translate-y-[3px] transition-all duration-300 no-underline"
                >
                  <div class="text-[10px] font-bold uppercase tracking-[0.8px] text-blue-600 mb-1.5">Main Product</div>
                  <h4 class="font-['Space_Grotesk'] text-[14px] font-bold text-[#1E3A5F] mb-1 m-0">Sentra AI</h4>
                  <p class="text-[11px] text-slate-500 m-0 leading-[1.4]">AI call center — from Rs. 28,000/mo</p>
                  <div class="h-[3px] bg-[#F1F5F9] rounded mt-2.5 overflow-hidden">
                    <span class="block h-full w-full bg-gradient-to-r from-[#C96E3A] via-[#B0457A] to-[#3B73C4] rounded"></span>
                  </div>
                </router-link>

                <router-link
                    to="/ai-agent"
                    @click="activeDropdown = null"
                    class="block p-3.5 border border-[#E2E8F0] rounded-[14px] hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(74,144,226,0.08)] hover:-translate-y-[3px] transition-all duration-300 no-underline"
                >
                  <div class="text-[10px] font-bold uppercase tracking-[0.8px] text-blue-600 mb-1.5">Voice</div>
                  <h4 class="font-['Space_Grotesk'] text-[14px] font-bold text-[#1E3A5F] mb-1 m-0">AI Agent</h4>
                  <p class="text-[11px] text-slate-500 m-0 leading-[1.4]">Talking voice agents — from Rs. 45,000/mo</p>
                  <div class="h-[3px] bg-[#F1F5F9] rounded mt-2.5 overflow-hidden">
                    <span class="block h-full w-[88%] bg-gradient-to-r from-[#C96E3A] via-[#B0457A] to-[#3B73C4] rounded"></span>
                  </div>
                </router-link>

                <router-link
                    to="/chatbot"
                    @click="activeDropdown = null"
                    class="block p-3.5 border border-[#E2E8F0] rounded-[14px] hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(74,144,226,0.08)] hover:-translate-y-[3px] transition-all duration-300 no-underline"
                >
                  <div class="text-[10px] font-bold uppercase tracking-[0.8px] text-purple-600 mb-1.5">Chat</div>
                  <h4 class="font-['Space_Grotesk'] text-[14px] font-bold text-[#1E3A5F] mb-1 m-0">Chatbot</h4>
                  <p class="text-[11px] text-slate-500 m-0 leading-[1.4]">Conversational bots — from Rs. 35,000/mo</p>
                  <div class="h-[3px] bg-[#F1F5F9] rounded mt-2.5 overflow-hidden">
                    <span class="block h-full w-[94%] bg-gradient-to-r from-[#C96E3A] via-[#B0457A] to-[#3B73C4] rounded"></span>
                  </div>
                </router-link>

                <router-link
                    to="/orchestri"
                    @click="activeDropdown = null"
                    class="block p-3.5 border border-[#E2E8F0] rounded-[14px] hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(74,144,226,0.08)] hover:-translate-y-[3px] transition-all duration-300 no-underline"
                >
                  <div class="text-[10px] font-bold uppercase tracking-[0.8px] text-orange-600 mb-1.5">SDLC</div>
                  <h4 class="font-['Space_Grotesk'] text-[14px] font-bold text-[#1E3A5F] mb-1 m-0">Orchestri</h4>
                  <p class="text-[11px] text-slate-500 m-0 leading-[1.4]">AI multi-agent SDLC — from Rs. 85,000/mo</p>
                  <div class="h-[3px] bg-[#F1F5F9] rounded mt-2.5 overflow-hidden">
                    <span class="block h-full w-[76%] bg-gradient-to-r from-[#C96E3A] via-[#B0457A] to-[#3B73C4] rounded"></span>
                  </div>
                </router-link>

                <router-link
                    to="/omnipost"
                    @click="activeDropdown = null"
                    class="block p-3.5 border border-[#E2E8F0] rounded-[14px] hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(74,144,226,0.08)] hover:-translate-y-[3px] transition-all duration-300 no-underline col-span-2"
                >
                  <div class="text-[10px] font-bold uppercase tracking-[0.8px] text-pink-600 mb-1.5">Social</div>
                  <h4 class="font-['Space_Grotesk'] text-[14px] font-bold text-[#1E3A5F] mb-1 m-0">OmniPost</h4>
                  <p class="text-[11px] text-slate-500 m-0 leading-[1.4]">AI social content platform</p>
                  <div class="h-[3px] bg-[#F1F5F9] rounded mt-2.5 overflow-hidden">
                    <span class="block h-full w-[82%] bg-gradient-to-r from-[#C96E3A] via-[#B0457A] to-[#3B73C4] rounded"></span>
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
                class="flex items-center px-5 h-11 rounded-xl font-['Space_Grotesk'] font-bold text-[15px] tracking-[-0.2px] transition-all duration-200 no-underline"
                :class="$route.path === '/careers' ? 'text-blue-600 bg-blue-600/12' : 'text-[#1E3A5F] hover:text-blue-600 hover:bg-blue-600/7'"
            >
              Careers
            </router-link>
          </li>

          <!-- Contact -->
          <li class="h-full flex items-center">
            <router-link
                to="/contact"
                @click="closeMobileMenu"
                class="flex items-center px-5 h-11 rounded-xl font-['Space_Grotesk'] font-bold text-[15px] tracking-[-0.2px] transition-all duration-200 no-underline"
                :class="$route.path === '/contact' ? 'text-blue-600 bg-blue-600/12' : 'text-[#1E3A5F] hover:text-blue-600 hover:bg-blue-600/7'"
            >
              Contact
            </router-link>
          </li>
        </ul>
      </div>

      <!-- ===== DESKTOP RIGHT BUTTONS ===== -->
      <div class="hidden md:flex items-center gap-3 shrink-0 z-[2]">
        <router-link
            to="/login"
            @click="closeMobileMenu"
            class="px-5 py-2.5 border border-[#E2E8F0] text-[14px] font-['Space_Grotesk'] font-bold rounded-[50px] text-[#1E3A5F] hover:border-blue-500 hover:text-blue-600 hover:bg-blue-600/5 transition-all duration-200 no-underline"
        >
          Login
        </router-link>

        <router-link
            to="/contact"
            @click="closeMobileMenu"
            class="relative overflow-hidden px-6 py-[11px] text-[14px] font-['Space_Grotesk'] font-bold text-white rounded-[50px] no-underline transition-all duration-200 active:scale-[0.98]"
            style="background: #C2410C; box-shadow: 0 4px 20px rgba(194,65,12,0.3); animation: ctaGlow 3s ease-in-out infinite;"
            @mouseover="$event.currentTarget.style.background = '#9A3412'"
            @mouseout="$event.currentTarget.style.background = '#C2410C'"
        >
          Get Quote
          <span class="absolute inset-0 w-2/5 h-full pointer-events-none" style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transform: skewX(-20deg); animation: btnShine 3s ease-in-out infinite;"></span>
        </router-link>
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
            class="h-0.5 bg-[#1E3A5F] rounded-full transition-all duration-300"
            :class="isMobileMenuOpen ? 'w-6 rotate-45 translate-y-[7px]' : 'w-6'"
        ></span>
        <span
            class="h-0.5 bg-[#1E3A5F] rounded-full transition-all duration-300"
            :class="isMobileMenuOpen ? 'w-0 opacity-0' : 'w-[18px]'"
            style="margin-left: auto;"
        ></span>
        <span
            class="h-0.5 bg-[#1E3A5F] rounded-full transition-all duration-300"
            :class="isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-[7px]' : 'w-[22px]'"
            style="margin-left: auto;"
        ></span>
      </button>
    </header>

    <!-- ===== MOBILE DRAWER ===== -->
    <nav
        class="fixed top-0 right-0 bottom-0 flex flex-col z-[1002] md:hidden overflow-hidden"
        style="width: min(340px, 90vw); box-shadow: -16px 0 48px rgba(15,23,42,0.35); background: linear-gradient(165deg, #152a45 0%, #1E3A5F 28%, #2A5F9E 62%, #4A90E2 100%); transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s;"
        :style="isMobileMenuOpen ? 'transform: translateX(0); visibility: visible;' : 'transform: translateX(100%); visibility: hidden;'"
        :aria-hidden="!isMobileMenuOpen"
    >
      <!-- Glow overlays -->
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(circle at 90% 8%, rgba(255,213,180,0.22) 0%, transparent 42%), radial-gradient(circle at 10% 92%, rgba(143,185,244,0.2) 0%, transparent 45%);"></div>

      <!-- Drawer Head -->
      <div class="relative z-[2] flex items-center justify-between gap-3 px-[18px] pb-3.5 border-b border-white/12 shrink-0" style="padding-top: max(18px, env(safe-area-inset-top));">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-[42px] h-[42px] rounded-xl flex items-center justify-center font-['Space_Grotesk'] font-extrabold text-[14px] text-[#1E3A5F] shrink-0" style="background: linear-gradient(135deg, #FFD5B4, #8FB9F4); box-shadow: 0 6px 16px rgba(0,0,0,0.2);">RS</div>
          <div>
            <strong class="block font-['Space_Grotesk'] text-[15px] font-extrabold text-white">Rasant Solutions</strong>
            <span class="block text-[11px] text-white/72 mt-0.5">Menu</span>
          </div>
        </div>
        <button
            type="button"
            @click="closeMobileMenu"
            class="w-11 h-11 rounded-full border border-white/28 bg-white/14 text-white text-[30px] leading-none flex items-center justify-center shrink-0 hover:bg-white/24 hover:scale-105 transition-all duration-200 cursor-pointer"
            aria-label="Close menu"
        >×</button>
      </div>

      <!-- Drawer Body -->
      <div class="relative z-[2] flex-1 overflow-y-auto px-4 py-3.5" style="-webkit-overflow-scrolling: touch;">

        <!-- Services -->
        <button
            @click="navigateToServicesSection('services')"
            class="flex items-center gap-3 w-full text-white font-['Space_Grotesk'] font-bold text-[16px] p-3.5 mb-2 rounded-[14px] border border-white/10 bg-white/7 hover:bg-white/16 hover:translate-x-1 transition-all duration-200 text-left cursor-pointer"
        >
          <span class="w-8 h-8 rounded-[10px] bg-white/12 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-gear text-base"></i>
          </span>
          Services
        </button>
        <div class="ml-3 mb-2.5 pl-3.5 border-l-2 border-white/20 py-1">
          <button @click="navigateToServicesSection('services')" class="block text-white/82 text-[13px] py-2 w-full text-left hover:text-white transition-colors duration-150 bg-transparent border-0 cursor-pointer">Custom Software</button>
          <button @click="navigateToServicesSection('services')" class="block text-white/82 text-[13px] py-2 w-full text-left hover:text-white transition-colors duration-150 bg-transparent border-0 cursor-pointer">Web &amp; Mobile</button>
          <button @click="navigateToServicesSection('services')" class="block text-white/82 text-[13px] py-2 w-full text-left hover:text-white transition-colors duration-150 bg-transparent border-0 cursor-pointer">Cloud &amp; DevOps</button>
        </div>

        <!-- Projects -->
        <router-link
            to="/#products"
            @click="closeMobileMenu"
            class="flex items-center gap-3 text-white font-['Space_Grotesk'] font-bold text-[16px] p-3.5 mb-2 rounded-[14px] border border-white/10 bg-white/7 hover:bg-white/16 hover:translate-x-1 transition-all duration-200 no-underline"
        >
          <span class="w-8 h-8 rounded-[10px] bg-white/12 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-rocket text-base"></i>
          </span>
          Projects
        </router-link>
        <div class="ml-3 mb-2.5 pl-3.5 border-l-2 border-white/20 py-1">
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
            class="flex items-center gap-3 text-white font-['Space_Grotesk'] font-bold text-[16px] p-3.5 mb-2 rounded-[14px] border border-white/10 bg-white/7 hover:bg-white/16 hover:translate-x-1 transition-all duration-200 no-underline"
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
            class="flex items-center gap-3 text-white font-['Space_Grotesk'] font-bold text-[16px] p-3.5 mb-2 rounded-[14px] border border-white/10 bg-white/7 hover:bg-white/16 hover:translate-x-1 transition-all duration-200 no-underline"
        >
          <span class="w-8 h-8 rounded-[10px] bg-white/12 flex items-center justify-center shrink-0">
            <i class="fa-solid fa-envelope text-base"></i>
          </span>
          Contact
        </router-link>
      </div>

      <!-- Drawer Footer -->
      <div
          class="relative z-[2] shrink-0 px-[18px] flex flex-col gap-2.5 border-t border-white/12"
          style="padding-top: 14px; padding-bottom: max(18px, env(safe-area-inset-bottom)); background: rgba(8,18,36,0.28);"
      >
        <router-link
            to="/login"
            @click="closeMobileMenu"
            class="w-full text-center py-3.5 rounded-xl font-['Space_Grotesk'] font-bold text-[14px] text-white no-underline transition-all duration-200"
            style="background: #C2410C;"
            @mouseover="$event.currentTarget.style.background = '#9A3412'"
            @mouseout="$event.currentTarget.style.background = '#C2410C'"
        >
          Login
        </router-link>
        <router-link
            to="/contact"
            @click="closeMobileMenu"
            class="w-full text-center py-3.5 rounded-xl font-['Space_Grotesk'] font-bold text-[14px] text-white border border-white/35 bg-white/10 hover:bg-white/20 no-underline transition-all duration-200"
        >
          Get a Free Quote
        </router-link>
      </div>
    </nav>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const activeDropdown = ref(null);
const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 60;
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
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    router.push('/').then(() => {
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    });
  }
};
</script>

<style scoped>
@keyframes ctaGlow {
  0%, 100% { box-shadow: 0 4px 20px rgba(194, 65, 12, 0.3); }
  50%       { box-shadow: 0 6px 28px rgba(194, 65, 12, 0.5), 0 0 0 4px rgba(194, 65, 12, 0.08); }
}

@keyframes btnShine {
  0%, 80%, 100% { left: -60%; }
  40%            { left: 120%; }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
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