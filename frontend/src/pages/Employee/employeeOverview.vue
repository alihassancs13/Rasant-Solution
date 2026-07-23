<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />
    <ToastContainer />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <DashboardHeader
          titleOverride="My Overview"
          subtitleOverride="Daily check-in &amp; your allowances"
          :iconOverride="['fas', 'house']"
          role="employee"
          settings-route="/admin/account"
        />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-6 space-y-4">
        <section
          class="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-[#1E3A5F] via-[#2A5F9E] to-[#4A90E2] p-6 sm:p-8 text-white shadow-sm"
        >
          <div
            class="absolute inset-0 opacity-25 pointer-events-none"
            style="background: radial-gradient(circle at 85% 15%, rgba(255,255,255,0.4), transparent 40%);"
          ></div>
          <div class="relative flex flex-col lg:flex-row lg:items-end justify-between gap-5">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-sky-100/90 font-semibold mb-2">
                Rasant Solutions
              </p>
              <h1 class="text-2xl sm:text-3xl font-bold font-display">
                {{ greeting }}, {{ firstName }}
              </h1>
              <p class="text-sky-100/90 text-sm mt-2 max-w-xl">
                Mark today’s attendance with your live location. One check-in and one check-out per day.
              </p>
              <p v-if="employee" class="text-sky-100/80 text-xs mt-2">
                {{ employee.designation || 'Team member' }}
                <span v-if="employee.department"> · {{ employee.department }}</span>
                <span v-if="employee.employee_number"> · {{ employee.employee_number }}</span>
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="px-5 py-2.5 rounded-md bg-white text-primary text-sm font-semibold hover:bg-sky-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                :disabled="!canCheckIn || isPunching"
                @click="handlePunch('check_in')"
              >
                <font-awesome-icon
                  :icon="['fas', isPunching && punchingAction === 'check_in' ? 'spinner' : 'right-to-bracket']"
                  :spin="isPunching && punchingAction === 'check_in'"
                  class="mr-2"
                />
                Check in
              </button>
              <button
                type="button"
                class="px-5 py-2.5 rounded-md bg-white/15 border border-white/25 text-white text-sm font-semibold hover:bg-white/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                :disabled="!canCheckOut || isPunching"
                @click="handlePunch('check_out')"
              >
                <font-awesome-icon
                  :icon="['fas', isPunching && punchingAction === 'check_out' ? 'spinner' : 'right-from-bracket']"
                  :spin="isPunching && punchingAction === 'check_out'"
                  class="mr-2"
                />
                Check out
              </button>
            </div>
          </div>
        </section>

        <div v-if="isLoading && !overview" class="py-20 text-center text-text-muted">
          <font-awesome-icon :icon="['fas', 'spinner']" class="animate-spin text-3xl text-primary mb-3" />
          <p class="text-sm">Loading your overview…</p>
        </div>

        <div v-else-if="error && !overview" class="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <p class="text-red-700 font-medium">{{ error }}</p>
          <button type="button" class="mt-3 text-sm text-primary font-semibold underline cursor-pointer" @click="load">
            Retry
          </button>
        </div>

        <template v-else-if="overview">
          <p v-if="punchMessage" class="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-4 py-2">
            {{ punchMessage }}
          </p>
          <p v-if="locationError" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2">
            {{ locationError }}
          </p>
          <p v-if="error" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-2">
            {{ error }}
          </p>

          <!-- What I'm working on -->
          <section class="bg-white border border-border rounded-lg p-4 sm:p-5">
            <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h2 class="text-base font-bold text-text-primary">What I’m working on today</h2>
                <p class="text-sm text-text-muted mt-0.5">
                  Share a short update so admin can see your current focus on the dashboard.
                </p>
              </div>
              <span v-if="workUpdateSavedAt" class="text-[11px] text-text-muted">
                Updated {{ workUpdateSavedAt }}
              </span>
            </div>
            <textarea
              v-model="workNoteDraft"
              rows="3"
              maxlength="2000"
              placeholder="e.g. Building employee attendance module, reviewing PR #42…"
              class="w-full rounded-md border border-border bg-surface/40 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
            />
            <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p class="text-xs text-text-muted">{{ workNoteDraft.length }}/2000</p>
              <button
                type="button"
                class="px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                :disabled="isSavingWorkUpdate || !workNoteDraft.trim()"
                @click="saveWorkUpdate"
              >
                {{ isSavingWorkUpdate ? 'Saving…' : 'Save update' }}
              </button>
            </div>
          </section>

          <!-- Work from home -->
          <section class="bg-white border border-border rounded-lg p-4 sm:p-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-base font-bold text-text-primary">Work from home</h2>
                <p class="text-sm text-text-muted mt-0.5 max-w-xl">
                  Turn this on when you are working remotely. If your location is outside the office radius, attendance will show as Work from home instead of Not in office.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="workFromHome"
                class="relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border transition-colors disabled:opacity-50"
                :class="workFromHome ? 'bg-primary border-primary' : 'bg-slate-200 border-slate-200'"
                :disabled="isSavingWfh"
                @click="toggleWorkFromHome"
              >
                <span
                  class="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transform transition translate-y-0.5"
                  :class="workFromHome ? 'translate-x-7' : 'translate-x-1'"
                />
              </button>
            </div>
            <p class="text-xs mt-3 font-medium" :class="workFromHome ? 'text-sky-700' : 'text-text-muted'">
              {{ isSavingWfh ? 'Saving…' : (workFromHome ? 'Enabled — outside office will be marked Work from home' : 'Disabled — outside office will be marked Not in office') }}
            </p>
          </section>

          <!-- Today: punch status only -->
          <section class="bg-white border border-border rounded-lg p-4 sm:p-5">
            <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h2 class="text-base font-bold text-text-primary">Today</h2>
                <p class="text-sm text-text-muted mt-0.5">{{ todayDateLabel }}</p>
              </div>
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                :class="todayBadgeClass"
              >
                {{ todayStatusLabel }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="rounded-md border border-border bg-surface/60 p-3">
                <p class="text-xs text-text-muted uppercase tracking-wide">Check-in</p>
                <p class="text-lg font-semibold text-text-primary mt-1">{{ formatTime(todayRecord?.clock_in) }}</p>
                <p class="text-xs mt-1" :class="locationTone(todayRecord?.check_in_in_office)">
                  {{ todayRecord?.check_in_location_label || officeLabel(todayRecord?.check_in_in_office, workFromHome) }}
                </p>
              </div>
              <div class="rounded-md border border-border bg-surface/60 p-3">
                <p class="text-xs text-text-muted uppercase tracking-wide">Check-out</p>
                <p class="text-lg font-semibold text-text-primary mt-1">{{ formatTime(todayRecord?.clock_out) }}</p>
                <p class="text-xs mt-1" :class="locationTone(todayRecord?.check_out_in_office)">
                  {{ todayRecord?.check_out_location_label || officeLabel(todayRecord?.check_out_in_office, workFromHome) }}
                </p>
              </div>
            </div>
          </section>

          <!-- Allowances -->
          <section class="bg-white border border-border rounded-lg p-4 sm:p-5">
            <h2 class="text-base font-bold text-text-primary mb-1">Your allowances</h2>
            <p class="text-sm text-text-muted mb-4">Configured by admin for payroll rules.</p>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div class="rounded-md border border-border p-3">
                <p class="text-xs text-text-muted">Grace / late window</p>
                <p class="text-xl font-bold text-text-primary mt-1">{{ allowances?.grace_minutes ?? '—' }} <span class="text-sm font-medium">min</span></p>
              </div>
              <div class="rounded-md border border-border p-3">
                <p class="text-xs text-text-muted">Paid leaves / month</p>
                <p class="text-xl font-bold text-text-primary mt-1">{{ allowances?.allowed_leaves_per_month ?? '—' }}</p>
              </div>
              <div class="rounded-md border border-border p-3">
                <p class="text-xs text-text-muted">Free absents / month</p>
                <p class="text-xl font-bold text-text-primary mt-1">{{ allowances?.allowed_absents_per_month ?? '—' }}</p>
              </div>
              <div class="rounded-md border border-border p-3">
                <p class="text-xs text-text-muted">Free lates before penalty</p>
                <p class="text-xl font-bold text-text-primary mt-1">{{ allowances?.late_count_threshold ?? '—' }}</p>
              </div>
            </div>
            <p v-if="allowances?.office_address" class="text-xs text-text-muted mt-3">
              Office: {{ allowances.office_address }}
              <span v-if="allowances.office_radius_meters"> (within {{ allowances.office_radius_meters }} m)</span>
            </p>
            <p v-else-if="!allowances?.office_configured" class="text-xs text-amber-700 mt-3">
              Office location is not set by admin yet — check-ins still work, but “In office” cannot be verified.
            </p>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AdminSidebar from '@/components/adminSidebar.vue'
import DashboardHeader from '@/components/header.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { useEmployeeOverviewStore } from '@/stores/employeeOverviewStore.js'
import {
  getCurrentPosition,
  reverseGeocodeLabel,
  officeLabel,
  ensureLocationPermission,
  LOCATION_REQUIRED_MESSAGE,
} from '@/composables/useGeolocation.js'
import { useToast } from '@/composables/useToast'

const store = useEmployeeOverviewStore()
const {
  overview, isLoading, isPunching, isSavingWfh, isSavingWorkUpdate,
  error, punchMessage, canCheckIn, canCheckOut, allowances, employee, workUpdate,
} = storeToRefs(store)
const { showToast } = useToast()

const punchingAction = ref(null)
const locationError = ref(null)
const workNoteDraft = ref('')

const firstName = computed(() => {
  const name = employee.value?.name || ''
  return name.split(' ')[0] || 'there'
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})

const todayRecord = computed(() => overview.value?.today?.record || null)

const todayDateLabel = computed(() =>
  new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
)

const todayStatusLabel = computed(() => {
  if (!todayRecord.value) return 'Not checked in'
  if (todayRecord.value.clock_in && !todayRecord.value.clock_out) return 'Checked in'
  if (todayRecord.value.clock_out) return 'Checked out'
  return 'Pending'
})

const todayBadgeClass = computed(() => {
  if (!todayRecord.value?.clock_in) return 'bg-slate-100 text-slate-700'
  if (!todayRecord.value?.clock_out) return 'bg-sky-100 text-sky-800'
  return 'bg-emerald-100 text-emerald-800'
})

function formatTime(value) {
  if (!value) return '—'
  const str = String(value)
  return str.length >= 5 ? str.slice(0, 5) : str
}

function locationTone(inOffice) {
  if (inOffice === true) return 'text-emerald-700'
  if (inOffice === false) return 'text-amber-700'
  return 'text-text-muted'
}

const workFromHome = computed(() => Boolean(employee.value?.work_from_home))

const workUpdateSavedAt = computed(() => {
  const iso = workUpdate.value?.updated_at
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
})

async function load() {
  await store.fetchOverview()
  workNoteDraft.value = workUpdate.value?.note || ''
}

async function saveWorkUpdate() {
  const result = await store.saveWorkUpdate(workNoteDraft.value)
  if (result.success) {
    workNoteDraft.value = result.data?.work_update?.note || workNoteDraft.value
    showToast(result.data?.message || 'Work update saved', 'success')
  } else {
    showToast(result.error || 'Failed to save', 'error')
  }
}

async function toggleWorkFromHome() {
  const next = !workFromHome.value
  const result = await store.setWorkFromHome(next)
  if (result.success) {
    showToast(result.data?.message || (next ? 'Work from home enabled' : 'Work from home disabled'), 'success')
  } else {
    showToast(result.error || 'Failed to update', 'error')
  }
}

async function handlePunch(action) {
  punchingAction.value = action
  locationError.value = null
  try {
    await ensureLocationPermission()
    const coords = await getCurrentPosition()
    if (coords?.latitude == null || coords?.longitude == null) {
      throw new Error(LOCATION_REQUIRED_MESSAGE)
    }
    const address = await reverseGeocodeLabel(coords.latitude, coords.longitude)
    const result = await store.punch(action, { ...coords, address })
    if (result.success) {
      const label = result.data?.location_label
      const inOffice = result.data?.in_office
      const extra = label
        ? ` ${label}.`
        : inOffice === true
          ? ' Marked In office.'
          : inOffice === false
            ? (result.data?.work_from_home ? ' Work from home.' : ' Not in office.')
            : ''
      showToast((result.data?.message || 'Saved') + extra, 'success')
    } else {
      showToast(result.error || 'Failed', 'error')
    }
  } catch (err) {
    const message = err?.message || LOCATION_REQUIRED_MESSAGE
    locationError.value = message
    showToast(message, 'error')
  } finally {
    punchingAction.value = null
  }
}

onMounted(load)
</script>
