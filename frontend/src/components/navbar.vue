<template>
  <div class="relative w-full z-50">
    <!-- Mobile Menu Backdrop -->
    <div
        v-if="isMobileMenuOpen"
        @click="closeMobileMenu"
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 z-40 md:hidden"
    ></div>

    <!-- Global Desktop Dropdown Backdrop Mask -->
    <div
        v-if="activeDropdown"
        class="fixed inset-0 bg-slate-900/55 backdrop-blur-[5px] transition-all duration-300 pointer-events-none hidden md:block z-30"
    ></div>

    <header class="fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-200/80 shadow-sm flex items-center justify-between px-6 md:px-12 z-50 transition-all duration-300">
      <router-link to="/home" class="flex items-center shrink-0 group" aria-label="Rasant Solutions home">
        <img
            src="../assets/images/rasant-logo.png"
            alt="Rasant Solutions Logo"
            class="h-10.5 w-auto transition-transform duration-200 group-hover:scale-[1.01]"
            decoding="async"
        />
      </router-link>

      <div class="hidden md:flex items-center h-full relative">
        <ul class="flex items-center gap-8 h-full m-0 p-0 list-none">

          <li
              class="relative h-full flex items-center group/nav"
              @mouseenter="activeDropdown = 'services'"
              @mouseleave="activeDropdown = null"
          >
            <button type="button" class="flex items-center gap-1.5 font-medium text-[15px] text-slate-700 hover:text-blue-600 transition-colors duration-200 h-full cursor-pointer bg-transparent border-0">
              Services
              <i class="fa-solid fa-chevron-down text-[11px] transition-transform duration-200 group-hover/nav:rotate-180"></i>
            </button>

            <div
                class="absolute top-20 left-1/2 -translate-x-1/2 w-85 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 flex flex-col gap-1 transition-all duration-200 origin-top z-50"
                :class="[activeDropdown === 'services' ? 'opacity-100 scale-100 pointer-events-auto visible' : 'opacity-0 scale-[0.97] pointer-events-none invisible']"
            >
              <div class="absolute top-0 inset-x-0 h-0.75 rounded-t-2xl bg-linear-to-r from-orange-300 via-pink-400 to-blue-400"></div>

              <!-- 👇 UPDATED: navigateToServicesSection with section ID -->
              <button
                  @click="navigateToServicesSection('services')"
                  class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group/item transition-colors duration-200 w-full text-left"
              >
                <div class="flex items-center cursor-pointer gap-3.5">
                  <div class="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-lg shadow-sm border border-purple-100/40"><font-awesome-icon :icon="['fas', 'gear']" /></div>
                  <div>
                    <h4 class="font-bold text-[14px] text-slate-800  m-0">Custom Software</h4>
                    <p class="text-[12px] text-slate-500 font-normal m-0">Enterprise apps &amp; APIs</p>
                  </div>
                </div>
                <span class="text-slate-400 font-medium -translate-x-1 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all duration-200">→</span>
              </button>

              <button
                  @click="navigateToServicesSection('services')"
                  class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group/item transition-colors duration-200 w-full text-left"
              >
                <div class="flex items-center gap-3.5">
                  <div class="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-lg shadow-sm border border-indigo-100/40"><font-awesome-icon :icon="['fas', 'mobile-screen']" /></div>
                  <div>
                    <h4 class="font-bold text-[14px] text-slate-800 m-0">Web &amp; Mobile</h4>
                    <p class="text-[12px] text-slate-500 font-normal m-0">React, Flutter &amp; Next.js</p>
                  </div>
                </div>
                <span class="text-slate-400 font-medium -translate-x-1 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all duration-200"><font-awesome-icon :icon="['fas', 'arrow-right']" /></span>
              </button>

              <button
                  @click="navigateToServicesSection('services')"
                  class="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group/item transition-colors duration-200 w-full text-left"
              >
                <div class="flex items-center gap-3.5">
                  <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-lg shadow-sm border border-blue-100/40"><font-awesome-icon :icon="['fas', 'cloud']" />️</div>
                  <div>
                    <h4 class="font-bold text-[14px] text-slate-800 m-0">Cloud &amp; DevOps</h4>
                    <p class="text-[12px] text-slate-500 font-normal m-0">AWS &amp; Kubernetes</p>
                  </div>
                </div>
                <span class="text-slate-400 font-medium -translate-x-1 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all duration-200">→</span>
              </button>
            </div>
          </li>

          <!-- Projects Dropdown -->
          <li
              class="relative h-full flex items-center group/nav"
              @mouseenter="activeDropdown = 'projects'"
              @mouseleave="activeDropdown = null"
          >
            <button type="button" class="flex items-center gap-1.5 font-medium text-[15px] text-slate-700 hover:text-blue-600 transition-colors duration-200 h-full cursor-pointer bg-transparent border-0">
              Projects
              <i class="fa-solid fa-chevron-down text-[11px] transition-transform duration-200 group-hover/nav:rotate-180"></i>
            </button>

            <div
                class="absolute top-20 left-1/2 -translate-x-1/2 w-115 bg-white border border-slate-100 rounded-2xl shadow-xl p-5 grid grid-cols-2 gap-3 transition-all duration-200 origin-top z-50"
                :class="[activeDropdown === 'projects' ? 'opacity-100 scale-100 pointer-events-auto visible' : 'opacity-0 scale-[0.97] pointer-events-none invisible']"
            >
              <div class="absolute top-0 inset-x-0 h-0.75 rounded-t-2xl bg-linear-to-r from-orange-300 via-pink-400 to-blue-400"></div>

              <router-link
                  to="/sentra"
                  @click="closeMobileMenu"
                  class="block p-4 border border-slate-100 rounded-xl hover:border-blue-500/30 hover:bg-slate-50/50 transition-all duration-200"
              >
                <div class="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded mb-1.5">Voice</div>
                <h4 class="font-bold text-[15px] text-slate-800 mb-0.5">Sentra AI</h4>
                <p class="text-[12px] text-slate-500 font-normal">AI call center platform</p>
              </router-link>

              <router-link
                  to="/ai-agent"
                  @click="closeMobileMenu"
                  class="block p-4 border border-slate-100 rounded-xl hover:border-blue-500/30 hover:bg-slate-50/50 transition-all duration-200"
              >
                <div class="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded mb-1.5">Voice</div>
                <h4 class="font-bold text-[15px] text-slate-800 mb-0.5">AI Agent</h4>
                <p class="text-[12px] text-slate-500 font-normal">Talking voice agents</p>
              </router-link>

              <router-link to="/chatbot" @click="closeMobileMenu" class="block p-4 border border-slate-100 rounded-xl hover:border-blue-500/30 hover:bg-slate-50/50 transition-all duration-200">
                <div class="inline-block text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded mb-1.5">Chat</div>
                <h4 class="font-bold text-[15px] text-slate-800 mb-0.5">Chatbot</h4>
                <p class="text-[12px] text-slate-500 font-normal">Text and messaging bots</p>
              </router-link>

              <router-link to="/orchestri" @click="closeMobileMenu" class="block p-4 border border-slate-100 rounded-xl hover:border-blue-500/30 hover:bg-slate-50/50 transition-all duration-200">
                <div class="inline-block text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded mb-1.5">SDLC</div>
                <h4 class="font-bold text-[15px] text-slate-800 mb-0.5">Orchestri</h4>
                <p class="text-[12px] text-slate-500 font-normal">AI multi-agent dev workflow</p>
              </router-link>
            </div>
          </li>

          <li class="h-full flex items-center">
            <router-link to="/careers" @click="closeMobileMenu" class="font-medium text-[15px] text-slate-700 hover:text-blue-600 transition-colors duration-200">Careers</router-link>
          </li>

          <li class="h-full flex items-center">
            <router-link to="/contact" @click="closeMobileMenu" class="font-medium text-[15px] text-slate-700 hover:text-blue-600 transition-colors duration-200">Contact</router-link>
          </li>
        </ul>
      </div>

      <div class="hidden md:flex items-center gap-4">
        <router-link to="/login" @click="closeMobileMenu" class="px-5 py-2.5 border border-blue-400/30 text-[14px] font-semibold rounded-full text-blue-900 hover:bg-blue-50 transition-all duration-200 shadow-sm">
          Login
        </router-link>
        <router-link
            to="/contact"
            @click="closeMobileMenu"
            class="bg-orange-700 hover:bg-orange-900 relative overflow-hidden px-6 py-2.5 text-[14px] font-semibold text-white rounded-full transition-all duration-200 shadow-[0_0_25px_rgba(74,144,226,0.45)] active:scale-[0.98] cursor-pointer flex items-center justify-center"
        >
          Get Quote
          <div class="absolute inset-0 w-1/4 h-full bg-white/10 pointer-events-none animate-shine-loop"></div>
        </router-link>
      </div>

      <button
          @click.stop="toggleMobileMenu"
          class="flex flex-col gap-1.5 md:hidden w-8 h-8 justify-center items-end group p-1 z-50 focus:outline-none"
          aria-label="Toggle Navigation Control Drawer Menu"
          type="button"
      >
        <span class="h-0.5 bg-slate-800 rounded-full transition-all duration-300" :class="[isMobileMenuOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6']"></span>
        <span class="h-0.5 bg-slate-800 rounded-full transition-all duration-300" :class="[isMobileMenuOpen ? 'w-0 opacity-0' : 'w-4 group-hover:w-6']"></span>
        <span class="h-0.5 bg-slate-800 rounded-full transition-all duration-300" :class="[isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5 group-hover:w-6']"></span>
      </button>
    </header>

    <!-- Mobile Menu -->
    <nav
        class="fixed top-0 right-0 bottom-0 w-70 bg-white border-l border-slate-100 shadow-2xl pt-24 px-6 flex flex-col gap-4 transform transition-transform duration-300 ease-out z-40 md:hidden"
        :class="[isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full']"
    >
      <button @click="navigateToServicesSection('services')" class="text-[16px] font-semibold text-slate-700 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-50 transition-all text-left">Services</button>
      <router-link to="/#products" @click="closeMobileMenu" class="text-[16px] font-semibold text-slate-700 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-50 transition-all">Projects</router-link>
      <router-link to="/contact" @click="closeMobileMenu" class="text-[16px] font-semibold text-slate-700 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-50 transition-all">Contact</router-link>

      <router-link
          to="/login"
          @click="closeMobileMenu"
          class="block text-[16px] font-semibold text-blue-900 bg-blue-50/60 p-2 rounded-lg transition-all cursor-pointer text-left w-full sm:w-auto"
      >
        Login
      </router-link>

      <router-link to="/contact" @click="closeMobileMenu" class="mt-4 text-center px-5 py-3 bg-blue-600 text-[14px] font-bold text-white rounded-xl shadow-lg shadow-blue-100 transition-all">
        Get a Free Quote
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeDropdown = ref(null);
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// ✅ Updated: Services section navigation with proper scrolling
const navigateToServicesSection = (sectionId = 'services') => {
  closeMobileMenu();
  activeDropdown.value = null;

  const currentPath = router.currentRoute.value.path;

  if (currentPath === '/' || currentPath === '/home') {
    // Already on home page, just scroll to section
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    // Navigate to home page with hash, then scroll after navigation
    router.push('/').then(() => {
      // Wait for DOM to update
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    });
  }
};

// ✅ Navigation method for services (deprecated - use navigateToServicesSection)
const navigateToServices = (event) => {
  event?.preventDefault();
  navigateToServicesSection('services');
};
</script>

<style scoped>
@keyframes shine-loop {
  0% {
    transform: translateX(-100%) skewX(-15deg);
  }
  100% {
    transform: translateX(400%) skewX(-15deg);
  }
}

.animate-shine-loop {
  animation: shine-loop 3s ease-in-out infinite;
}
</style>