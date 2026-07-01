<!-- AdminSidebar.vue -->
<template>
  <div>
    <!-- Mobile menu button -->
    <div class="md:hidden fixed top-3 left-3 z-50">
      <button
          @click="isSidebarOpen = true"
          class="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg hover:bg-[#1546B8] transition-colors focus:outline-none cursor-pointer"
          aria-label="Open Sidebar"
      >
        <font-awesome-icon icon="fa-solid fa-bars" class="text-lg" />
      </button>
    </div>

    <!-- Overlay for mobile -->
    <div
        v-if="isSidebarOpen"
        @click="isSidebarOpen = false"
        class="fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-[2px] md:hidden transition-opacity"
    ></div>

    <!-- Sidebar -->
    <aside
        class="fixed inset-y-0 left-0 z-40 w-64 h-screen bg-[#F4F7FE] flex flex-col justify-between border-r border-gray-200 font-sans select-none shrink-0 transform md:transform-none md:static transition-transform duration-300 ease-in-out overflow-hidden"
        :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <div class="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-track-[#F4F7FE] scrollbar-thumb-[#5E5CE6] hover:scrollbar-thumb-[#4A48C6] scrollbar-thumb-rounded-full">

        <!-- Logo -->
        <div class="flex items-center justify-between mb-6 px-2">
          <router-link to="/" @click="isSidebarOpen = false" class="cursor-pointer transition-opacity hover:opacity-90 mx-auto md:mx-0">
            <img src="../assets/images/rasant-logo.png" alt="Rasant Solutions" class="h-11 object-contain" />
          </router-link>
          <button
              @click="isSidebarOpen = false"
              class="md:hidden text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="text-lg" />
          </button>
        </div>

        <!-- Role Badge -->
        <div class="mb-4">
          <div class="bg-[#E2ECF9] text-[#1B55E2] font-bold text-xs tracking-wider text-center py-2 px-4 rounded-xl uppercase">
            {{ userRole }}
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-10">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#1B55E2] border-t-transparent"></div>
          <p class="text-sm text-gray-500 mt-2">Loading menu...</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="text-center py-10">
          <p class="text-red-500 text-sm">{{ error }}</p>
          <button @click="loadModules" class="mt-2 text-blue-500 hover:underline text-sm">
            Retry
          </button>
        </div>

        <!-- Navigation -->
        <nav v-if="!loading && !error" class="space-y-3">
          <!-- Company Section -->
          <div>
            <p class="text-[11px] font-bold text-gray-400 tracking-widest px-3 mb-1 uppercase">Company</p>
            <div class="space-y-0.5">
              <!-- Dynamic Company Modules -->
              <template v-for="module in companyModules" :key="module.id">
                <!-- Regular module -->
                <router-link
                    v-if="!module.children"
                    :to="getModuleRoute(module.name)"
                    @click="isSidebarOpen = false"
                    class="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all"
                    :class="{'bg-[#E2ECF9] text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]': isActive(module.name, $route.path)}"
                >
                  <font-awesome-icon :icon="module.icon" class="text-lg w-5" />
                  <span>{{ module.name }}</span>
                </router-link>

                <!-- Module with dropdown (Employees) -->
                <div v-else>
                  <button
                      @click="toggleDropdown(module.name)"
                      class="w-full flex items-center justify-between px-4 py-2 cursor-pointer rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all focus:outline-none"
                      :class="{'bg-white text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]': isActive(module.name, $route.path)}"
                  >
                    <div class="flex items-center space-x-3">
                      <font-awesome-icon :icon="module.icon" class="text-lg w-5" />
                      <span>{{ module.name }}</span>
                    </div>
                    <font-awesome-icon :icon="dropdownStates[module.name] ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'" class="text-xs transition-transform duration-200" />
                  </button>

                  <div v-show="dropdownStates[module.name]" class="mt-0.5 ml-6 pl-4 border-l border-gray-300 space-y-0.5">
                    <router-link
                        v-for="child in module.children"
                        :key="child.id"
                        :to="getModuleRoute(child.name)"
                        @click="isSidebarOpen = false"
                        class="block px-4 py-1.5 text-sm text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] rounded-lg transition-all"
                        :class="{'bg-white/80 text-[#1B55E2] font-semibold shadow-xs': isActive(child.name, $route.path)}"
                    >
                      {{ child.name }}
                    </router-link>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Projects Section -->
          <div>
            <p class="text-[11px] font-bold text-gray-400 tracking-widest px-3 mb-1 uppercase">Projects</p>
            <div class="space-y-0.5">
              <router-link
                  v-for="module in projectModules"
                  :key="module.id"
                  :to="getModuleRoute(module.name)"
                  @click="isSidebarOpen = false"
                  class="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all"
                  :class="{'bg-[#E2ECF9] text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]': isActive(module.name, $route.path)}"
              >
                <font-awesome-icon :icon="module.icon" class="text-lg w-5" />
                <span>{{ module.name }}</span>
              </router-link>
            </div>
          </div>
        </nav>
      </div>

      <!-- Account Section -->
      <div class="p-4 border-t border-gray-200/60 bg-[#F4F7FE] shrink-0">
        <p class="text-[11px] font-bold text-gray-400 tracking-widest px-3 mb-1 uppercase">Account</p>
        <router-link
            v-for="module in accountModules"
            :key="module.id"
            :to="getModuleRoute(module.name)"
            @click="isSidebarOpen = false"
            class="flex items-center space-x-3 px-4 py-2 rounded-xl text-gray-500 hover:bg-[#E2ECF9] hover:text-[#1B55E2] font-medium transition-all"
            :class="{'bg-white text-[#1B55E2] font-semibold shadow-sm border-l-4 border-[#1B55E2]': isActive(module.name, $route.path)}"
        >
          <font-awesome-icon :icon="module.icon" class="text-lg w-5" />
          <span>{{ module.name }}</span>
        </router-link>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAdminSidebar } from '../composables/Admin/useAdminsidebar.js';

// Sidebar state
const isSidebarOpen = ref(false);

// Use the sidebar composable
const {
  loading,
  error,
  dropdownStates,
  loadModules,
  companyModules,
  projectModules,
  accountModules,
  toggleDropdown,
  getModuleRoute,
  isActive,
  getUserRole
} = useAdminSidebar();

// Get user role
const userRole = getUserRole();
</script>