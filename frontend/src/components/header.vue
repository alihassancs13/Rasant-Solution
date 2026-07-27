<template>
  <header class="flex items-center justify-between gap-3 bg-white border border-border rounded-xl px-3 sm:px-4 py-2.5">
    <!-- Left: Back/Hamburger + Avatar + Greeting + Title -->
    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
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
        <font-awesome-icon v-if="iconOverride" :icon="iconOverride" class="text-sm" />
        <template v-else>{{ initials }}</template>
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
      <!-- Global Search -->
      <div ref="searchContainerRef" class="relative hidden lg:block">
        <font-awesome-icon
            :icon="['fas', 'magnifying-glass']"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
            :class="{ 'text-primary': searchQuery.length > 0 }"
        />
        <input
            ref="searchInputRef"
            type="text"
            v-model="searchQuery"
            @input="handleSearchInput"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
            @keydown.esc="clearSearch"
            @keydown.down="handleKeyDown"
            @keydown.up="handleKeyUp"
            @keydown.enter="handleKeyEnter"
            placeholder="Search employees, messages..."
            class="pl-9 pr-4 py-2 w-56 xl:w-72 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-text-primary placeholder-text-muted transition-all duration-200"
            :class="{ 'border-primary ring-2 ring-primary/20': searchQuery.length > 0 }"
        />

        <!-- Clear button -->
        <button
            v-if="searchQuery.length > 0"
            @click="clearSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'xmark']" class="w-3.5 h-3.5" />
        </button>

        <!-- Search Results Dropdown -->
        <div
            v-if="showResults && searchQuery.length >= 2"
            class="absolute left-0 top-full mt-2 w-[420px] max-h-[500px] bg-white border border-border rounded-xl shadow-2xl z-[100] overflow-hidden"
            style="transform-origin: top left;"
        >
          <!-- Loading state -->
          <div v-if="isSearching" class="flex items-center justify-center gap-3 py-8">
            <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm text-text-muted">Searching...</span>
          </div>

          <!-- Results -->
          <div v-else class="max-h-[500px] overflow-y-auto">
            <!-- Results header -->
            <div v-if="searchResults.length > 0" class="px-4 py-3 bg-surface border-b border-border">
              <p class="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Found {{ searchResults.length }} result{{ searchResults.length > 1 ? 's' : '' }}
              </p>
            </div>

            <!-- Result items grouped by module -->
            <div v-if="searchResults.length > 0">
              <div v-for="(group, moduleName) in groupedResults" :key="moduleName" class="border-b border-border last:border-0">
                <div class="px-4 py-2 bg-white/50">
                  <span class="text-[10px] font-bold text-text-muted uppercase tracking-wider">{{ moduleName }}</span>
                </div>

                <button
                    v-for="(result, index) in group"
                    :key="result.id"
                    @click="navigateToResult(result)"
                    @mouseenter="selectedIndex = getGlobalIndex(moduleName, index)"
                    class="group w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-subtle/20 transition-colors cursor-pointer text-left border-t border-border/50 first:border-t-0"
                    :class="{ 'bg-primary-subtle/20': selectedIndex === getGlobalIndex(moduleName, index) }"
                >
                  <!-- Icon -->
                  <div class="w-10 h-10 rounded-lg bg-primary-subtle/20 flex items-center justify-center shrink-0 group-hover:bg-primary-subtle/40 transition-colors">
                    <font-awesome-icon :icon="result.icon" class="w-4 h-4 text-primary" />
                  </div>

                  <!-- Content -->
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                      {{ result.title }}
                    </p>
                    <p class="text-xs text-text-muted truncate">{{ result.subtitle }}</p>
                  </div>

                  <!-- Module badge -->
                  <span class="text-[10px] font-medium text-text-muted bg-surface px-2 py-1 rounded-full shrink-0">
            {{ result.module }}
          </span>
                </button>
              </div>
            </div>

            <!-- No results message -->
            <div v-if="searchResults.length === 0 && !isSearching && searchQuery.length >= 2" class="px-4 py-8 text-center">
              <font-awesome-icon :icon="['fas', 'search']" class="w-8 h-8 text-text-muted/50 mb-2" />
              <p class="text-sm font-semibold text-text-primary">No results found</p>
              <p class="text-xs text-text-muted mt-1">We couldn't find anything for "<span class="font-medium text-text-primary">{{ searchQuery }}</span>"</p>
              <p class="text-xs text-text-muted/70 mt-2">Try adjusting your search terms</p>
            </div>


          </div>
        </div>
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
                    <p class="text-sm font-bold text-text-primary leading-tight">Notifications</p>
                    <p class="text-[11px] text-text-muted">{{ currentDate }}</p>
                  </div>
                </div>
                <span
                    v-if="unseenCount > 0"
                    class="text-xs font-bold text-danger bg-danger-subtle px-2.5 py-1 rounded-full"
                >
                  {{ unseenCount }} new
                </span>
              </div>
            </div>
            <!-- List -->
            <div class="max-h-96 overflow-y-auto">
              <div
                  v-if="notificationStore.isLoading && !notificationStore.items.length"
                  class="px-4 py-4"
              >
                <AppSkeleton variant="list" :count="4" />
              </div>

              <div
                  v-else-if="!notificationStore.items.length"
                  class="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center"
              >
                <div class="w-14 h-14 rounded-full bg-success-subtle flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'check']" class="text-xl text-success" />
                </div>
                <div>
                  <p class="text-sm font-semibold text-text-primary">You're all caught up</p>
                  <p class="text-xs text-text-muted mt-0.5">No notifications yet.</p>
                </div>
              </div>
              <button
                  v-for="item in notificationStore.items"
                  :key="item.id"
                  type="button"
                  @click="handleNotifItemClick(item)"
                  class="group w-full flex items-start gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-primary-subtle/40 transition-colors text-left cursor-pointer"
                  :class="!item.is_read ? 'bg-primary-subtle/20' : ''"
              >
                <div
                    class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    :class="typeStyle(item.type).bg"
                >
                  <font-awesome-icon :icon="typeStyle(item.type).icon" class="w-3.5 h-3.5" :class="typeStyle(item.type).text" />
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <p class="text-sm font-semibold text-text-primary truncate">{{ item.title }}</p>
                    <span v-if="!item.is_read" class="mt-1 w-2 h-2 rounded-full bg-danger shrink-0"></span>
                  </div>
                  <p v-if="item.body" class="text-xs text-text-muted mt-0.5 line-clamp-2">{{ item.body }}</p>
                  <p class="text-[10px] text-text-muted mt-1">{{ formatNotifTime(item.created_at) }}</p>
                </div>
              </button>
            </div>
            <div
                v-if="notificationStore.items.length"
                class="px-5 py-3 bg-surface border-t border-border flex items-center justify-between gap-2"
            >
              <button
                  type="button"
                  class="text-xs font-semibold text-danger hover:underline cursor-pointer"
                  @click.stop="clearAllNotifications"
              >
                Clear notifications
              </button>
              <button
                  v-if="unseenCount > 0"
                  type="button"
                  class="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  @click.stop="markAllRead"
              >
                Mark all read
              </button>
            </div>
          </div>
        </transition>
      </div>
      <!-- Avatar + dropdown menu -->
      <div ref="userMenuRef" class="relative">
        <button
            @click="toggleUserMenu"
            class="dash-topbar-profile flex items-center justify-center overflow-hidden"
            aria-haspopup="true"
            :aria-expanded="showUserMenu"
            :title="profileDisplayName"
        >
          <img
              v-if="profileAvatarUrl"
              :src="profileAvatarUrl"
              alt="Profile"
              class="w-full h-full object-cover"
          />
          <span v-else>{{ profileInitials }}</span>
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
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useOverview } from '@/composables/useOverview.js'
import { useAdminSidebar } from '@/composables/useAdminsidebar.js'
import { useLoginStore } from '@/stores/loginStore.js'
import { useNotificationStore } from '@/stores/notificationStore.js'
import { useGlobalSearch } from '@/composables/useGlobalSearch.js'
import AppSkeleton from '@/components/AppSkeleton.vue'
import { BASE_URL, API_ENDPOINTS } from '@/services/baseUrl.js'
const notificationStore = useNotificationStore()
const loginStore = useLoginStore()
const showNotifMenu = ref(false)
const notifRef = ref(null)
function handleSearchBlur() {
  setTimeout(() => {
    if (searchContainerRef.value && !searchContainerRef.value.contains(document.activeElement)) {
      showResults.value = false;
    }
  }, 200);
}
function handleSearchFocus() {
  if (searchQuery.value.length >= 2) {
    showResults.value = true;
    performSearch(searchQuery.value);
  }
}
function handleKeyDown() {
  if (flattenedResults.value.length === 0) return;
  selectedIndex.value = Math.min(selectedIndex.value + 1, flattenedResults.value.length - 1);
  scrollToSelected();
}
function handleKeyUp() {
  if (flattenedResults.value.length === 0) return;
  selectedIndex.value = Math.max(selectedIndex.value - 1, -1);
  scrollToSelected();
}
function handleKeyEnter() {
  if (selectedIndex.value >= 0 && selectedIndex.value < flattenedResults.value.length) {
    navigateToResult(flattenedResults.value[selectedIndex.value]);
  }
}
function scrollToSelected() {
  nextTick(() => {
    const selectedElement = document.querySelector('[data-selected="true"]');
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  });
}
// ── Global Search ──────────────────────────────
const {
  searchQuery,
  searchResults,
  showResults,
  isSearching,
  performSearch,
  navigateToResult,
  clearSearch
} = useGlobalSearch()
const searchContainerRef = ref(null)
const searchInputRef = ref(null)
const selectedIndex = ref(-1)
let searchDebounceTimeout = null
const groupedResults = computed(() => {
  const groups = {}
  searchResults.value.forEach(result => {
    if (!groups[result.module]) {
      groups[result.module] = []
    }
    groups[result.module].push(result)
  })
  return groups
})
const getGlobalIndex = (moduleName, index) => {
  let globalIdx = 0
  const moduleNames = Object.keys(groupedResults.value)
  for (const mod of moduleNames) {
    if (mod === moduleName) {
      return globalIdx + index
    }
    globalIdx += groupedResults.value[mod].length
  }
  return -1
}
const flattenedResults = computed(() => {
  const flat = []
  Object.values(groupedResults.value).forEach(group => {
    flat.push(...group)
  })
  return flat
})
function handleSearchInput() {
  clearTimeout(searchDebounceTimeout)
  searchDebounceTimeout = setTimeout(() => {
    performSearch(searchQuery.value)
    selectedIndex.value = -1
  }, 300)
}
// ── Get sidebar functions ──
const {  toggleSidebar } = useAdminSidebar()
// ── Notification dropdown ──────────────────────
function toggleNotifMenu() {
  showNotifMenu.value = !showNotifMenu.value
  if (showNotifMenu.value) {
    openNotifications()
  } else {
    clearSeenNotifications()
  }
}

async function openNotifications() {
  await notificationStore.fetchNotifications({ force: true })
  if (notificationStore.unreadCount > 0) {
    await notificationStore.markRead([], true)
  }
}

async function clearSeenNotifications() {
  if (!notificationStore.items.length) return
  await notificationStore.clearNotifications({ clearAll: true })
}

async function clearAllNotifications() {
  await notificationStore.clearNotifications({ clearAll: true })
  showNotifMenu.value = false
}

const TYPE_STYLES = {
  inbox: { icon: ['fas', 'comments'], bg: 'bg-sky-100', text: 'text-sky-700' },
  inquiry: { icon: ['fas', 'envelope'], bg: 'bg-pink-100', text: 'text-pink-700' },
  cv: { icon: ['fas', 'file-lines'], bg: 'bg-violet-100', text: 'text-violet-700' },
  job: { icon: ['fas', 'briefcase'], bg: 'bg-indigo-100', text: 'text-indigo-700' },
  increment: { icon: ['fas', 'money-bill'], bg: 'bg-amber-100', text: 'text-amber-700' },
  status: { icon: ['fas', 'user-check'], bg: 'bg-emerald-100', text: 'text-emerald-700' },
  leave: { icon: ['fas', 'umbrella-beach'], bg: 'bg-indigo-100', text: 'text-indigo-700' },
  system: { icon: ['fas', 'bell'], bg: 'bg-slate-100', text: 'text-slate-700' },
}
function typeStyle(type) {
  return TYPE_STYLES[type] || TYPE_STYLES.system
}
const unseenCount = computed(() => notificationStore.unreadCount || 0)
function formatNotifTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
async function markAllRead() {
  await notificationStore.markRead([], true)
}
const props = defineProps({
  userName: { type: String, default: '' },
  role: { type: String, default: '' },
  notificationCount: { type: Number, default: 0 },
  accountName: { type: String, default: null },
  settingsRoute: { type: String, default: '/admin/account' },
  titleOverride: { type: String, default: null },
  subtitleOverride: { type: String, default: null },
  showBack: { type: Boolean, default: false },
  iconOverride: { type: Array, default: null },
})
const emit = defineEmits(['back', 'highlight-employee'])
const router = useRouter()
async function handleNotifItemClick(item) {
  showNotifMenu.value = false
  await notificationStore.clearNotifications({ clearAll: true })
  if (item?.type === 'increment' && item?.payload?.employee_id) {
    router.push({
      path: '/admin/employees/salaries',
      query: { highlightEmployee: item.payload.employee_id },
    })
    return
  }
  if (item?.link) {
    router.push(item.link)
  }
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
const loggedInUser = computed(() => loginStore.user || null)
const profileDisplayName = computed(() => {
  const u = loggedInUser.value
  if (u) {
    const full = [u.first_name, u.last_name].filter(Boolean).join(' ').trim()
    if (full) return full
    if (u.username) return u.username
    if (u.email) return u.email
  }
  return props.accountName?.trim() || props.userName?.trim() || 'User'
})
const displayName = computed(() => props.userName?.trim() || profileDisplayName.value || 'User')
const initials = computed(() => getInitials(props.userName || profileDisplayName.value))
const profileInitials = computed(() => getInitials(profileDisplayName.value))
const profileAvatarUrl = ref(null)
let profileAvatarObjectUrl = null
function clearProfileAvatar() {
  if (profileAvatarObjectUrl) {
    URL.revokeObjectURL(profileAvatarObjectUrl)
    profileAvatarObjectUrl = null
  }
  profileAvatarUrl.value = null
}

async function loadProfileAvatar() {
  clearProfileAvatar()
  const u = loggedInUser.value
  if (!u?.id || !u?.has_avatar) return

  try {
    const token = localStorage.getItem('accessToken')
    const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL
    const res = await fetch(`${base}${API_ENDPOINTS.ACCOUNTS_GET_USER_AVATAR(u.id)}?t=${Date.now()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) return
    const blob = await res.blob()
    profileAvatarObjectUrl = URL.createObjectURL(blob)
    profileAvatarUrl.value = profileAvatarObjectUrl
  } catch (err) {
    console.warn('Failed to load profile avatar', err)
  }
}

watch(
    () => [loggedInUser.value?.id, loggedInUser.value?.has_avatar],
    () => {
      loadProfileAvatar()
    },
    { immediate: true }
)

const now = ref(new Date())
let timer = null

onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 60000)
  notificationStore.startPolling()
})

onUnmounted(() => {
  clearInterval(timer)
  clearProfileAvatar()
  notificationStore.stopPolling()
  clearTimeout(searchDebounceTimeout)
})

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

function handleClickOutside(event) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false;
  }
  if (notifRef.value && !notifRef.value.contains(event.target)) {
    if (showNotifMenu.value) {
      showNotifMenu.value = false;
      clearSeenNotifications();
    }
  }
  if (searchContainerRef.value && !searchContainerRef.value.contains(event.target)) {
    showResults.value = false;
    selectedIndex.value = -1;
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
.max-h-\[500px\]::-webkit-scrollbar {
  width: 4px;
}

.max-h-\[500px\]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-\[500px\]::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}

.max-h-\[500px\]::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>