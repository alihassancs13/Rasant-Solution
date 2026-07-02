<template>
  <header class="flex items-center justify-between gap-3 bg-white border border-border rounded-xl px-3 sm:px-4 py-2.5">
    <!-- Left: Hamburger (mobile) + Avatar + Greeting + Title -->
    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
      <!-- Mobile sidebar toggle -->
      <button
          @click="isSidebarOpen = true"
          class="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-text-muted shrink-0 hover:bg-primary hover:text-white transition-colors cursor-pointer"
          aria-label="Open Sidebar"
      >
        <font-awesome-icon :icon="['fas', 'bars']" class="text-sm" />
      </button>

      <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-text-primary text-white flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0">
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

    <!-- Right: Search + Date + Notification + Avatar + Logout -->
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

      <div class="hidden xs:flex w-9 h-9 rounded-full bg-primary text-white items-center justify-center font-semibold text-xs shrink-0">
        {{ userInitials }}
      </div>

      <button
          @click="openLogoutModal"
          class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors cursor-pointer shrink-0"
      >
        <font-awesome-icon :icon="['fas', 'right-from-bracket']" class="text-xs" />
        <span class="hidden sm:inline">Logout</span>
      </button>
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
import { useOverview } from '../composables/Admin/useOverview.js'
import { useAdminSidebar } from '../composables/Admin/useAdminsidebar.js'

const props = defineProps({
  userName: { type: String, default: '' },
  role: { type: String, default: '' },
  notificationCount: { type: Number, default: 0 },
  accountName: { type: String, default: null }
})

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

const pageTitle = computed(() => roleConfig[props.role]?.title || '')
const subtitle = computed(() => roleConfig[props.role]?.subtitle || '')
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
</script>