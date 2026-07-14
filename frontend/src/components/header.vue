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
          @click="toggleSidebar"
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

      <div ref="notifRef" class="relative">
        <button
            @click="toggleNotifMenu"
            class="relative w-9 h-9 flex items-center justify-center rounded-full bg-surface border border-border hover:bg-surface-alt transition shrink-0"
        >
          <svg
              class="w-4 h-4 text-text-secondary"
              :class="{ 'animate-[wiggle_0.5s_ease-in-out]': unseenCount > 0 }"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span
              v-if="unseenCount > 0"
              class="absolute -top-1 -right-1 flex items-center justify-center"
          >
            <span class="absolute inline-flex h-4 w-4 rounded-full bg-danger opacity-75 animate-ping"></span>
            <span class="relative bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
              {{ unseenCount }}
            </span>
          </span>
        </button>

        <transition
            enter-active-class="transition ease-out duration-150"
            enter-from-class="opacity-0 -translate-y-1 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition ease-in duration-100"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 -translate-y-1 scale-95"
        >
          <div
              v-if="showNotifMenu"
              class="absolute right-0 top-full mt-2 w-96 bg-white border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
              style="transform-origin: top right;"
          >
            <!-- Header -->
            <div class="relative px-5 py-4 bg-gradient-to-br from-primary/5 via-white to-white border-b border-border">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl bg-danger-subtle flex items-center justify-center">
                    <font-awesome-icon :icon="['fas', 'bell']" class="w-4 h-4 text-danger" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-text-primary leading-tight">Increments due today</p>
                    <p class="text-[11px] text-text-muted">{{ currentDate }}</p>
                  </div>
                </div>
                <span
                    v-if="policyStore.dueTodayIncrements.length"
                    class="text-xs font-bold text-danger bg-danger-subtle px-2.5 py-1 rounded-full"
                >
                  {{ policyStore.dueTodayIncrements.length }} pending
                </span>
              </div>
            </div>

            <!-- List -->
            <div class="max-h-96 overflow-y-auto">
              <!-- Empty state -->
              <div
                  v-if="!policyStore.dueTodayIncrements.length"
                  class="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center"
              >
                <div class="w-14 h-14 rounded-full bg-success-subtle flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'check']" class="text-xl text-success" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-text-primary">You're all caught up</p>
                  <p class="text-xs text-text-muted mt-0.5">No increments due today.</p>
                </div>
              </div>

              <!-- Items -->
              <button
                  v-for="(item, idx) in policyStore.dueTodayIncrements"
                  :key="`${item.employee_id}-${item.policy_id}`"
                  @click="handleNotifItemClick(item)"
                  class="group w-full flex items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-primary-subtle/40 transition-colors text-left cursor-pointer"
              >
                <div class="relative shrink-0">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                       :class="[avatarStyle(idx).bg, avatarStyle(idx).text]">
                    {{ getInitials(item.employee_name) }}
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-text-primary truncate">{{ item.employee_name }}</p>
                  <p class="text-xs text-text-muted truncate flex items-center gap-1 mt-0.5">
                    <font-awesome-icon :icon="['fas', 'file-lines']" class="w-2.5 h-2.5" />
                    {{ item.policy_name }}
                  </p>
                </div>

                <font-awesome-icon
                    :icon="['fas', 'chevron-right']"
                    class="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </button>
            </div>

            <!-- Footer -->
            <div
                v-if="policyStore.dueTodayIncrements.length"
                class="px-5 py-3 bg-surface border-t border-border text-center"
            >
              <p class="text-xs text-text-muted">Click an employee to jump to their record</p>
            </div>
          </div>
        </transition>
      </div>

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
import { useOverview } from '@/composables/useOverview.js'
import { useAdminSidebar } from '@/composables/useAdminsidebar.js'
import { usePolicyStore } from '@/stores/policyStore'

const policyStore = usePolicyStore()
const showNotifMenu = ref(false)
const notifRef = ref(null)

// ── Get sidebar functions ──
const { isSidebarOpen, toggleSidebar } = useAdminSidebar()

// ── Notification dropdown ──────────────────────
function toggleNotifMenu() {
  showNotifMenu.value = !showNotifMenu.value
  if (showNotifMenu.value) {
    markAllAsSeen()
  }
}

const avatarPalette = [
  { bg: 'bg-teal-200', text: 'text-teal-700' },
  { bg: 'bg-blue-200', text: 'text-blue-700' },
  { bg: 'bg-purple-200', text: 'text-purple-700' },
  { bg: 'bg-pink-200', text: 'text-pink-700' },
  { bg: 'bg-amber-200', text: 'text-amber-700' },
]

const avatarStyle = (index) => avatarPalette[index % avatarPalette.length]

const seenKeys = ref(new Set(JSON.parse(localStorage.getItem('seenIncrementKeys') || '[]')))

function itemKey(item) {
  return `${item.employee_id}-${item.policy_id}`
}

const unseenCount = computed(() =>
    policyStore.dueTodayIncrements.filter(item => !seenKeys.value.has(itemKey(item))).length
)

function markAllAsSeen() {
  policyStore.dueTodayIncrements.forEach(item => seenKeys.value.add(itemKey(item)))
  localStorage.setItem('seenIncrementKeys', JSON.stringify([...seenKeys.value]))
}

const props = defineProps({
  userName: { type: String, default: '' },
  role: { type: String, default: '' },
  notificationCount: { type: Number, default: 0 },
  accountName: { type: String, default: null },
  settingsRoute: { type: String, default: '/settings' },
  titleOverride: { type: String, default: null },
  subtitleOverride: { type: String, default: null },
  showBack: { type: Boolean, default: false },
})

const emit = defineEmits(['back', 'highlight-employee'])

const router = useRouter()

function handleNotifItemClick(item) {
  showNotifMenu.value = false
  router.push({
    path: '/admin/employees/salaries',
    query: { highlightEmployee: item.employee_id }
  })
}

const {
  showLogoutModal,
  openLogoutModal,
  closeLogoutModal,
  handleLogout
} = useOverview()

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
  policyStore.fetchIncrementsDueToday()
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
  if (notifRef.value && !notifRef.value.contains(event.target)) {
    showNotifMenu.value = false
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