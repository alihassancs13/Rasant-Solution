<template>
  <div class="contents">
    <!-- Overlay for mobile -->
    <div
        v-if="isSidebarOpen"
        @click="isSidebarOpen = false"
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden transition-opacity"
    ></div>

    <!-- Sidebar -->
    <aside
        class="fixed inset-y-0 left-0 z-40 h-screen bg-surface flex flex-col justify-between border-r border-border shadow-sm font-sans select-none shrink-0 transform transition-all duration-200 ease-in-out will-change-transform contain-layout md:relative md:inset-auto md:translate-x-0"
        :class="[
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      collapsed ? 'w-64 md:w-20' : 'w-64 md:w-64'
    ]"
    >
      <div class="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 scrollbar-thin scrollbar-track-surface scrollbar-thumb-primary hover:scrollbar-thumb-primary-hover scrollbar-thumb-rounded-full">

        <!-- Logo + Toggle -->
        <div
            class="mb-6 px-2"
            :class="showCollapsed ? 'flex flex-col items-center gap-3' : 'flex items-center justify-between'"
        >
          <router-link
              to="/"
              class="cursor-pointer transition-opacity hover:opacity-90 flex items-center"
              @click="handleNavigation"
          >
            <img
                v-if="!showCollapsed"
                src="../assets/images/rasant-logo.png"
                alt="Rasant Solutions"
                class="object-contain transition-all"
                :class="showCollapsed ? 'h-10 w-10' : 'h-11'"
            />
            <img
                v-else
                src="../../public/favicon.png"
                alt="Rasant Solutions"
                class="object-contain transition-all"
                :class="showCollapsed ? 'h-11 w-11' : 'h-11'"
            />
          </router-link>

          <!-- Desktop/tablet collapse toggle -->
          <button
              @click.stop="toggleCollapse"
              class="hidden md:flex w-9 h-9 items-center justify-center rounded-lg text-text-muted hover:text-primary hover:bg-primary-subtle transition-colors cursor-pointer shrink-0"
              :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          >
            <font-awesome-icon icon="fa-solid fa-bars" class="text-lg" />
          </button>

          <!-- Mobile close -->
          <button
              @click="isSidebarOpen = false"
              class="md:hidden text-text-muted hover:text-text-secondary p-1 cursor-pointer"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" class="text-lg" />
          </button>
        </div>

        <!-- Drill-down Header with Back Button -->
        <div v-if="isDrillDown" class="mb-4">
          <div class="flex items-center gap-2 bg-primary-subtle rounded-xl p-2">
            <button
                @click="handleBackClick"
                class="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors px-2 py-1 rounded-lg hover:bg-white/50"
                :class="showCollapsed ? 'justify-center w-full' : ''"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-left" class="text-sm" />
              <!-- 🔥 Hide "Back" text when collapsed -->
              <span v-if="!showCollapsed" class="text-sm font-medium">Back</span>
            </button>
          </div>
        </div>

        <!-- Role Badge (expanded) -->
        <div class="mb-4" v-show="!showCollapsed && !isDrillDown">
          <div class="bg-primary-subtle text-primary font-bold text-xs tracking-wider text-center py-2 px-4 rounded-xl uppercase">
            {{ userRole }}
          </div>
        </div>

        <!-- Role Badge (collapsed - initials) -->
        <div class="mb-4 flex justify-center" v-show="showCollapsed && !isDrillDown">
          <div
              class="w-8 h-8 rounded-full bg-primary-subtle text-primary font-bold text-[10px] flex items-center justify-center uppercase"
              :title="userRole"
          >
            {{ userRole.slice(0, 2) }}
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-10">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <p class="text-sm text-text-muted mt-2" v-show="!showCollapsed">Loading menu...</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="text-center py-10">
          <p class="text-danger text-sm" v-show="!showCollapsed">{{ error }}</p>
          <button @click="loadModules" class="mt-2 text-primary hover:underline text-sm" v-show="!showCollapsed">
            Retry
          </button>
        </div>

        <!-- Navigation -->
        <nav v-if="!loading && !error" class="space-y-3">
          <!-- DRILL-DOWN MODE: Show only employee children -->
          <template v-if="isDrillDown">
            <div>

              <div class="space-y-0.5">
                <router-link
                    v-for="module in employeeChildrenModules"
                    :key="module.id"
                    :to="getModuleRoute(module.name)"
                    @click="handleChildNavigation"
                    class="flex items-center px-4 py-2 rounded-xl text-text-muted hover:bg-primary-subtle hover:text-primary font-medium transition-all"
                    :class="[
                      isActive(module.name, $route.path) ? 'bg-primary-subtle text-primary font-semibold shadow-sm border-l-4 border-primary' : '',
                      showCollapsed ? 'justify-center' : 'space-x-3'
                    ]"
                    :title="showCollapsed ? module.name : null"
                >
                  <font-awesome-icon :icon="module.icon || 'fa-solid fa-circle'" class="text-lg w-5 shrink-0" />
                  <span v-show="!showCollapsed" class="transition-opacity duration-150">{{ module.name }}</span>
                </router-link>
              </div>
            </div>
          </template>

          <!-- NORMAL MODE: Show all modules -->
          <template v-else>
            <!-- Company Section -->
            <div>
              <p class="text-[11px] font-bold text-text-muted tracking-widest px-3 mb-1 uppercase" v-show="!showCollapsed">Company</p>
              <div class="space-y-0.5">
                <template v-for="module in companyModules" :key="module.id">
                  <!-- Regular module -->
                  <router-link
                      v-if="!module.children"
                      :to="getModuleRoute(module.name)"
                      @click="handleNavigation"
                      class="flex items-center px-4 py-2 rounded-xl text-text-muted hover:bg-primary-subtle hover:text-primary font-medium transition-all"
                      :class="[
                        isActive(module.name, $route.path) ? 'bg-primary-subtle text-primary font-semibold shadow-sm border-l-4 border-primary' : '',
                        showCollapsed ? 'justify-center' : 'space-x-3'
                      ]"
                      :title="showCollapsed ? module.name : null"
                  >
                    <font-awesome-icon :icon="module.icon" class="text-lg w-5 shrink-0" />
                    <span v-show="!showCollapsed" class="transition-opacity duration-150">{{ module.name }}</span>
                  </router-link>

                  <!-- Module with dropdown (Employees) - Drills down -->
                  <div v-else class="relative sidebar-dropdown">
                    <button
                        @click.stop="drillIntoEmployees"
                        class="w-full flex items-center px-4 py-2 cursor-pointer rounded-xl text-text-muted hover:bg-primary-subtle hover:text-primary font-medium transition-all focus:outline-none"
                        :class="[
                          isActive(module.name, $route.path) ? 'bg-primary-subtle text-primary font-semibold shadow-sm border-l-4 border-primary' : '',
                          showCollapsed ? 'justify-center' : 'justify-between'
                        ]"
                        :title="showCollapsed ? module.name : null"
                    >
                      <div class="flex items-center" :class="showCollapsed ? '' : 'space-x-3'">
                        <font-awesome-icon :icon="module.icon" class="text-lg w-5 shrink-0" />
                        <span v-show="!showCollapsed">{{ module.name }}</span>
                      </div>
                      <font-awesome-icon
                          v-show="!showCollapsed"
                          icon="fa-solid fa-chevron-right"
                          class="text-xs"
                      />
                    </button>
                  </div>
                </template>
              </div>
            </div>

            <!-- Projects Section -->
            <div>
              <p class="text-[11px] font-bold text-text-muted tracking-widest px-3 mb-1 uppercase" v-show="!showCollapsed">Projects</p>
              <div class="space-y-0.5">
                <router-link
                    v-for="module in projectModules"
                    :key="module.id"
                    :to="getModuleRoute(module.name)"
                    @click="handleNavigation"
                    class="flex items-center px-4 py-2 rounded-xl text-text-muted hover:bg-primary-subtle hover:text-primary font-medium transition-all"
                    :class="[
                      isActive(module.name, $route.path) ? 'bg-primary-subtle text-primary font-semibold shadow-sm border-l-4 border-primary' : '',
                      showCollapsed ? 'justify-center' : 'space-x-3'
                    ]"
                    :title="showCollapsed ? module.name : null"
                >
                  <font-awesome-icon :icon="module.icon" class="text-lg w-5 shrink-0" />
                  <span v-show="!showCollapsed">{{ module.name }}</span>
                </router-link>
              </div>
            </div>
          </template>
        </nav>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminSidebar } from '../composables/useAdminsidebar.js';

const router = useRouter();

const COLLAPSE_BREAKPOINT = 1024;
const isDesktop = ref(window.innerWidth >= 768);
const manualOverride = ref(false);

const showCollapsed = computed(() => isDesktop.value && collapsed.value);

const applyResponsiveState = () => {
  const width = window.innerWidth;
  isDesktop.value = width >= 768;

  if (width < 768) return;

  if (!manualOverride.value) {
    collapsed.value = width < COLLAPSE_BREAKPOINT;
  }
};

const toggleCollapse = () => {
  manualOverride.value = true;
  collapsed.value = !collapsed.value;
  localStorage.setItem('sidebarCollapsed', String(collapsed.value));
};

// 🔥 Handle child navigation - stays in drill-down
const handleChildNavigation = () => {
  // Only close sidebar on mobile
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false;
  }
  // ✅ DO NOT exit drill-down
};

// Handle navigation - only close mobile sidebar
const handleNavigation = () => {
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false;
  }
};

// 🔥 Handle back button
const handleBackClick = () => {
  goBackFromDrillDown();
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false;
  }
};

onMounted(() => {
  const stored = localStorage.getItem('sidebarCollapsed');
  if (stored !== null) {
    manualOverride.value = true;
    collapsed.value = stored === 'true';
  }
  applyResponsiveState();
  window.addEventListener('resize', applyResponsiveState);
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', applyResponsiveState);
  document.removeEventListener('click', handleClickOutside);
});

const {
  loading,
  error,
  dropdownStates,
  loadModules,
  companyModules,
  projectModules,
  accountModules,
  employeeChildrenModules,
  employeesParent,
  isDrillDown,
  toggleDropdown,
  drillIntoEmployees,
  goBackFromDrillDown,
  getModuleRoute,
  isActive,
  getUserRole,
  isSidebarOpen,
  collapsed
} = useAdminSidebar();

const userRole = getUserRole();

const handleClickOutside = (e) => {
  if (!e.target.closest('.sidebar-dropdown')) {
    Object.keys(dropdownStates.value).forEach(key => {
      dropdownStates.value[key] = false;
    });
  }
};

</script>

<style scoped>
/* Custom scrollbar styles */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: var(--color-surface, #F4F7FE);
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: var(--color-primary, #5E5CE6);
  border-radius: 9999px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary-hover, #4A48C6);
}

/* Prevent any layout shift */
aside {
  will-change: transform, width;
  backface-visibility: hidden;
}

/* Smooth transitions */
.router-link-active {
  transition: none;
}
</style>