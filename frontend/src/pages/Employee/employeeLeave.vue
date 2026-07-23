<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />
    <ToastContainer />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <DashboardHeader
          titleOverride="Leave"
          :subtitleOverride="activeTab === 'submit' ? 'Compose and send a leave proposal' : 'Track your leave request status'"
          :iconOverride="['fas', 'umbrella-beach']"
          role="employee"
          settings-route="/admin/account"
        />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-6 space-y-4">
        <div class="w-full overflow-x-auto scrollbar-hide">
          <div class="inline-flex items-center gap-1 bg-white border border-border rounded-lg shadow-sm p-1">
            <button
              type="button"
              class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold duration-200 cursor-pointer whitespace-nowrap"
              :class="activeTab === 'submit'
                ? 'tab-active-gradient shadow-md'
                : 'text-gray-500 hover:bg-blue-50 hover:text-[#4A90E2]'"
              @click="activeTab = 'submit'"
            >
              <font-awesome-icon :icon="['fas', 'paper-plane']" class="w-3.5 h-3.5 flex-shrink-0" />
              Submit request
            </button>
            <button
              type="button"
              class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold duration-200 cursor-pointer whitespace-nowrap"
              :class="activeTab === 'requests'
                ? 'tab-active-gradient shadow-md'
                : 'text-gray-500 hover:bg-blue-50 hover:text-[#4A90E2]'"
              @click="switchToRequests"
            >
              <font-awesome-icon :icon="['fas', 'list-check']" class="w-3.5 h-3.5 flex-shrink-0" />
              My requests
            </button>
          </div>
        </div>

        <section v-if="activeTab === 'submit'" class="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-border bg-gradient-to-r from-[#EFF6FF] via-white to-white">
            <h2 class="text-lg font-bold text-headingMain">Compose leave proposal</h2>
            <p class="text-sm text-text-muted mt-0.5">
              Full day or half day — include dates and your reason. Admin will approve or reject from the portal.
            </p>
          </div>

          <form class="p-5 space-y-4" @submit.prevent="submit">
            <!-- Leave type: Full / Half -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Leave type</label>
              <div class="inline-flex items-center gap-1 bg-white border border-border rounded-lg p-1">
                <button
                  type="button"
                  class="px-4 py-2 rounded-md text-sm font-semibold cursor-pointer transition-colors"
                  :class="!form.is_half_day
                    ? 'tab-active-gradient shadow-sm text-white'
                    : 'text-gray-500 hover:bg-blue-50 hover:text-[#4A90E2]'"
                  @click="setHalfDay(false)"
                >
                  Full day
                </button>
                <button
                  type="button"
                  class="px-4 py-2 rounded-md text-sm font-semibold cursor-pointer transition-colors"
                  :class="form.is_half_day
                    ? 'tab-active-gradient shadow-sm text-white'
                    : 'text-gray-500 hover:bg-blue-50 hover:text-[#4A90E2]'"
                  @click="setHalfDay(true)"
                >
                  Half day
                </button>
              </div>
            </div>

            <div v-if="form.is_half_day">
              <label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Half-day period</label>
              <div class="inline-flex items-center gap-1 bg-white border border-border rounded-lg p-1">
                <button
                  type="button"
                  class="px-4 py-2 rounded-md text-sm font-semibold cursor-pointer transition-colors"
                  :class="form.half_day_period === 'morning'
                    ? 'bg-[rgba(74,144,226,0.15)] text-[#1E3A5F] border border-[#BFDBFE]'
                    : 'text-gray-500 hover:bg-blue-50 hover:text-[#4A90E2]'"
                  @click="form.half_day_period = 'morning'"
                >
                  Morning
                </button>
                <button
                  type="button"
                  class="px-4 py-2 rounded-md text-sm font-semibold cursor-pointer transition-colors"
                  :class="form.half_day_period === 'afternoon'
                    ? 'bg-[rgba(74,144,226,0.15)] text-[#1E3A5F] border border-[#BFDBFE]'
                    : 'text-gray-500 hover:bg-blue-50 hover:text-[#4A90E2]'"
                  @click="form.half_day_period = 'afternoon'"
                >
                  Afternoon
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  {{ form.is_half_day ? 'Date' : 'From' }}
                </label>
                <input
                  v-model="form.start_date"
                  type="date"
                  required
                  :min="minDate"
                  class="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-[#4A90E2]"
                  @change="onStartChange"
                />
              </div>
              <div v-if="!form.is_half_day">
                <label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">To</label>
                <input
                  v-model="form.end_date"
                  type="date"
                  required
                  :min="form.start_date || minDate"
                  class="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-[#4A90E2]"
                />
              </div>
            </div>

            <p
              v-if="durationLabel"
              class="text-xs font-semibold text-[#1E3A5F] bg-[rgba(74,144,226,0.10)] border border-[#BFDBFE] rounded-lg px-3 py-2 inline-block"
            >
              Duration: {{ durationLabel }}
            </p>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Subject</label>
              <input
                v-model="form.subject"
                type="text"
                maxlength="255"
                required
                placeholder="e.g. Half day — personal appointment"
                class="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-[#4A90E2]"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Proposal / reason</label>
              <textarea
                v-model="form.reason"
                rows="7"
                maxlength="5000"
                required
                placeholder="Dear Admin,&#10;&#10;I would like to request leave for the dates above because…&#10;&#10;Thank you,"
                class="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-[#4A90E2] resize-y"
              />
              <p class="text-xs text-text-muted mt-1">{{ form.reason.length }}/5000 · minimum 20 characters</p>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                class="px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-md transition-all duration-300 cursor-pointer btn-primary-gradient disabled:opacity-50"
                :disabled="store.isSubmitting"
              >
                {{ store.isSubmitting ? 'Sending…' : 'Send leave request' }}
              </button>
            </div>
          </form>
        </section>

        <section v-else class="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold text-headingMain">My leave requests</h2>
              <p class="text-sm text-text-muted mt-0.5">Status updates also appear in your notification bell</p>
            </div>
            <select
              v-model="statusFilter"
              class="rounded-lg border border-border px-3 py-2 text-sm bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-[#4A90E2]"
              @change="load"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div v-if="store.isLoading" class="py-12 text-center text-text-muted text-sm">Loading…</div>
          <div v-else-if="!store.myRequests.length" class="py-12 text-center text-text-muted text-sm">
            No leave requests yet.
            <button
              type="button"
              class="block mx-auto mt-3 text-sm font-semibold text-[#4A90E2] hover:text-[#1E3A5F] hover:underline cursor-pointer"
              @click="activeTab = 'submit'"
            >
              Submit your first request
            </button>
          </div>
          <ul v-else class="divide-y divide-border">
            <li v-for="row in store.myRequests" :key="row.id" class="px-5 py-4 hover:bg-[#F8FAFC]/80 transition-colors">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <p class="text-sm font-semibold text-headingMain">{{ row.subject }}</p>
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize" :class="statusChip(row.status)">
                    {{ row.status }}
                  </span>
                  <span
                    v-if="row.is_half_day"
                    class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(74,144,226,0.12)] text-[#1E3A5F] border border-[#BFDBFE]"
                  >
                    Half day
                  </span>
                </div>
                <p class="text-xs text-[#4A90E2] font-medium">
                  <template v-if="row.is_half_day">
                    {{ row.start_date }} · {{ row.duration_label || 'Half day' }}
                  </template>
                  <template v-else>
                    {{ row.start_date }} → {{ row.end_date }} · {{ row.duration_label || `${row.duration_days} day(s)` }}
                  </template>
                  <span v-if="row.created_at" class="text-text-muted font-normal"> · sent {{ formatWhen(row.created_at) }}</span>
                </p>
                <p class="text-sm text-textBody mt-2 whitespace-pre-wrap line-clamp-4">{{ row.reason }}</p>
                <p
                  v-if="row.admin_note"
                  class="mt-2 text-xs text-[#1E3A5F] bg-[rgba(74,144,226,0.08)] border border-[#BFDBFE] rounded-lg px-3 py-2"
                >
                  Admin note: {{ row.admin_note }}
                </p>
              </div>
            </li>
          </ul>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AdminSidebar from '@/components/adminSidebar.vue'
import DashboardHeader from '@/components/header.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { useLeaveStore } from '@/stores/leaveStore.js'
import { useToast } from '@/composables/useToast'

const store = useLeaveStore()
const { showToast } = useToast()
const activeTab = ref('submit')
const statusFilter = ref('all')

const minDate = computed(() => new Date().toISOString().slice(0, 10))

const form = reactive({
  start_date: minDate.value,
  end_date: minDate.value,
  is_half_day: false,
  half_day_period: 'morning',
  subject: 'Leave request',
  reason: '',
})

const durationLabel = computed(() => {
  if (!form.start_date) return ''
  if (form.is_half_day) {
    const period = form.half_day_period === 'afternoon' ? 'Afternoon' : 'Morning'
    return `Half day (${period})`
  }
  if (!form.end_date) return ''
  const a = new Date(form.start_date)
  const b = new Date(form.end_date)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return ''
  const days = Math.round((b - a) / 86400000) + 1
  return `${days} day${days === 1 ? '' : 's'}`
})

function setHalfDay(value) {
  form.is_half_day = value
  if (value) {
    form.end_date = form.start_date
    if (!form.half_day_period) form.half_day_period = 'morning'
  }
}

function onStartChange() {
  if (form.is_half_day) {
    form.end_date = form.start_date
  } else if (form.end_date && form.end_date < form.start_date) {
    form.end_date = form.start_date
  }
}

function statusChip(status) {
  return {
    pending: 'bg-[rgba(74,144,226,0.12)] text-[#1E3A5F] border border-[#BFDBFE]',
    approved: 'bg-[rgba(74,144,226,0.18)] text-[#1E3A5F] border border-[#93C5FD]',
    rejected: 'bg-red-50 text-red-700 border border-red-100',
  }[status] || 'bg-slate-100 text-slate-700'
}

function formatWhen(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function load() {
  const result = await store.fetchMyRequests(statusFilter.value)
  if (!result.success) showToast(result.error, 'error')
}

async function switchToRequests() {
  activeTab.value = 'requests'
  await load()
}

async function submit() {
  const payload = {
    start_date: form.start_date,
    end_date: form.is_half_day ? form.start_date : form.end_date,
    is_half_day: form.is_half_day,
    half_day_period: form.is_half_day ? form.half_day_period : '',
    subject: form.subject,
    reason: form.reason,
  }
  const result = await store.submitRequest(payload)
  if (result.success) {
    showToast(result.data?.message || 'Leave request sent', 'success')
    form.reason = ''
    form.subject = 'Leave request'
    form.is_half_day = false
    form.half_day_period = 'morning'
    statusFilter.value = 'all'
    activeTab.value = 'requests'
    await load()
  } else {
    showToast(result.error || 'Failed', 'error')
  }
}

onMounted(() => {
  store.fetchMyRequests('all')
})
</script>
