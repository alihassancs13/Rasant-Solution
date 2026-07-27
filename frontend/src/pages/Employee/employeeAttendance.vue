<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />
    <ToastContainer />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <DashboardHeader
          titleOverride="My Attendance"
          subtitleOverride="Your monthly summary &amp; daily records"
          :iconOverride="['fas', 'calendar-check']"
          role="employee"
          settings-route="/admin/account"
        />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-6 space-y-4">
        <div v-if="isLoading && !loadedOnce" class="space-y-4">
          <AppSkeleton variant="stats" :count="4" />
          <AppSkeleton variant="table" :count="5" />
        </div>

        <div v-else-if="error && !loadedOnce" class="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <p class="text-red-700 font-medium">{{ error }}</p>
          <button type="button" class="mt-3 text-sm text-primary font-semibold underline cursor-pointer" @click="load">
            Retry
          </button>
        </div>

        <template v-else>
          <section class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Attendance %"
              :value="`${month?.attendance_pct ?? 0}%`"
              :subtitle="month?.label || 'This month'"
              :icon="['fas', 'chart-line']"
              color="blue"
            />
            <StatCard
              label="Present"
              :value="month?.present ?? 0"
              :subtitle="`${month?.late ?? 0} late · ${month?.on_leave ?? 0} leave`"
              :icon="['fas', 'user-check']"
              color="teal"
            />
            <StatCard
              label="Absent"
              :value="month?.absent ?? 0"
              :subtitle="`${month?.total_recorded ?? 0} days recorded`"
              :icon="['fas', 'user-xmark']"
              color="pink"
            />
            <StatCard
              label="In office"
              :value="month?.in_office_days ?? 0"
              :subtitle="`${month?.remote_or_outside_days ?? 0} outside pin`"
              :icon="['fas', 'location-dot']"
              color="purple"
            />
          </section>

          <section class="bg-white border border-border rounded-lg overflow-hidden">
            <div class="px-4 sm:px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h2 class="text-base font-bold text-text-primary">Attendance history</h2>
                <p class="text-sm text-text-muted mt-0.5">Filter by date range and status</p>
              </div>
              <div class="flex flex-wrap items-end gap-2">
                <div>
                  <label class="block text-[11px] text-text-muted mb-1">From</label>
                  <input
                    v-model="dateFrom"
                    type="date"
                    class="rounded-md border border-border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label class="block text-[11px] text-text-muted mb-1">To</label>
                  <input
                    v-model="dateTo"
                    type="date"
                    class="rounded-md border border-border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label class="block text-[11px] text-text-muted mb-1">Status</label>
                  <select
                    v-model="statusFilter"
                    class="rounded-md border border-border px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="all">All</option>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="on_leave">On leave</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-md bg-primary text-white text-sm font-semibold cursor-pointer disabled:opacity-50"
                  :disabled="isLoading"
                  @click="loadHistory"
                >
                  Apply
                </button>
                <button
                  v-if="hasFilters"
                  type="button"
                  class="px-3 py-1.5 rounded-md border border-border text-sm text-text-muted hover:bg-surface cursor-pointer"
                  @click="clearFilters"
                >
                  Clear
                </button>
              </div>
            </div>

            <div class="px-4 sm:px-5 py-3 border-b border-border flex flex-wrap gap-2 text-xs">
              <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold">
                Present {{ historyStats.present }}
              </span>
              <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold">
                Late {{ historyStats.late }}
              </span>
              <span class="px-2.5 py-1 rounded-full bg-red-50 text-red-800 font-semibold">
                Absent {{ historyStats.absent }}
              </span>
              <span class="px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 font-semibold">
                Leave {{ historyStats.on_leave }}
              </span>
              <span class="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 font-semibold">
                Holiday {{ historyStats.holiday || 0 }}
              </span>
            </div>

            <div class="overflow-x-auto">
              <div v-if="isLoading" class="p-4">
                <AppSkeleton variant="table" :count="5" />
              </div>
              <table v-else-if="history.length" class="w-full text-sm">
                <thead class="bg-surface text-left text-text-muted text-xs uppercase tracking-wide">
                  <tr>
                    <th class="px-4 py-3 font-semibold">Date</th>
                    <th class="px-4 py-3 font-semibold">In</th>
                    <th class="px-4 py-3 font-semibold">Out</th>
                    <th class="px-4 py-3 font-semibold">Status</th>
                    <th class="px-4 py-3 font-semibold">Late / OT</th>
                    <th class="px-4 py-3 font-semibold">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in history" :key="row.id" class="border-t border-border">
                    <td class="px-4 py-3 text-text-primary font-medium whitespace-nowrap">{{ row.date }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">{{ formatTime(row.clock_in) }}</td>
                    <td class="px-4 py-3 whitespace-nowrap">{{ formatTime(row.clock_out) }}</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 rounded-full text-xs font-semibold capitalize" :class="statusChip(row.status)">
                        {{ formatStatus(row.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-text-muted text-xs">
                      {{ row.late_minutes ?? 0 }} min · {{ row.overtime_hours ?? 0 }} h
                    </td>
                    <td class="px-4 py-3 min-w-[220px]">
                      <p class="text-xs font-medium" :class="locationTone(row.check_in_in_office)">
                        {{ row.check_in_location_label || officeLabel(row.check_in_in_office, row.work_from_home) }}
                        <span v-if="row.check_in_distance_meters != null">
                          · {{ formatDistance(row.check_in_distance_meters) }}
                        </span>
                      </p>
                      <p v-if="row.check_in_address" class="text-xs text-text-muted mt-0.5 line-clamp-2">
                        {{ row.check_in_address }}
                      </p>
                      <a
                        v-if="mapsLink(row.check_in_latitude, row.check_in_longitude)"
                        :href="mapsLink(row.check_in_latitude, row.check_in_longitude)"
                        target="_blank"
                        rel="noopener"
                        class="text-xs text-primary font-semibold mt-1 inline-block"
                      >
                        Open map
                      </a>
                      <p v-else class="text-xs text-text-muted">No GPS on this record</p>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="px-5 py-10 text-center text-sm text-text-muted">
                No attendance records for this filter.
              </p>
            </div>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import AdminSidebar from '@/components/adminSidebar.vue'
import AppSkeleton from '@/components/AppSkeleton.vue'
import DashboardHeader from '@/components/header.vue'
import StatCard from '@/components/StatCard.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { BASE_URL, API_ENDPOINTS } from '@/services/baseUrl.js'
import {
  mapsLink,
  formatDistance,
  officeLabel,
} from '@/composables/useGeolocation.js'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const isLoading = ref(false)
const loadedOnce = ref(false)
const error = ref(null)
const month = ref(null)
const history = ref([])
const historyStats = reactive({
  present: 0,
  late: 0,
  absent: 0,
  on_leave: 0,
  holiday: 0,
})

const dateFrom = ref('')
const dateTo = ref('')
const statusFilter = ref('all')

const hasFilters = computed(
  () => Boolean(dateFrom.value || dateTo.value || (statusFilter.value && statusFilter.value !== 'all')),
)

function formatTime(value) {
  if (!value) return '—'
  const str = String(value)
  return str.length >= 5 ? str.slice(0, 5) : str
}

function formatStatus(status) {
  if (!status) return '—'
  return String(status).replace('_', ' ')
}

function locationTone(inOffice) {
  if (inOffice === true) return 'text-emerald-700'
  if (inOffice === false) return 'text-amber-700'
  return 'text-text-muted'
}

function statusChip(status) {
  const map = {
    present: 'bg-emerald-100 text-emerald-800',
    late: 'bg-amber-100 text-amber-800',
    absent: 'bg-red-100 text-red-800',
    on_leave: 'bg-sky-100 text-sky-800',
    holiday: 'bg-indigo-100 text-indigo-800',
  }
  return map[status] || 'bg-slate-100 text-slate-700'
}

async function loadOverview() {
  const { data } = await api.get(API_ENDPOINTS.ATTENDANCE.MY_OVERVIEW)
  month.value = data.month || null
}

async function loadHistory() {
  isLoading.value = true
  error.value = null
  try {
    const params = {}
    if (dateFrom.value) params.date_from = dateFrom.value
    if (dateTo.value) params.date_to = dateTo.value
    if (statusFilter.value && statusFilter.value !== 'all') params.status = statusFilter.value

    const { data } = await api.get(API_ENDPOINTS.ATTENDANCE.MY_HISTORY, { params })
    history.value = Array.isArray(data.history) ? data.history : []
    const stats = data.historyStats || {}
    historyStats.present = stats.present || 0
    historyStats.late = stats.late || 0
    historyStats.absent = stats.absent || 0
    historyStats.on_leave = stats.on_leave || 0
    historyStats.holiday = stats.holiday || 0
    loadedOnce.value = true
  } catch (err) {
    error.value = err.response?.data?.error || err.response?.data?.message || 'Failed to load attendance'
  } finally {
    isLoading.value = false
  }
}

async function clearFilters() {
  dateFrom.value = ''
  dateTo.value = ''
  statusFilter.value = 'all'
  await loadHistory()
}

async function load() {
  isLoading.value = true
  error.value = null
  try {
    await Promise.all([loadOverview(), loadHistory()])
    loadedOnce.value = true
  } catch (err) {
    error.value = err.response?.data?.error || err.response?.data?.message || 'Failed to load attendance'
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
</script>
