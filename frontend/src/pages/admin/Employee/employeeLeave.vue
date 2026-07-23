<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />
    <ToastContainer />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <DashboardHeader
          titleOverride="Leave requests"
          subtitleOverride="Review employee leave proposals"
          :iconOverride="['fas', 'umbrella-beach']"
          role="admin"
          settings-route="/admin/account"
        />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-6 space-y-4">
        <div class="grid grid-cols-3 gap-3">
          <StatCard label="Pending" :value="store.stats.pending" :icon="['fas', 'hourglass-half']" color="blue" />
          <StatCard label="Approved" :value="store.stats.approved" :icon="['fas', 'check']" color="blue" />
          <StatCard label="Rejected" :value="store.stats.rejected" :icon="['fas', 'xmark']" color="pink" />
        </div>

        <!-- Theme-aligned pill filters -->
        <div class="w-full overflow-x-auto scrollbar-hide">
          <div class="inline-flex items-center gap-1 bg-white border border-border rounded-lg shadow-sm p-1">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              type="button"
              class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold duration-200 cursor-pointer whitespace-nowrap"
              :class="statusFilter === tab.value
                ? 'tab-active-gradient shadow-md'
                : 'text-gray-500 hover:bg-blue-50 hover:text-[#4A90E2]'"
              @click="setFilter(tab.value)"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <section class="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-border bg-gradient-to-r from-[#EFF6FF] via-white to-white">
            <h2 class="text-lg font-bold text-headingMain">Inbox</h2>
            <p class="text-sm text-text-muted mt-0.5">
              Approve to auto-mark attendance (full day or half day) for the selected dates
            </p>
          </div>

          <div v-if="store.isLoading" class="py-16 text-center text-text-muted text-sm">Loading leave requests…</div>
          <div v-else-if="!store.adminRequests.length" class="py-16 text-center text-text-muted text-sm">
            No {{ statusFilter === 'all' ? '' : statusFilter + ' ' }}requests.
          </div>

          <ul v-else class="divide-y divide-border">
            <li v-for="row in store.adminRequests" :key="row.id" class="px-5 py-5 hover:bg-[#F8FAFC]/80 transition-colors">
              <div class="flex flex-col lg:flex-row lg:items-start gap-4">
                <div class="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    class="w-10 h-10 rounded-lg bg-[rgba(74,144,226,0.12)] text-[#1E3A5F] text-xs font-bold flex items-center justify-center shrink-0 border border-[#BFDBFE]"
                  >
                    {{ initials(row.employee_name) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                      <p class="text-sm font-bold text-headingMain">{{ row.employee_name }}</p>
                      <span
                        class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize"
                        :class="statusChip(row.status)"
                      >
                        {{ row.status }}
                      </span>
                      <span
                        v-if="row.is_half_day"
                        class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(74,144,226,0.12)] text-[#1E3A5F] border border-[#BFDBFE]"
                      >
                        Half day
                      </span>
                    </div>
                    <p class="text-xs text-text-muted">
                      {{ row.department || '—' }}
                      <span v-if="row.designation"> · {{ row.designation }}</span>
                      <span v-if="row.employee_number"> · {{ row.employee_number }}</span>
                    </p>
                    <p class="text-sm font-semibold text-headingMain mt-3">{{ row.subject }}</p>
                    <p class="text-xs text-[#4A90E2] font-medium mt-1">
                      <template v-if="row.is_half_day">
                        {{ row.start_date }} · {{ row.duration_label || 'Half day' }}
                      </template>
                      <template v-else>
                        {{ row.start_date }} → {{ row.end_date }} · {{ row.duration_label || `${row.duration_days} day(s)` }}
                      </template>
                    </p>
                    <div class="mt-3 rounded-lg border border-[#BFDBFE] bg-[rgba(74,144,226,0.06)] px-4 py-3">
                      <p class="text-[10px] font-bold uppercase tracking-wider text-[#1E3A5F]/70 mb-1.5">Proposal</p>
                      <p class="text-sm text-textBody whitespace-pre-wrap leading-relaxed">{{ row.reason }}</p>
                    </div>
                    <p
                      v-if="row.admin_note"
                      class="mt-2 text-xs text-[#1E3A5F] bg-[rgba(74,144,226,0.08)] border border-[#BFDBFE] rounded-lg px-3 py-2"
                    >
                      Decision note: {{ row.admin_note }}
                    </p>
                  </div>
                </div>

                <div v-if="row.status === 'pending'" class="lg:w-64 shrink-0 space-y-2">
                  <textarea
                    v-model="notes[row.id]"
                    rows="3"
                    placeholder="Optional note to employee…"
                    class="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-[#4A90E2]"
                  />
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-white shadow-md transition-all duration-300 cursor-pointer btn-primary-gradient disabled:opacity-50"
                      :disabled="store.isSubmitting"
                      @click="decide(row, 'approved')"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      class="flex-1 px-3 py-2 rounded-lg bg-white text-red-700 text-xs font-semibold border border-red-200 hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                      :disabled="store.isSubmitting"
                      @click="decide(row, 'rejected')"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import AdminSidebar from '@/components/adminSidebar.vue'
import DashboardHeader from '@/components/header.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import StatCard from '@/components/StatCard.vue'
import { useLeaveStore } from '@/stores/leaveStore.js'
import { useToast } from '@/composables/useToast'

const store = useLeaveStore()
const { showToast } = useToast()
const statusFilter = ref('pending')
const notes = reactive({})

const tabs = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

function initials(name = '') {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || '?'
}

function statusChip(status) {
  return {
    pending: 'bg-[rgba(74,144,226,0.12)] text-[#1E3A5F] border border-[#BFDBFE]',
    approved: 'bg-[rgba(74,144,226,0.18)] text-[#1E3A5F] border border-[#93C5FD]',
    rejected: 'bg-red-50 text-red-700 border border-red-100',
  }[status] || 'bg-slate-100 text-slate-700'
}

async function load() {
  const result = await store.fetchAdminRequests(statusFilter.value)
  if (!result.success) showToast(result.error, 'error')
}

function setFilter(value) {
  statusFilter.value = value
  load()
}

async function decide(row, decision) {
  const result = await store.decide(row.id, decision, notes[row.id] || '')
  if (result.success) {
    showToast(result.data?.message || `Leave ${decision}`, 'success')
    delete notes[row.id]
  } else {
    showToast(result.error || 'Failed', 'error')
  }
}

onMounted(load)
</script>
