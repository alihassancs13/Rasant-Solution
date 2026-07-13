<script setup>
import {ref, computed, onMounted,  nextTick,watch} from 'vue'
import AdminSidebar from '@/components/adminSidebar.vue'
import TopHeader from '@/components/header.vue'
import { useRouter, useRoute } from 'vue-router'
import StatCard from '@/components/statCard.vue'
import ShineButton from '@/components/ShineButton.vue'
import BaseModal from '@/components/baseModal.vue'
import {useIncrementPolicy} from '@/composables/useIncrementPolicy.js'
import {useAssignPolicy} from '@/composables/useAssignPolicy.js'
import {useEmployeeStore} from '@/stores/employeeStore.js'
import { usePolicyStore } from '@/stores/policyStore';
const policyStore = usePolicyStore();
const employeeStore = useEmployeeStore()
const employeesCovered = ref(3)
const dueNow = ref(1)
const highlightedEmployeeId = ref(null)
const router = useRouter()
const route = useRoute()

function handleHighlightEmployee(employeeId) {
  activeTab.value = 'employee-roster'
  const index = employees.value.findIndex(e => e.id === employeeId)
  if (index !== -1) {
    employeePage.value = Math.floor(index / employeesPerPage.value) + 1
  }

  highlightedEmployeeId.value = employeeId

  nextTick(() => {
    document.getElementById(`employee-row-${employeeId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  })
  router.replace({ query: {} })

  setTimeout(() => {
    if (highlightedEmployeeId.value === employeeId) {
      highlightedEmployeeId.value = null
    }
  }, 3000)
}
const handleConfirmForceIncrement = async () => {
  await confirmForceIncrement()
  await employeeStore.fetchEmployees()
}

const {
  formData,
  formErrors,
  isSubmitting,
  policies,
  loading: policiesLoading,
  incrementTypes,
  cycleTimings,
  applicationModes,
  activePolicies,
  formatCurrency,
  formatIncrement,
  cardBorderClass,
  dateClass,
  fetchPolicies,
  fetchLookups,
  toggleActive,
  isTogglingActive,
  showPolicyModal,
  policyModalTitle,
  policyModalSubtitle,
  policySubmitText,
  openAddPolicyModal,
  editPolicy,
  closePolicyModal,
  handleSavePolicy,
  showDeleteModal,
  policyToDelete,
  isDeleting,
  deleteModalSubtitle,
  openDeleteModal,
  closeDeleteModal,
  confirmDeletePolicy,
  assignments,
  assignmentsLoading,
  fetchAssignments,
  assignedPolicyNames,
  showForceModal, isForcing, openForceModal, closeForceModal, confirmForceIncrement,
} = useIncrementPolicy()

// ── Pill Tab Navigation ──
const tabs = [
  {key: 'employee-roster', label: 'Employee roster', icon: ['fas', 'users']},
  {key: 'policies', label: 'Policies', icon: ['fas', 'file-lines']},
]
const activeTab = ref('employee-roster')

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

const avatarPalette = [
  {bg: 'bg-teal-200', text: 'text-teal-700'},
  {bg: 'bg-blue-200', text: 'text-blue-700'},
  {bg: 'bg-purple-200', text: 'text-purple-700'},
  {bg: 'bg-pink-200', text: 'text-pink-700'},
  {bg: 'bg-amber-200', text: 'text-amber-700'},
]
const avatarStyle = (index) => avatarPalette[index % avatarPalette.length]

const initials = (name) =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
const employees = computed(() => employeeStore.employees)
const employeesLoading = computed(() => employeeStore.isLoading)
const incrementStatusMeta = (status) => ({
  approved: {label: 'Approved', icon: ['fas', 'circle-check'], classes: 'policy-mode-auto'},
  due_soon: {label: 'Due in 7d', icon: ['fas', 'clock'], classes: 'policy-mode-manual'},
  due_now: {label: 'Due now', icon: ['fas', 'circle-exclamation'], classes: 'policy-mode-manual'},
  none: {label: '—', icon: null, classes: 'text-text-muted'},
}[status] || {label: '—', icon: null, classes: 'text-text-muted'})

const applyIncrements = () => {
}
const forceIncrement = () => {
}

// ── Assign policy modal (separate composable) ──
const {
  showAssignModal, assigningPolicy, selectedEmployeeIds, isSaving: isSavingAssignments, assignSubtitle,
  otherAssignedPolicies, toggleEmployeeSelection,
  assignPolicy, closeAssignModal, saveAssignments,
} = useAssignPolicy(employees, assignments)

onMounted(async () => {
  fetchPolicies()
  fetchLookups()
  fetchAssignments()
  await employeeStore.fetchEmployees()
  if (route.query.highlightEmployee) {
    handleHighlightEmployee(Number(route.query.highlightEmployee))
  }
})

watch(() => route.query.highlightEmployee, (newVal) => {
  if (newVal) {
    handleHighlightEmployee(Number(newVal))
  }
})

// ── Pagination ──
const employeePage = ref(1)
const employeesPerPage = ref(10)

const totalEmployeePages = computed(() =>
  Math.ceil(employees.value.length / employeesPerPage.value) || 1
)

const paginatedEmployees = computed(() => {
  const start = (employeePage.value - 1) * employeesPerPage.value
  return employees.value.slice(start, start + employeesPerPage.value)
})

const prevEmployeePage = () => {
  if (employeePage.value > 1) employeePage.value--
}
const nextEmployeePage = () => {
  if (employeePage.value < totalEmployeePages.value) employeePage.value++
}

const employeePaginationRange = computed(() => {
  const total = totalEmployeePages.value
  const current = employeePage.value
  const delta = 1
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  for (const i of range) {
    if (l !== undefined) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})

// ── Policy Pagination ──
const policyPage = ref(1)
const policiesPerPage = ref(3)

const totalPolicyPages = computed(() =>
  Math.ceil(policies.value.length / policiesPerPage.value) || 1
)

const paginatedPolicies = computed(() => {
  const start = (policyPage.value - 1) * policiesPerPage.value
  return policies.value.slice(start, start + policiesPerPage.value)
})

const prevPolicyPage = () => {
  if (policyPage.value > 1) policyPage.value--
}
const nextPolicyPage = () => {
  if (policyPage.value < totalPolicyPages.value) policyPage.value++
}
</script>

<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar/>

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <TopHeader
         userName="System Admin"
         role="admin"
        :notificationCount="1"
        titleOverride="Salaries"
        subtitleOverride="Compensation, policies & increments"
        @highlight-employee="handleHighlightEmployee"/>
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-4 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
              label="Employees Covered"
              :value="employeesCovered"

              :icon="['fas', 'users']"
              color="pink"
          />
          <StatCard
              label="Due Now"
              :value="dueNow"

              :icon="['fas', 'circle-exclamation']"
              color="yellow"
          />
          <StatCard
              label="Active Policies"
              :value="activePolicies"

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
              <font-awesome-icon :icon="tab.icon" class="w-3.5 h-3.5 flex-shrink-0"/>
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- ══════════ Employee Roster Tab ══════════ -->
       <div v-if="activeTab === 'employee-roster'"
     class="bg-white border border-border rounded-xl shadow-sm overflow-hidden">

  <div class="p-4 sm:p-5">
    <!-- Title row -->
    <div>
     <h2 class="text-lg font-bold text-text-primary">Employee compensation</h2>
     <p class="text-sm text-text-muted mt-0.5 whitespace-nowrap">
      Review compensation, assigned policies, and projected salaries. Rows highlighted in amber have an increment due today or overdue.
     </p>
    </div>

    <!-- Controls row: Show entries (left) + Actions (right) -->
    <div class="flex items-center justify-between gap-4 flex-wrap mt-4">
      <div class="flex items-center gap-2 text-sm text-text-muted">
        <span class="text-sm">Show</span>
        <select
            v-model="employeesPerPage"
            @change="employeePage = 1"
            class="border border-border rounded-lg px-2 py-1 text-xs bg-white focus:ring-2 focus:ring-primary/30 outline-none"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
        <span class="text-sm">entries</span>
        <div class="ml-1 px-3 py-1 bg-surface-alt border border-border rounded-lg text-sm font-medium text-text-primary">
          {{ employees.length }} employees
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <ShineButton variant="teal" shape="xl" size="sm" @click="applyIncrements">
          <font-awesome-icon :icon="['fas', 'user-check']" class="w-3 h-3"/>
          Apply
        </ShineButton>

        <button
            class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg shadow-md transition-all duration-300 cursor-pointer btn-primary-gradient"
            @click="openForceModal"
        >
          <font-awesome-icon :icon="['fas', 'bolt']" class="w-3 h-3" />
          Force Increment
        </button>
      </div>
    </div>
  </div>

  <div>

    <!-- Desktop/Tablet: Table view -->
    <div class="hidden md:block overflow-x-auto">
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
        <tbody v-if="employeesLoading">
        <tr v-for="i in 3" :key="i">
          <td colspan="5" class="px-4 sm:px-5 py-4">
            <div class="h-4 bg-border rounded w-full max-w-xs animate-pulse"></div>
          </td>
        </tr>
        </tbody>

        <tbody v-else-if="employees.length === 0">
        <tr>
          <td colspan="5" class="text-center py-16 text-text-muted">No employees found.</td>
        </tr>
        </tbody>

        <tbody v-else>
        <tr
         v-for="(emp, i) in paginatedEmployees"
         :key="emp.id"
         :id="`employee-row-${emp.id}`"
         class="border-t border-border-subtle hover:bg-surface/50 transition-colors"
         :class="{ 'bg-warning-subtle ring-2 ring-inset ring-warning': emp.id === highlightedEmployeeId }"
         >
          <td class="px-4 sm:px-5 py-4">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                   :class="[avatarStyle(i).bg, avatarStyle(i).text]">
                {{ initials(emp.full_name) }}
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-text-primary truncate">{{ emp.full_name }}</p>
                <p class="text-xs text-text-muted truncate">{{ emp.employee_number }} · {{ emp.department }}</p>
              </div>
            </div>
          </td>
          <td class="px-4 sm:px-5 py-4 font-semibold text-text-primary whitespace-nowrap">{{ formatCurrency(emp.salary) }}</td>
          <td class="px-4 sm:px-5 py-4 text-text-secondary max-w-[220px] break-all">{{ assignedPolicyNames(emp.id) || '—' }}</td>
          <td class="px-4 sm:px-5 py-4 text-text-muted">—</td>
          <td class="px-4 sm:px-5 py-4 text-text-muted">—</td>
        </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="!employeesLoading && employees.length > 0 && totalEmployeePages > 1"
           class="pt-4 mt-2 px-4 sm:px-5 pb-4 border-t border-border-subtle flex items-center justify-between">
        <p class="text-xs text-text-muted">
          Showing {{ (employeePage - 1) * employeesPerPage + 1 }}–{{ Math.min(employeePage * employeesPerPage, employees.length) }}
          of {{ employees.length }}
        </p>
        <div class="flex items-center gap-1 flex-wrap justify-end">
          <button @click="prevEmployeePage" :disabled="employeePage === 1"
              class="p-2 rounded-lg border border-border bg-white hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-3 h-3 text-text-secondary" />
          </button>

          <template v-for="(p, index) in employeePaginationRange" :key="index">
            <span v-if="p === '...'" class="w-8 h-8 flex items-center justify-center text-xs text-text-muted">…</span>
            <button v-else @click="employeePage = p"
                :class="p === employeePage
                ? 'bg-gradient-to-r from-[#2F6FC4] via-[#3F7FD2] to-[#4A88D8] text-white border-transparent'
                : 'bg-primary-subtle text-primary border-primary/20 hover:bg-primary/10'"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium border transition-all duration-300">
              {{ p }}
            </button>
          </template>

          <button @click="nextEmployeePage" :disabled="employeePage === totalEmployeePages"
              class="p-2 rounded-lg border border-border bg-white hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3 text-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  <!-- Mobile: Card view -->
  <div class="md:hidden">
    <div v-if="employeesLoading" class="space-y-3 p-4">
      <div v-for="i in 3" :key="i" class="h-24 bg-border rounded-xl animate-pulse"></div>
    </div>

    <div v-else-if="employees.length === 0" class="text-center py-16 text-text-muted">
      No employees found.
    </div>

    <div v-else class="space-y-3 p-4">
      <div
       v-for="(emp, i) in employees"
       :key="emp.id"
       :id="`employee-row-${emp.id}`"
       class="bg-white rounded-xl border shadow-sm p-4 space-y-3 transition-colors"
      :class="emp.id === highlightedEmployeeId ? 'border-warning ring-2 ring-warning' : 'border-gray-100'">
        <!-- Top row: avatar + name + salary -->
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
               :class="[avatarStyle(i).bg, avatarStyle(i).text]">
            {{ initials(emp.full_name) }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-text-primary truncate">{{ emp.full_name }}</p>
            <p class="text-xs text-text-muted truncate">{{ emp.employee_number }} · {{ emp.department }}</p>
          </div>
          <p class="font-semibold text-text-primary whitespace-nowrap">{{ formatCurrency(emp.salary) }}</p>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-100"></div>

        <!-- Details grid -->
        <div class="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs">
          <div class="col-span-2">
            <p class="text-text-muted uppercase tracking-wide text-[10px] font-semibold mb-0.5">Policies</p>
            <p class="text-text-secondary break-words">{{ assignedPolicyNames(emp.id) || '—' }}</p>
          </div>
          <div>
            <p class="text-text-muted uppercase tracking-wide text-[10px] font-semibold mb-0.5">Increment Status</p>
            <p class="text-text-muted">—</p>
          </div>
          <div>
            <p class="text-text-muted uppercase tracking-wide text-[10px] font-semibold mb-0.5">Projected</p>
            <p class="text-text-muted">—</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</div>

        <!-- ══════════ Policies Tab ══════════ -->
<div v-if="activeTab === 'policies'">
  <div class="flex items-start justify-between gap-4 flex-wrap mb-4">
    <div>
      <h2 class="text-lg font-bold text-text-primary">Active increment policies</h2>
      <p class="text-sm text-text-muted mt-0.5">Define raise rules, edit details, and assign staff to each
        policy.</p>
    </div>

    <button
        @click="openAddPolicyModal"
        class="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-xl shadow-md transition-all duration-300 cursor-pointer btn-primary-gradient"
    >
      <font-awesome-icon :icon="['fas', 'plus']" class="w-3.5 h-3.5"/>
      Add new policy
    </button>
  </div>

  <div v-if="policiesLoading" class="bg-white border border-border rounded-xl shadow-sm text-center py-16">
    <font-awesome-icon icon="fa-solid fa-spinner" spin class="text-text-muted text-2xl"/>
    <p class="text-text-secondary font-medium mt-3">Loading policies...</p>
  </div>

  <div v-else-if="policies.length === 0"
       class="bg-white border border-border rounded-xl shadow-sm text-center py-16">
    <div class="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-3">
      <font-awesome-icon :icon="['fas', 'file-lines']" class="text-text-muted text-lg"/>
    </div>
    <p class="text-text-secondary font-medium">No policies added yet</p>
    <p class="text-sm text-text-muted mt-1">Active compensation policies will appear here.</p>
  </div>

  <div v-else>
    <!-- Carousel wrapper with side arrows -->
    <div class="relative px-8 sm:px-10">
      <!-- Left Arrow -->
   <button
    v-if="totalPolicyPages > 1"
    @click="prevPolicyPage"
    :disabled="policyPage === 1"
    class="absolute left-0 sm:-left-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-border shadow-md hover:shadow-lg hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition">
    <font-awesome-icon :icon="['fas', 'chevron-left']" class="w-4 h-4 text-text-secondary" />
  </button>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
            v-for="(policy, i) in paginatedPolicies"
            :key="policy.id"
            class="relative bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"
            :class="cardBorderClass(policy)"
        >
          <div class="absolute top-0 left-0 right-0 h-1 policy-accent-brand"></div>

          <div class="p-4 sm:p-5 flex-1">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-display font-bold text-text-primary break-words min-w-0 flex-1">{{
                  policy.policy_name
                }}</h3>
              <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0"
                  :class="{ 'policy-mode-auto': policy.application_mode_code === 'auto', 'policy-mode-manual': policy.application_mode_code === 'manual' }"
              >
              {{ policy.application_mode_code }}
            </span>
            </div>

            <p class="text-2xl font-bold text-primary mt-2">{{ formatIncrement(policy) }}</p>
            <p v-if="policy.description" class="text-sm text-text-secondary mt-2 leading-relaxed">
              {{ policy.description }}</p>

            <p class="text-sm text-text-secondary mt-2">
              <span class="font-semibold text-text-primary">Cycle:</span> {{ policy.cycle_timing_name }} ·
            </p>
          </div>

          <div class="flex items-center gap-2 px-4 sm:px-5 pb-4 sm:pb-5">
            <button
                @click="editPolicy(policy)"
                class="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer btn-gradient-border hover:-translate-y-0.5 hover:shadow-md"
            >
              <font-awesome-icon :icon="['fas', 'pen']" class="w-3 h-3"/>
              Edit
            </button>

            <button
                @click="assignPolicy(policy)"
                class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all duration-300 cursor-pointer btn-primary-gradient"
            >
              <font-awesome-icon :icon="['fas', 'users']" class="w-3 h-3"/>
              Assign
            </button>

            <button
             v-if="!policyStore.isPolicyAssigned(policy.id)"
             :disabled="policyStore.isPolicyAssigned(policy.id)"
             @click="openDeleteModal(policy)"
             class="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-border text-text-secondary hover:bg-danger-subtle hover:text-danger hover:border-danger/30 transition cursor-pointer shrink-0"
             title="Delete policy">
           <font-awesome-icon :icon="['fas', 'trash']" class="w-3.5 h-3.5"/>
           </button>
          </div>
        </div>
      </div>

      <!-- Right Arrow -->
    <button
    v-if="totalPolicyPages > 1"
    @click="nextPolicyPage"
    :disabled="policyPage === totalPolicyPages"
    class="absolute right-0 sm:-right-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-border shadow-md hover:shadow-lg hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
       >
     <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-4 h-4 text-text-secondary" />
    </button>
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
        :submit-text="policySubmitText"
        :loading="isSubmitting"
        @close="closePolicyModal"
        @save="handleSavePolicy"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">

        <!-- Row 1: Policy Name | Increment Type -->
        <div class="dash-field">
          <label>Policy Name</label>
          <input
              v-model="formData.policy_name"
              type="text"
              placeholder="e.g. Annual Merit Raise"
              class="w-full mt-1 px-3.5 py-2.5 rounded-md border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              :class="formErrors.policy_name ? 'border-danger' : 'border-border'"
          />
          <p v-if="formErrors.policy_name" class="text-xs text-danger mt-1">{{ formErrors.policy_name }}</p>
        </div>

        <div class="dash-field">
          <label>Increment Type</label>
          <select
              v-model="formData.increment_type"
              class="w-full mt-1 px-3.5 py-2.5 rounded-md border text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              :class="formErrors.increment_type ? 'border-danger' : 'border-border'"
          >
            <option :value="null" disabled>Select type</option>
            <option v-for="type in incrementTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
          <p v-if="formErrors.increment_type" class="text-xs text-danger mt-1">{{ formErrors.increment_type }}</p>
        </div>

        <!-- Row 2: Amount | Cycle/Timing -->
        <div class="dash-field">
          <label>Amount</label>
          <input
              v-model.number="formData.amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="10 or 5000"
              class="w-full mt-1 px-3.5 py-2.5 rounded-md border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              :class="formErrors.amount ? 'border-danger' : 'border-border'"
          />
          <p v-if="formErrors.amount" class="text-xs text-danger mt-1">{{ formErrors.amount }}</p>
        </div>

        <div class="dash-field">
          <label>Cycle / Timing</label>
          <select
              v-model="formData.cycle_timing"
              class="w-full mt-1 px-3.5 py-2.5 rounded-md border text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              :class="formErrors.cycle_timing ? 'border-danger' : 'border-border'"
          >
            <option :value="null" disabled>Select cycle</option>
            <option v-for="cycle in cycleTimings" :key="cycle.id" :value="cycle.id">
              {{ cycle.name }}
            </option>
          </select>
          <p v-if="formErrors.cycle_timing" class="text-xs text-danger mt-1">{{ formErrors.cycle_timing }}</p>
        </div>


        <div class="dash-field">
          <label>Application Mode</label>
          <select
              v-model="formData.application_mode"
              class="w-full mt-1 px-3.5 py-2.5 rounded-md border text-sm text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              :class="formErrors.application_mode ? 'border-danger' : 'border-border'"
          >
            <option :value="null" disabled>Select mode</option>
            <option v-for="mode in applicationModes" :key="mode.id" :value="mode.id">
              {{ mode.name }}
            </option>
          </select>
          <p v-if="formErrors.application_mode" class="text-xs text-danger mt-1">{{ formErrors.application_mode }}</p>
        </div>

        <!-- Row 4: Description (full width) -->
        <div class="dash-field sm:col-span-2">
          <label>Description <span class="text-text-secondary normal-case font-normal">(optional)</span></label>
          <textarea
              v-model="formData.description"
              rows="3"
              placeholder="Who qualifies, performance criteria, notes..."
              class="w-full mt-1 px-3.5 py-2.5 rounded-md border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          ></textarea>
        </div>

      </div>
    </BaseModal>

    <!-- ══════════ Delete Policy Modal ══════════ -->
    <BaseModal
        :is-open="showDeleteModal"
        mode="delete"
        title="Delete policy?"
        :subtitle="deleteModalSubtitle"
        cancel-text="Keep policy"
        submit-text="Yes, delete"
        :loading="isDeleting"
        @close="closeDeleteModal"
        @save="confirmDeletePolicy"
    />
    <!-- ══════════ Force Increment Confirmation Modal ══════════ -->
    <BaseModal
        :is-open="showForceModal"
        mode="confirm"
        title="Force increment?"
        subtitle="Apply all assigned policies to every covered employee, regardless of due date."
        cancel-text="Cancel"
        submit-text="Force apply"
        :loading="isForcing"
        @close="closeForceModal"
        @save="handleConfirmForceIncrement"
    />
    <!-- ══════════ Assign Policy Modal ══════════ -->
    <BaseModal
        :is-open="showAssignModal"
        mode="form"
        :title="`Assign ${assigningPolicy?.policy_name}`"
        :subtitle="assignSubtitle"
        submit-text="Save assignments"
        :loading="isSavingAssignments"
        @close="closeAssignModal"
        @save="saveAssignments"
    >
      <p class="text-sm text-text-muted mb-4">
        Check employees to assign this policy. Uncheck to remove them from this policy.
      </p>

      <div class="space-y-3">
        <label
            v-for="(emp, i) in employees"
            :key="emp.id"
            class="flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-lg border border-border cursor-pointer hover:bg-surface/50 transition"
        >
          <div class="flex items-center gap-3 min-w-0">
            <input
                type="checkbox"
                class="w-4 h-4 rounded border-border shrink-0 checked:bg-[image:var(--gradient-icon-brand)] checked:border-transparent"
                :checked="selectedEmployeeIds.includes(emp.id)"
                @change="toggleEmployeeSelection(emp.id)"
            />
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" :class="[avatarStyle(i).bg, avatarStyle(i).text]">
              {{ initials(emp.full_name) }}
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-text-primary truncate">{{ emp.full_name }}</p>
              <p class="text-xs text-text-muted truncate">{{ emp.employee_number }} · {{ emp.department }}</p>
            </div>
          </div>

          <span
              v-if="otherAssignedPolicies(emp)"
              class="min-w-0 w-full sm:w-auto sm:max-w-[60%] px-2.5 py-1 rounded-md text-xs font-semibold bg-warning-subtle text-warning break-words"
          >
         {{ otherAssignedPolicies(emp) }}
      </span>
        </label>
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