<template>
  <header class="flex items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
    <!-- Left: Avatar + Greeting + Title -->
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold text-sm shrink-0">
        {{ initials }}
      </div>
      <div class="min-w-0">
        <p class="text-[11px] font-semibold text-slate-500 tracking-wide uppercase truncate">
          {{ greeting }}, {{ userName }}
        </p>
        <div class="flex items-center gap-2">
          <h1 class="text-lg font-bold text-slate-900 truncate">{{ pageTitle }}</h1>
          <span
              class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              :class="roleBadgeClasses"
          >
            {{ roleLabel }}
          </span>
        </div>
        <p class="text-xs text-slate-400 truncate">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Right: Search + Date + Notification + Avatar -->
    <div class="flex items-center gap-3 shrink-0">
      <div class="relative hidden md:block">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
            type="text"
            placeholder="Search pages, tickets, messages..."
            class="pl-9 pr-4 py-2 w-72 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div class="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg whitespace-nowrap">
        {{ currentDate }}
      </div>

      <button class="relative w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition">
        <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span
            v-if="notificationCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none"
        >
          {{ notificationCount }}
        </span>
      </button>

      <div class="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shrink-0">
        {{ userInitials }}
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  userName: { type: String, required: true },
  role: { type: String, required: true }, // 'admin' | 'employee' | 'client'
  notificationCount: { type: Number, default: 0 },
  // Optional: separate name for the small circular avatar on the right
  // (in the reference design this shows the logged-in user's initials, e.g. "SA")
  accountName: { type: String, default: null }
})

const roleConfig = {
  admin: {
    label: 'ADMINISTRATOR',
    title: 'Company Overview',
    subtitle: 'Employees, clients, revenue & operations',
    badgeClasses: 'bg-blue-100 text-blue-700'
  },
  employee: {
    label: 'EMPLOYEE',
    title: 'My Workspace',
    subtitle: 'Tasks, messages & attendance',
    badgeClasses: 'bg-emerald-100 text-emerald-700'
  },
  client: {
    label: 'CLIENT',
    title: 'Client Portal',
    subtitle: 'Subscriptions & support',
    badgeClasses: 'bg-amber-100 text-amber-700'
  }
}

const pageTitle = computed(() => roleConfig[props.role]?.title || '')
const subtitle = computed(() => roleConfig[props.role]?.subtitle || '')
const roleLabel = computed(() => roleConfig[props.role]?.label || '')
const roleBadgeClasses = computed(() => roleConfig[props.role]?.badgeClasses || 'bg-slate-100 text-slate-700')

function getInitials(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const initials = computed(() => getInitials(props.userName))
const userInitials = computed(() => getInitials(props.accountName || props.userName))

// Live clock for greeting + date
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