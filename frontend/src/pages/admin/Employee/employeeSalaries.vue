<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminSidebar from '@/components/adminSidebar.vue'
import TopHeader from '@/components/header.vue'
import StatCard from '@/components/statCard.vue'
import ShineButton from '@/components/ShineButton.vue'
import BaseModal from '@/components/baseModal.vue'
import { useIncrementPolicy } from '@/composables/useIncrementPolicy.js'

// TODO: replace with a real salaryStore / useSalaries() composable once
// the backend endpoints exist — same pattern as useJobs()/jobStore in
// CareersPage.vue (fetchAdminJobs -> adminJobs etc.)
const employeesCovered = ref(3)
const dueNow           = ref(1)

// ── Increment policies (real API, wired via composable) ──
const {
  formData, formErrors, isSubmitting,
  policies, loading: policiesLoading, incrementTypes, cycleTimings, applicationModes,
  resetForm, loadIntoForm, fetchPolicies, fetchLookups, savePolicy, deletePolicy: removePolicy,
} = useIncrementPolicy()

const activePolicies = computed(() => policies.value.filter(p => p.is_active).length)

// ── Pill Tab Navigation ──
const tabs = [
  { key: 'employee-roster', label: 'Employee roster', icon: ['fas', 'users'] },
  { key: 'policies',        label: 'Policies',        icon: ['fas', 'file-lines'] },
]
const activeTab = ref('employee-roster')

// ── Shared helpers ──
const formatCurrency = (amount) =>
    amount || amount === 0 ? `₨${Number(amount).toLocaleString('en-US')}` : '—'

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

const avatarPalette = [
  { bg: 'bg-teal-200', text: 'text-teal-700' },
  { bg: 'bg-blue-200', text: 'text-blue-700' },
  { bg: 'bg-purple-200', text: 'text-purple-700' },
  { bg: 'bg-pink-200', text: 'text-pink-700' },
  { bg: 'bg-amber-200', text: 'text-amber-700' },
]
const avatarStyle = (index) => avatarPalette[index % avatarPalette.length]

const initials = (name) =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

// ── Employee roster (placeholder data — matches design mock) ──
// TODO: wire up to real employees + assigned-policies endpoint once it exists
const employees = ref([
  {
    id: 'EMP-001',
    name: 'Sarah Ali',
    department: 'Engineering',
    salary: 185000,
    policies: 'Annual Merit Raise, Q3 Cost of Living',
    incrementStatus: 'approved',
    projected: 211500,
    delta: 26500,
  },
  {
    id: 'EMP-002',
    name: 'Ali Raza',
    department: 'DevOps',
    salary: 142000,
    policies: 'Q3 Cost of Living',
    incrementStatus: 'due_soon',
    incrementLabel: 'Due in 7d',
    projected: 150000,
    delta: 8000,
  },
  {
    id: 'EMP-003',
    name: 'Hina Khan',
    department: 'Product',
    salary: 165000,
    policies: 'Mid-Year Adjustment',
    incrementStatus: 'due_now',
    projected: 178200,
    delta: 13200,
  },
  {
    id: 'EMP-004',
    name: 'Usman Tariq',
    department: 'Sales',
    salary: 85000,
    policies: null,
    incrementStatus: 'none',
    projected: null,
    delta: null,
  },
])

const dueForIncrementCount = computed(() =>
    employees.value.filter(e => e.incrementStatus !== 'none').length
)

const incrementStatusMeta = (status) => ({
  approved: { label: 'Approved', icon: ['fas', 'circle-check'], classes: 'bg-success-subtle text-success' },
  due_soon: { label: 'Due in 7d', icon: ['fas', 'clock'], classes: 'bg-amber-100 text-amber-700' },
  due_now:  { label: 'Due now', icon: ['fas', 'circle-exclamation'], classes: 'bg-orange-100 text-orange-700' },
  none:     { label: '—', icon: null, classes: 'text-text-muted' },
}[status] || { label: '—', icon: null, classes: 'text-text-muted' })

// TODO: wire up to real endpoints once the increments API exists
const applyIncrements = () => {}
const forceIncrement = () => {}

// ── Policies: card display helpers (fields match IncrementPolicySerializer) ──
// Same brand gradients already used on the StatCards above — reused here
// for the policy card top accent bars so the palette stays consistent.
const policyAccentBars = [
  'bg-gradient-to-r from-[#C9C4F8] to-[#8FB9F4]', // blue
  'bg-gradient-to-r from-[#FFD5B4] to-[#E8C1D9]', // pink
  'bg-gradient-to-r from-[#FDE68A] to-[#F59E0B]', // amber
]
const accentBar = (index) => policyAccentBars[index % policyAccentBars.length]

const typeBadgeClasses = (modeCode) =>
    modeCode === 'auto' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'

const formatIncrement = (policy) =>
    policy.increment_type_code === 'percentage'
        ? `+${Number(policy.amount)}%`
        : `+${formatCurrency(Number(policy.amount))}`

const daysUntil = (dateStr) => {
  if (!dateStr) return Infinity
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
}
const isOverdue = (dateStr) => daysUntil(dateStr) < 0
const isDueSoon = (dateStr) => { const d = daysUntil(dateStr); return d >= 0 && d <= 14 }

const cardBorderClass = (policy) =>
    isOverdue(policy.next_effective_date)
        ? 'border-2 border-warning shadow-lg shadow-warning/20'
        : 'border border-border'

const dateClass = (policy) =>
    (isOverdue(policy.next_effective_date) || isDueSoon(policy.next_effective_date))
        ? 'text-danger font-semibold'
        : 'text-text-primary font-semibold'

// ── Policy modal ──
const showPolicyModal = ref(false)
const policyModalTitle = computed(() => formData.id ? 'Edit policy' : 'Add new policy')
const policyModalSubtitle = computed(() =>
    formData.id ? `POL-${String(formData.id).padStart(3, '0')} · Update increment rules` : 'Define raise rules for a new policy.'
)

const openAddPolicyModal = () => { resetForm(); showPolicyModal.value = true }
const editPolicy = (policy) => { loadIntoForm(policy); showPolicyModal.value = true }
const closePolicyModal = () => { showPolicyModal.value = false; resetForm() }

const handleSavePolicy = async () => {
  const saved = await savePolicy()
  if (saved) closePolicyModal()
}

const confirmDeletePolicy = async (policy) => {
  if (!confirm(`Delete "${policy.policy_name}"? This cannot be undone.`)) return
  await removePolicy(policy.id)
}

// TODO: wire once an employee-assignment endpoint exists
const assignPolicy = (policy) => {}

onMounted(() => {
  fetchPolicies()
  fetchLookups()
})
</script>

<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <TopHeader
            userName="System Admin"
            role="admin"
            :notificationCount="1"
            titleOverride="Salaries"
            subtitleOverride="Compensation, policies & increments"
        />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-4 space-y-4">
        <!-- Stat Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
              label="Employees Covered"
              :value="employeesCovered"
              subtitle="On increment plans"
              :icon="['fas', 'users']"
              color="pink"
          />
          <StatCard
              label="Due Now"
              :value="dueNow"
              subtitle="Ready for Apply"
              :icon="['fas', 'circle-exclamation']"
              color="yellow"
          />
          <StatCard
              label="Active Policies"
              :value="activePolicies"
              subtitle="1 due within 14d"
              :icon="['fas', 'clipboard-list']"
              color="purple"
          />
        </div>

        <!-- Pill Tab Navigation -->
        <div class="w-full overflow-x-auto scrollbar-hide">
          <div class="inline-flex items-center gap-1 bg-white border border-border rounded-lg shadow-sm p-1">
            <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="activeTab = tab.key"
                class="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold duration-200 cursor-pointer whitespace-nowrap"
                :class="activeTab === tab.key ? 'tab-active-gradient shadow-md' : 'text-gray-500 hover:bg-blue-50 hover:text-[#4A90E2]'"
            >
              <font-awesome-icon :icon="tab.icon" class="w-3.5 h-3.5 flex-shrink-0" />
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- ══════════ Employee Roster Tab ══════════ -->
        <div v-if="activeTab === 'employee-roster'" class="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div class="flex items-start justify-between gap-4 flex-wrap p-4 sm:p-5">
            <div>
              <h2 class="text-lg font-bold text-text-primary">Employee compensation</h2>
              <p class="text-sm text-text-muted mt-0.5 max-w-2xl">
                Review compensation, assigned policies, and projected salaries. Rows highlighted in amber have an increment due today or overdue.
              </p>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <ShineButton variant="teal" shape="xl" size="md" @click="applyIncrements">
                <font-awesome-icon :icon="['fas', 'check']" class="w-3.5 h-3.5" />
                Apply
              </ShineButton>

              <ShineButton variant="urgent" shape="xl" size="md" :badge="dueForIncrementCount" @click="forceIncrement">
                <font-awesome-icon :icon="['fas', 'bolt']" class="w-3.5 h-3.5" />
                Force Increment
              </ShineButton>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
              <tr class="border-t border-border-subtle">
                <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Employee</th>
                <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Salary</th>
                <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Assigned Policies</th>
                <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Increment Status</th>
                <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Projected</th>
              </tr>
              </thead>
              <tbody>
              <tr
                  v-for="(emp, i) in employees"
                  :key="emp.id"
                  class="border-t border-border-subtle transition"
                  :class="emp.incrementStatus === 'due_now' ? 'bg-amber-50/60 border-l-4 border-l-amber-400' : 'hover:bg-surface/50'"
              >
                <td class="px-4 sm:px-5 py-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" :class="[avatarStyle(i).bg, avatarStyle(i).text]">
                      {{ initials(emp.name) }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-text-primary truncate">{{ emp.name }}</p>
                      <p class="text-xs text-text-muted truncate">{{ emp.id }} · {{ emp.department }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 sm:px-5 py-4 font-semibold text-text-primary whitespace-nowrap">{{ formatCurrency(emp.salary) }}</td>
                <td class="px-4 sm:px-5 py-4 text-text-secondary">{{ emp.policies || '—' }}</td>
                <td class="px-4 sm:px-5 py-4">
                  <span
                      v-if="incrementStatusMeta(emp.incrementStatus).icon"
                      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                      :class="incrementStatusMeta(emp.incrementStatus).classes"
                  >
                    <font-awesome-icon :icon="incrementStatusMeta(emp.incrementStatus).icon" class="w-3 h-3" />
                    {{ emp.incrementLabel || incrementStatusMeta(emp.incrementStatus).label }}
                  </span>
                  <span v-else class="text-text-muted">—</span>
                </td>
                <td class="px-4 sm:px-5 py-4 whitespace-nowrap">
                  <p class="font-semibold text-text-primary">{{ formatCurrency(emp.projected) }}</p>
                  <p v-if="emp.delta" class="text-xs font-medium text-success">+{{ formatCurrency(emp.delta) }}</p>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ══════════ Policies Tab ══════════ -->
        <div v-if="activeTab === 'policies'">
          <div class="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h2 class="text-lg font-bold text-text-primary">Active increment policies</h2>
              <p class="text-sm text-text-muted mt-0.5">Define raise rules, edit details, and assign staff to each policy.</p>
            </div>

            <ShineButton variant="urgent" shape="pill" size="md" @click="openAddPolicyModal">
              <font-awesome-icon :icon="['fas', 'plus']" class="w-3.5 h-3.5" />
              Add new policy
            </ShineButton>
          </div>

          <div v-if="policiesLoading" class="bg-white border border-border rounded-xl shadow-sm text-center py-16">
            <font-awesome-icon icon="fa-solid fa-spinner" spin class="text-text-muted text-2xl" />
            <p class="text-text-secondary font-medium mt-3">Loading policies...</p>
          </div>

          <div v-else-if="policies.length === 0" class="bg-white border border-border rounded-xl shadow-sm text-center py-16">
            <div class="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-3">
              <font-awesome-icon :icon="['fas', 'file-lines']" class="text-text-muted text-lg" />
            </div>
            <p class="text-text-secondary font-medium">No policies added yet</p>
            <p class="text-sm text-text-muted mt-1">Active compensation policies will appear here.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
                v-for="(policy, i) in policies"
                :key="policy.id"
                class="relative bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"
                :class="cardBorderClass(policy)"
            >
              <div class="absolute top-0 left-0 right-0 h-1" :class="accentBar(i)"></div>

              <div class="p-4 sm:p-5 flex-1">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-display font-bold text-text-primary">{{ policy.policy_name }}</h3>
                  <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0"
                      :class="typeBadgeClasses(policy.application_mode_code)"
                  >
                    {{ policy.application_mode_code }}
                  </span>
                </div>

                <p class="text-2xl font-bold text-primary mt-2">{{ formatIncrement(policy) }}</p>

                <p v-if="policy.description" class="text-sm text-text-secondary mt-2 leading-relaxed">{{ policy.description }}</p>

                <p class="text-sm text-text-secondary mt-2">
                  <span class="font-semibold text-text-primary">Cycle:</span> {{ policy.cycle_timing_name }} ·
                  <span class="font-semibold text-text-primary">Next:</span>
                  <span :class="dateClass(policy)">{{ formatDate(policy.next_effective_date) }}</span>
                </p>

                <p class="text-sm text-text-muted mt-3 pt-3 border-t border-border-subtle">
                  <span v-if="!policy.is_active" class="text-warning font-semibold">Inactive</span>
                  <span v-else>Active</span>
                </p>
              </div>

              <div class="flex items-center gap-2 px-4 sm:px-5 pb-4 sm:pb-5">
                <ShineButton variant="outline" shape="xl" size="sm" class="flex-1" @click="editPolicy(policy)">
                  <font-awesome-icon :icon="['fas', 'pen']" class="w-3 h-3" />
                  Edit
                </ShineButton>

                <ShineButton variant="urgent" shape="xl" size="sm" class="flex-1" @click="assignPolicy(policy)">
                  <font-awesome-icon :icon="['fas', 'users']" class="w-3 h-3" />
                  Assign
                </ShineButton>

                <button
                    @click="confirmDeletePolicy(policy)"
                    class="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-border text-text-secondary hover:bg-danger-subtle hover:text-danger hover:border-danger/30 transition cursor-pointer shrink-0"
                    title="Delete policy"
                >
                  <font-awesome-icon :icon="['fas', 'trash']" class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- ══════════ Add / Edit Policy Modal ══════════ -->
    <BaseModal
        :is-open="showPolicyModal"
        mode="form"
        :title="policyModalTitle"
        :subtitle="policyModalSubtitle"
        submit-text="Save Policy"
        :loading="isSubmitting"
        @close="closePolicyModal"
        @save="handleSavePolicy"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

        <!-- Policy Name -->
        <div class="dash-field sm:col-span-2">
          <label>Policy Name</label>
          <input
              v-model="formData.policy_name"
              type="text"
              placeholder="e.g. Annual Merit Increase"
              class="w-full mt-1 px-3.5 py-2.5 rounded-lg border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              :class="formErrors.policy_name ? 'border-danger' : 'border-border'"
          />
          <p v-if="formErrors.policy_name" class="text-xs text-danger mt-1">{{ formErrors.policy_name }}</p>
        </div>

        <!-- Increment Type -->
        <div class="dash-field">
          <label>Increment Type</label>
          <select
              v-model="formData.increment_type"
              class="w-full mt-1 px-3.5 py-2.5 rounded-lg border text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              :class="formErrors.increment_type ? 'border-danger' : 'border-border'"
          >
            <option :value="null" disabled>Select type</option>
            <option v-for="type in incrementTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
          <p v-if="formErrors.increment_type" class="text-xs text-danger mt-1">{{ formErrors.increment_type }}</p>
        </div>

        <!-- Amount -->
        <div class="dash-field">
          <label>Amount</label>
          <input
              v-model.number="formData.amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 10"
              class="w-full mt-1 px-3.5 py-2.5 rounded-lg border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              :class="formErrors.amount ? 'border-danger' : 'border-border'"
          />
          <p v-if="formErrors.amount" class="text-xs text-danger mt-1">{{ formErrors.amount }}</p>
        </div>

        <!-- Cycle Timing -->
        <div class="dash-field">
          <label>Cycle / Timing</label>
          <select
              v-model="formData.cycle_timing"
              class="w-full mt-1 px-3.5 py-2.5 rounded-lg border text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              :class="formErrors.cycle_timing ? 'border-danger' : 'border-border'"
          >
            <option :value="null" disabled>Select cycle</option>
            <option v-for="cycle in cycleTimings" :key="cycle.id" :value="cycle.id">
              {{ cycle.name }}
            </option>
          </select>
          <p v-if="formErrors.cycle_timing" class="text-xs text-danger mt-1">{{ formErrors.cycle_timing }}</p>
        </div>

        <!-- Next Effective Date -->
        <div class="dash-field">
          <label>Next Effective Date</label>
          <input
              v-model="formData.next_effective_date"
              type="date"
              class="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <!-- Application Mode -->
        <div class="dash-field">
          <label>Application Mode</label>
          <select
              v-model="formData.application_mode"
              class="w-full mt-1 px-3.5 py-2.5 rounded-lg border text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              :class="formErrors.application_mode ? 'border-danger' : 'border-border'"
          >
            <option :value="null" disabled>Select mode</option>
            <option v-for="mode in applicationModes" :key="mode.id" :value="mode.id">
              {{ mode.name }}
            </option>
          </select>
          <p v-if="formErrors.application_mode" class="text-xs text-danger mt-1">{{ formErrors.application_mode }}</p>
        </div>

        <!-- Description -->
        <div class="dash-field sm:col-span-2">
          <label>Description <span class="text-text-secondary normal-case font-normal">(optional)</span></label>
          <textarea
              v-model="formData.description"
              rows="3"
              placeholder="Notes about this policy..."
              class="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          ></textarea>
        </div>

        <!-- Active toggle -->
        <div class="dash-field sm:col-span-2 flex items-center justify-between border border-border rounded-lg px-3.5 py-2.5">
          <div>
            <label class="!text-text-primary !normal-case !text-sm !font-semibold">Active</label>
            <p class="text-xs text-text-secondary mt-0.5">Inactive policies won't be applied automatically.</p>
          </div>
          <button
              type="button"
              @click="formData.is_active = !formData.is_active"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
              :class="formData.is_active ? 'bg-emerald-500' : 'bg-gray-300'"
          >
            <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="formData.is_active ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>

      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>