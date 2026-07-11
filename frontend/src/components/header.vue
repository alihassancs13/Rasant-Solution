<template>
  <header class="flex items-center justify-between gap-3 bg-white border border-border rounded-xl px-3 sm:px-4 py-2.5">
    <!-- Left: Back/Hamburger + Avatar + Greeting + Title -->
    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
      <!-- Back button (shown instead of hamburger when navigating within a drilled-down view) -->
      <button
          v-if="showBack"
          @click="$emit('back')"
          class="back-btn w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary shrink-0 bg-surface border border-border transition-colors cursor-pointer"
          aria-label="Go back"
      >
        <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-sm" />
      </button>

      <!-- Mobile sidebar toggle -->
      <button
          v-else
          @click="isSidebarOpen = true"
          class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-text-muted shrink-0 hover:bg-primary hover:text-white transition-colors cursor-pointer"
          aria-label="Open Sidebar"
      >
        <font-awesome-icon :icon="['fas', 'bars']" class="text-sm" />
      </button>

      <!-- Avatar with dash-topbar-profile class - Text centered -->
      <div class="dash-topbar-profile flex items-center justify-center">
        {{ initials }}
      </div>

      <div class="min-w-0">
        <p class="hidden xs:block text-[10px] sm:text-[11px] font-semibold text-text-muted tracking-wide uppercase truncate">
          {{ greeting }}, {{ displayName }}
        </p>
        <div class="flex items-center gap-2 flex-wrap">
          <h1 class="text-sm sm:text-lg font-bold text-text-primary truncate">{{ pageTitle }}</h1>
          <span
              class="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
              :class="roleBadgeClasses"
          >
            {{ roleLabel }}
          </span>
        </div>
        <p class="hidden sm:block text-xs text-text-muted truncate">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Right: Search + Date + Notification + Avatar (with dropdown) -->
    <div class="flex items-center gap-2 sm:gap-3 shrink-0">
      <div class="relative hidden lg:block">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
            type="text"
            placeholder="Search pages, tickets, messages..."
            class="pl-9 pr-4 py-2 w-56 xl:w-72 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-text-primary placeholder-text-muted"
        />
      </div>

      <div class="hidden md:flex items-center gap-1.5 text-sm font-medium text-text-secondary bg-surface border border-border px-3 py-2 rounded-lg whitespace-nowrap">
        {{ currentDate }}
      </div>

      <button class="relative w-9 h-9 flex items-center justify-center rounded-full bg-surface border border-border hover:bg-surface-alt transition shrink-0">
        <svg class="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span
            v-if="notificationCount > 0"
            class="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none"
        >
          {{ notificationCount }}
        </span>
      </button>

      <!-- Avatar + dropdown menu -->
      <div ref="userMenuRef" class="relative">
        <button
            @click="toggleUserMenu"
            class="dash-topbar-profile flex items-center justify-center"
            aria-haspopup="true"
            :aria-expanded="showUserMenu"
        >
          {{ userInitials }}
        </button>

        <transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
        >
          <div
              v-if="showUserMenu"
              class="absolute right-0 top-full mt-2 w-44 bg-white border border-border rounded-xl shadow-xl p-1.5 z-50"
          >
            <button
                @click="handleSettingsClick"
                class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary-subtle rounded-xl transition-colors cursor-pointer"
            >
              <font-awesome-icon :icon="['fas', 'gear']" class="w-3.5 h-3.5" />
              Settings
            </button>
            <button
                @click="handleLogoutClick"
                class="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-danger hover:bg-danger-subtle rounded-xl transition-colors cursor-pointer"
            >
              <font-awesome-icon :icon="['fas', 'right-from-bracket']" class="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>

  <!-- Logout Confirm Modal -->
  <div
      v-if="showLogoutModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto"
  >
    <div
        @click="closeLogoutModal"
        class="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
    ></div>

    <div class="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border z-10 transform transition-all">
      <h3 class="text-lg font-bold text-text-primary mb-2">Confirm Logout</h3>
      <p class="text-sm text-text-muted mb-6">
        Are you sure you want to log out of your session? You will need to re-enter your credentials to access the dashboard.
      </p>

      <div class="flex items-center justify-end gap-3">
        <button
            @click="closeLogoutModal"
            class="px-4 py-2 text-sm font-semibold text-text-secondary bg-surface hover:bg-surface-alt rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
            @click="handleLogout"
            class="px-4 py-2 text-sm font-semibold text-white bg-danger hover:bg-danger-hover rounded-xl transition-colors shadow-sm shadow-danger/20 cursor-pointer"
        >
          Yes, Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOverview } from '../composables/useOverview.js'
import { useAdminSidebar } from '../composables/useAdminsidebar.js'

const props = defineProps({
  userName: { type: String, default: '' },
  role: { type: String, default: '' },
  notificationCount: { type: Number, default: 0 },
  accountName: { type: String, default: null },
  // Route pushed when "Settings" is clicked in the avatar dropdown.
  settingsRoute: { type: String, default: '/settings' },
  // Overrides the role-based default title/subtitle (e.g. showing a job title
  // instead of "Company Overview" while drilled into that job's CVs).
  titleOverride: { type: String, default: null },
  subtitleOverride: { type: String, default: null },
  // Swaps the mobile hamburger for a back arrow when true.
  showBack: { type: Boolean, default: false },
})

const emit = defineEmits(['back'])

const router = useRouter()

const {
  showLogoutModal,
  openLogoutModal,
  closeLogoutModal,
  handleLogout
} = useOverview()

// Shared with AdminSidebar (module-level ref) — controls mobile drawer
const { isSidebarOpen } = useAdminSidebar()

const roleConfig = {
  admin: {
    label: 'ADMINISTRATOR',
    title: 'Company Overview',
    subtitle: 'Employees, clients, revenue & operations',
    badgeClasses: 'bg-primary-subtle text-primary'
  },
  employee: {
    label: 'EMPLOYEE',
    title: 'My Workspace',
    subtitle: 'Tasks, messages & attendance',
    badgeClasses: 'bg-success-subtle text-success'
  },
  client: {
    label: 'CLIENT',
    title: 'Client Portal',
    subtitle: 'Subscriptions & support',
    badgeClasses: 'bg-warning-subtle text-warning'
  }
}

const pageTitle = computed(() => props.titleOverride || roleConfig[props.role]?.title || '')
const subtitle = computed(() => props.subtitleOverride || roleConfig[props.role]?.subtitle || '')
const roleLabel = computed(() => roleConfig[props.role]?.label || '')
const roleBadgeClasses = computed(() => roleConfig[props.role]?.badgeClasses || 'bg-surface-alt text-text-secondary')

function getInitials(name) {
  if (!name || typeof name !== 'string') return '??'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const displayName = computed(() => props.userName?.trim() || 'User')
const initials = computed(() => getInitials(props.userName))
const userInitials = computed(() => getInitials(props.accountName || props.userName))

const now = ref(new Date())
let timer = null
onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 60000)
})
onUnmounted(() => clearInterval(timer))

const greeting = computed(() => {
  const h = now.value.getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
})

const currentDate = computed(() => {
  return now.value.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
})

// ── Avatar dropdown (Settings / Logout) ──────────────────────
const showUserMenu = ref(false)
const userMenuRef = ref(null)

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

function closeUserMenu() {
  showUserMenu.value = false
}

function handleSettingsClick() {
  closeUserMenu()
  router.push(props.settingsRoute)
}

function handleLogoutClick() {
  closeUserMenu()
  openLogoutModal()
}

// Close the dropdown when clicking anywhere outside it
function handleClickOutside(event) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.back-btn:hover {
  background: linear-gradient(135deg, #2A5F9E, #4A90E2);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(42, 95, 158, 0.2);
}
</style>