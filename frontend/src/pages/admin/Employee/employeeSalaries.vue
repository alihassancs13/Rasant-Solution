<script setup>
import {ref, computed, onMounted, nextTick, watch} from 'vue'
import AdminSidebar from '@/components/adminSidebar.vue'
import TopHeader from '@/components/header.vue'
import { useRouter, useRoute } from 'vue-router'
import StatCard from '@/components/statCard.vue'
import AppSkeleton from '@/components/AppSkeleton.vue'
import ShineButton from '@/components/ShineButton.vue'
import BaseModal from '@/components/baseModal.vue'
import BaseDetailModal from '@/components/baseDetailModal.vue'
import {useIncrementPolicy} from '@/composables/useIncrementPolicy.js'
import {useAssignPolicy} from '@/composables/useAssignPolicy.js'
import {useEmployeeStore} from '@/stores/employeeStore.js'
import { usePolicyStore } from '@/stores/policyStore'
import { usePayrollSettingsStore } from '../../../stores/payrollStore.js'
import { getCurrentPosition, reverseGeocodeLabel } from '@/composables/useGeolocation.js'
import ToastContainer from '@/components/ToastContainer.vue'
import { useValidation } from '@/composables/useValidation.js'
import { useToast } from '@/composables/useToast.js'

const policyStore = usePolicyStore()
const employeeStore = useEmployeeStore()
const payrollSettingsStore = usePayrollSettingsStore()
const { showToast } = useToast()

// ⚠️ IMPORTANT: Define employees FIRST before using it in composables
const employees = computed(() => employeeStore.employees)
const employeesLoading = computed(() => employeeStore.isLoading)

const showSaveSettingsModal = ref(false)
const highlightedEmployeeId = ref(null)
const router = useRouter()
const route = useRoute()
const payrollErrors = ref({
  grace_minutes: '',
  allowed_leaves_per_month: '',
  allowed_absents_per_month: '',
  overtime_rate_per_hour: '',
  late_count_threshold: '',
  office_radius_meters: '',
})

const {
  getGraceMinutesError, getAllowedPaidLimitError, getUnpaidAbsentsError,
  getOvertimeRateError, getFreeLatesError, getOfficeRadiusError,
  blockNonDigitKeydown, blockNonDigitPaste,
} = useValidation()

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

// ── Now use the composables with employees defined ──
const {
  formData, formErrors, isSubmitting,
  policies, loading: policiesLoading, incrementTypes, cycleTimings, applicationModes, activePolicies,
  formatCurrency, formatIncrement, cardBorderClass, dateClass,
  fetchPolicies, fetchLookups,
  toggleActive, isTogglingActive,
  showPolicyModal, policyModalTitle, policyModalSubtitle, policySubmitText,
  openAddPolicyModal, editPolicy, closePolicyModal, handleSavePolicy,
  showDeleteModal, policyToDelete, isDeleting, deleteModalSubtitle,
  openDeleteModal, closeDeleteModal, confirmDeletePolicy,
  assignments, assignmentsLoading, fetchAssignments, assignedPolicyNames, assignedPolicyList,
  hasAssignedPolicy, calculateProjection,
  assignedPolicyDetails, formatDueLabel, incrementStatusFor,
  showForceModal, isForcing, coveredEmployees,
  openForceModal, closeForceModal, confirmForceIncrement,
  showApplyModal, isApplying, overdueEmployees,
  selectedApplyIds, toggleApplySelection, toggleSelectAllApply, employeeDetail, isEmployeeDetailLoading,
  showEmployeeDetailModal, fetchEmployeeDetail,openEmployeeDetailModal, closeEmployeeDetailModal,
  openApplyModal, closeApplyModal, confirmApplyIncrement,isEmployeeDueToday,isEmployeeOverdue,
  bonusDraft, isSavingBonus, saveMonthlyBonus,blockNonNumericPaste,blockNonNumericAmount,getAmountError
} = useIncrementPolicy(employees)

// ── Assign policy modal (separate composable) ──
const {
  showAssignModal, assigningPolicy, selectedEmployeeIds, isSaving: isSavingAssignments, assignSubtitle,
  otherAssignedPolicies, toggleEmployeeSelection,
  assignPolicy, closeAssignModal, saveAssignments,
} = useAssignPolicy(employees, assignments)

function validatePayrollField(key) {
  const val = payrollSettings.value?.[key]
  switch (key) {
    case 'grace_minutes':
      payrollErrors.value.grace_minutes = getGraceMinutesError(val) || ''
      break
    case 'allowed_leaves_per_month':
      payrollErrors.value.allowed_leaves_per_month = getAllowedPaidLimitError(val) || ''
      break
    case 'allowed_absents_per_month':
      payrollErrors.value.allowed_absents_per_month = getUnpaidAbsentsError(val) || ''
      break
    case 'overtime_rate_per_hour':
      payrollErrors.value.overtime_rate_per_hour = getOvertimeRateError(val) || ''
      break
    case 'late_count_threshold':
      payrollErrors.value.late_count_threshold = getFreeLatesError(
          val, payrollSettings.value?.allowed_absents_per_month || 31
      ) || ''
      break
    case 'office_radius_meters':
      payrollErrors.value.office_radius_meters = getOfficeRadiusError(val) || ''
      break
  }
}

// Single source of truth for which fields get validated before a save — was
// duplicated 3x (openSaveSettingsModal + two identical confirmSavePayrollSettings).
const PAYROLL_VALIDATION_FIELDS = [
  'grace_minutes', 'allowed_leaves_per_month', 'allowed_absents_per_month',
  'overtime_rate_per_hour', 'late_count_threshold', 'office_radius_meters',
]
const validateAllPayrollFields = () => PAYROLL_VALIDATION_FIELDS.forEach(validatePayrollField)

const isPayrollFormValid = computed(() =>
    Object.values(payrollErrors.value).every((e) => !e)
)

function openSaveSettingsModal() {
  validateAllPayrollFields()
  if (!isPayrollFormValid.value) {
    showToast('Please fix the highlighted payroll fields.', 'error')
    return
  }
  showSaveSettingsModal.value = true
}

function closeSaveSettingsModal() {
  showSaveSettingsModal.value = false
}

async function confirmSavePayrollSettings() {
  validateAllPayrollFields()
  showSaveSettingsModal.value = false

  if (!isPayrollFormValid.value) {
    showToast('Please fix the highlighted payroll fields.', 'error')
    return
  }

  const result = await payrollSettingsStore.saveSettings(payrollSettingsStore.settings)
  showToast(
      result.success ? 'Payroll settings saved successfully.' : (result.error || 'Failed to save payroll settings.'),
      result.success ? 'success' : 'error'
  )
}

// ── Pill Tab Navigation ──
const tabs = [
  { key: 'employee-roster', label: 'Employee roster', icon: ['fas', 'users'] },
  { key: 'policies',        label: 'Policies',        icon: ['fas', 'file-lines'] },
  { key: 'payroll-settings', label: 'Payroll Settings', icon: ['fas', 'sliders'] },
]
const activeTab = ref('employee-roster')
const payrollSettings = computed(() => payrollSettingsStore.settings)
const isSavingPayrollSettings = computed(() => payrollSettingsStore.isSaving)
const isSettingOffice = computed(() => payrollSettingsStore.isSettingOffice)
const payrollSettingsLoading = computed(() => payrollSettingsStore.isLoading)
const payrollSettingsError = computed(() => payrollSettingsStore.error)
const holidays = computed(() => payrollSettingsStore.holidays)
const holidaysLoading = computed(() => payrollSettingsStore.holidaysLoading)
const holidaySaving = computed(() => payrollSettingsStore.holidaySaving)

const holidayForm = ref({ date: '', name: 'Holiday', note: '' })
const holidayYear = ref(new Date().getFullYear())

const fetchPayrollSettings = () => payrollSettingsStore.fetchSettings()
const fetchHolidays = () => payrollSettingsStore.fetchHolidays(holidayYear.value)

async function addHoliday() {
  if (!holidayForm.value.date) {
    showToast('Pick a holiday date.', 'error')
    return
  }
  const result = await payrollSettingsStore.createHoliday({
    date: holidayForm.value.date,
    name: holidayForm.value.name || 'Holiday',
    note: holidayForm.value.note || '',
  })
  if (result.success) {
    showToast(result.message || 'Holiday saved. Attendance marked for all employees.', 'success')
    holidayForm.value = { date: '', name: 'Holiday', note: '' }
  } else {
    showToast(result.error || 'Could not save holiday', 'error')
  }
}

async function removeHoliday(id) {
  const result = await payrollSettingsStore.deleteHoliday(id)
  showToast(
      result.success ? (result.message || 'Holiday removed.') : (result.error || 'Could not remove holiday'),
      result.success ? 'success' : 'error'
  )
}

async function captureOfficeLocation() {
  try {
    const coords = await getCurrentPosition()
    const address = await reverseGeocodeLabel(coords.latitude, coords.longitude)
    const result = await payrollSettingsStore.setOfficeFromDevice({ ...coords, address })
    showToast(
        result.success ? 'Office location saved from your current position.' : (result.error || 'Could not save office location'),
        result.success ? 'success' : 'error'
    )
  } catch (err) {
    showToast(err.message || 'Location permission required', 'error')
  }
}

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

watch(() => formData.increment_type, (val) => { if (val) formErrors.increment_type = '' })
watch(() => formData.cycle_timing, (val) => { if (val) formErrors.cycle_timing = '' })
watch(() => formData.application_mode, (val) => { if (val) formErrors.application_mode = '' })

const initials = (name) =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

// ── Force/Apply increment: refresh everything after applying ──
const refreshAfterIncrement = () => Promise.all([
  employeeStore.fetchEmployees(),
  fetchPolicies(),
  fetchAssignments(),
])

const handleConfirmForceIncrement = async () => {
  const result = await confirmForceIncrement()
  if (result.success) await refreshAfterIncrement()
}

const handleConfirmApplyIncrement = async () => {
  const result = await confirmApplyIncrement()
  if (result.success) await refreshAfterIncrement()
}

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

const prevEmployeePage = () => { if (employeePage.value > 1) employeePage.value-- }
const nextEmployeePage = () => { if (employeePage.value < totalEmployeePages.value) employeePage.value++ }

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
      if (i - l === 2) rangeWithDots.push(l + 1)
      else if (i - l !== 1) rangeWithDots.push('...')
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})

// ── Policy Pagination ──
const policyPage = ref(1)
const policiesPerPage = ref(4)

const totalPolicyPages = computed(() =>
    Math.ceil(policies.value.length / policiesPerPage.value) || 1
)

const paginatedPolicies = computed(() => {
  const start = (policyPage.value - 1) * policiesPerPage.value
  return policies.value.slice(start, start + policiesPerPage.value)
})

const prevPolicyPage = () => { if (policyPage.value > 1) policyPage.value-- }
const nextPolicyPage = () => { if (policyPage.value < totalPolicyPages.value) policyPage.value++ }

// ── Lifecycle ──
onMounted(async () => {
  fetchPolicies()
  fetchLookups()
  fetchAssignments()
  await employeeStore.fetchEmployees()
  if (route.query.highlightEmployee) {
    handleHighlightEmployee(Number(route.query.highlightEmployee))
  }
  fetchPayrollSettings()
  fetchHolidays()
})

watch(holidayYear, () => { fetchHolidays() })

watch(() => route.query.highlightEmployee, (newVal) => {
  if (newVal) handleHighlightEmployee(Number(newVal))
})
</script>

<template>
  <div class="flex h-screen bg-surface">
    <AdminSidebar />
    <ToastContainer />

    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="p-3 pl-1 sm:p-4 md:pl-4">
        <TopHeader
            userName="System Admin"
            role="admin"
            :notificationCount="1"
            titleOverride="Salaries"
            subtitleOverride="Compensation, policies & increments"
            @highlight-employee="handleHighlightEmployee"
            :iconOverride="['fas', 'money-bill']"
        />
      </div>

      <main class="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pb-4 space-y-4">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
              label="Employees Covered"
              :value="coveredEmployees.length"
              :icon="['fas', 'users']"
              color="pink"
          />
          <StatCard
              label="Active Policies"
              :value="activePolicies"
              :icon="['fas', 'clipboard-list']"
              color="purple"
          />
          <StatCard
              label="Total Policies"
              :value="policies.length"
              :icon="['fas', 'file-lines']"
              color="blue"
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
          <div class="p-4 sm:p-5">
            <!-- Title row -->
            <div>
              <h2 class="text-lg font-bold text-text-primary">Employee compensation</h2>
              <p class="text-sm text-text-muted mt-0.5 whitespace-nowrap">
                Review compensation, assigned policies, and projected salaries. Rows highlighted in amber have an increment due today or overdue.
              </p>
            </div>

            <!-- Controls row -->
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
                <ShineButton variant="teal" shape="xl" size="sm" @click="openApplyModal">
                  <font-awesome-icon :icon="['fas', 'user-check']" class="w-3 h-3" />
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

          <!-- Desktop/Tablet: Table view -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
              <tr class="border-t border-border-subtle">
                <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Employee</th>
                <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Salary</th>
                <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Net Salary</th>
                <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Assigned Policies</th>
                <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Increment Status</th>
                <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Projected</th>
                <th class="text-left px-4 sm:px-5 py-3 text-[11px] font-semibold text-text-muted tracking-wide uppercase">Actions</th>
              </tr>
              </thead>
              <tbody v-if="employeesLoading">
              <tr>
                <td colspan="7" class="px-4 sm:px-5 py-4">
                  <AppSkeleton variant="table" :count="6" />
                </td>
              </tr>
              </tbody>
              <tbody v-else-if="employees.length === 0">
              <tr>
                <td colspan="7" class="text-center py-16 text-text-muted">No employees found.</td>
              </tr>
              </tbody>
              <tbody v-else>
              <tr
                  v-for="(emp, i) in paginatedEmployees"
                  :key="emp.id"
                  :id="`employee-row-${emp.id}`"
                  class="border-t border-border-subtle hover:bg-surface/50 transition-colors"
                  :class="{ 'bg-warning-subtle ring-2 ring-inset ring-warning': emp.id === highlightedEmployeeId }"
                  @click="openEmployeeDetailModal(emp.id)"
              >
                <td class="px-4 sm:px-5 py-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" :class="[avatarStyle(i).bg, avatarStyle(i).text]">
                      {{ initials(emp.full_name) }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-text-primary truncate">{{ emp.full_name }}</p>
                      <p class="text-xs text-text-muted truncate">{{ emp.employee_number }} · {{ emp.department }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 sm:px-5 py-4 whitespace-nowrap">
                  <p class="font-semibold text-text-primary inline">{{ formatCurrency(emp.salary) }}</p>
                  <span
                      v-if="emp.raise_count"
                      class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold policy-mode-auto"
                  >
            +{{ emp.raise_count }} raises
          </span>
                </td>
                <td class="px-4 sm:px-5 py-4 whitespace-nowrap">
                  <p v-if="emp.net_salary" class="font-semibold text-success">{{ formatCurrency(emp.net_salary) }}</p>
                  <span v-else class="text-text-muted">—</span>
                </td>
                <td class="px-4 sm:px-5 py-4 text-text-secondary max-w-[220px]">
                  <div v-if="assignedPolicyDetails(emp.id).length" class="space-y-1">
                    <div v-for="d in assignedPolicyDetails(emp.id)" :key="d.id" class="break-words">
                      <span class="font-medium text-text-primary">{{ d.name }}</span>
                      <span class="text-xs text-text-muted"> · Next: {{ formatDate(d.nextDate) }}</span>
                    </div>
                  </div>
                  <span v-else>—</span>
                </td>
                <td class="px-4 sm:px-5 py-4">
          <span
              v-if="incrementStatusFor(emp)"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              :class="incrementStatusFor(emp).classes"
          >
            <font-awesome-icon v-if="incrementStatusFor(emp).icon" :icon="incrementStatusFor(emp).icon" class="w-3 h-3" />
            {{ incrementStatusFor(emp).label }}
          </span>
                  <span v-else class="text-text-muted">—</span>
                </td>
                <td class="px-4 sm:px-5 py-4 whitespace-nowrap">
                  <template v-if="hasAssignedPolicy(emp.id)">
                    <p class="font-semibold text-text-primary">{{ formatCurrency(calculateProjection(emp).projected) }}</p>
                    <p class="text-xs font-medium text-success">+{{ formatCurrency(calculateProjection(emp).increment) }}</p>
                  </template>
                  <span v-else class="text-text-muted">—</span>
                </td>
                <td class="px-4 sm:px-5 py-4 whitespace-nowrap">
                  <button
                      @click="openEmployeeDetailModal(emp.id)"
                      class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors text-text-muted hover:text-text-primary"
                      title="View Details"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="!employeesLoading && employees.length > 0 && totalEmployeePages > 1" class="pt-4 mt-2 px-4 sm:px-5 pb-4 border-t border-border-subtle flex items-center justify-between">
              <p class="text-xs text-text-muted">
                Showing {{ (employeePage - 1) * employeesPerPage + 1 }}–{{ Math.min(employeePage * employeesPerPage, employees.length) }}
                of {{ employees.length }}
              </p>
              <div class="flex items-center gap-1 flex-wrap justify-end">
                <button @click="prevEmployeePage" :disabled="employeePage === 1" class="p-2 rounded-lg border border-border bg-white hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-3 h-3 text-text-secondary" />
                </button>
                <template v-for="(p, index) in employeePaginationRange" :key="index">
                  <span v-if="p === '...'" class="w-8 h-8 flex items-center justify-center text-xs text-text-muted">…</span>
                  <button v-else @click="employeePage = p" :class="p === employeePage ? 'bg-gradient-to-r from-[#2F6FC4] via-[#3F7FD2] to-[#4A88D8] text-white border-transparent' : 'bg-primary-subtle text-primary border-primary/20 hover:bg-primary/10'" class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium border transition-all duration-300">
                    {{ p }}
                  </button>
                </template>
                <button @click="nextEmployeePage" :disabled="employeePage === totalEmployeePages" class="p-2 rounded-lg border border-border bg-white hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3 text-text-secondary" />
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile: Card view -->
          <div class="md:hidden">
            <div v-if="employeesLoading" class="p-4">
              <AppSkeleton variant="cards" :count="3" :cols="1" />
            </div>
            <div v-else-if="employees.length === 0" class="text-center py-16 text-text-muted">
              No employees found.
            </div>
            <div v-else class="space-y-3 p-4">
              <div
                  v-for="(emp, i) in paginatedEmployees"
                  :key="emp.id"
                  :id="`employee-row-${emp.id}`"
                  class="bg-white rounded-xl border shadow-sm p-4 space-y-3 transition-colors"
                  :class="emp.id === highlightedEmployeeId ? 'border-warning ring-2 ring-warning' : 'border-gray-100'"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" :class="[avatarStyle(i).bg, avatarStyle(i).text]">
                    {{ initials(emp.full_name) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-text-primary truncate">{{ emp.full_name }}</p>
                    <p class="text-xs text-text-muted truncate">{{ emp.employee_number }} · {{ emp.department }}</p>
                  </div>
                  <p class="font-semibold text-text-primary whitespace-nowrap">{{ formatCurrency(emp.salary) }}</p>
                </div>
                <div class="border-t border-gray-100"></div>
                <div class="grid grid-cols-2 gap-y-2.5 gap-x-3 text-xs">
                  <div class="col-span-2">
                    <p class="text-text-muted uppercase tracking-wide text-[10px] font-semibold mb-0.5">Policies</p>
                    <div v-if="assignedPolicyDetails(emp.id).length" class="space-y-1">
                      <div v-for="d in assignedPolicyDetails(emp.id)" :key="d.id" class="break-words text-text-secondary">
                        <span class="font-medium text-text-primary">{{ d.name }}</span>
                        <span class="text-text-muted"> · Next: {{ formatDate(d.nextDate) }}</span>
                      </div>
                    </div>
                    <p v-else class="text-text-secondary">—</p>
                  </div>
                  <div>
                    <p class="text-text-muted uppercase tracking-wide text-[10px] font-semibold mb-0.5">Increment Status</p>
                    <span
                        v-if="incrementStatusFor(emp)"
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        :class="incrementStatusFor(emp).classes"
                    >
                      <font-awesome-icon v-if="incrementStatusFor(emp).icon" :icon="incrementStatusFor(emp).icon" class="w-2.5 h-2.5" />
                      {{ incrementStatusFor(emp).label }}
                    </span>
                    <p v-else class="text-text-muted">—</p>
                  </div>
                  <div>
                    <p class="text-text-muted uppercase tracking-wide text-[10px] font-semibold mb-0.5">Projected</p>
                    <template v-if="hasAssignedPolicy(emp.id)">
                      <p class="font-semibold text-text-primary">{{ formatCurrency(calculateProjection(emp).projected) }}</p>
                      <p class="text-[11px] font-medium text-success">+{{ formatCurrency(calculateProjection(emp).increment) }}</p>
                    </template>
                    <p v-else class="text-text-muted">—</p>
                  </div>
                </div>
              </div>

              <!-- Mobile Pagination -->
              <div v-if="!employeesLoading && employees.length > 0 && totalEmployeePages > 1" class="pt-2 flex items-center justify-between">
                <button @click="prevEmployeePage" :disabled="employeePage === 1" class="p-2 rounded-lg border border-border bg-white hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <font-awesome-icon icon="fa-solid fa-chevron-left" class="w-3 h-3 text-text-secondary" />
                </button>
                <p class="text-xs text-text-muted">Page {{ employeePage }} of {{ totalEmployeePages }}</p>
                <button @click="nextEmployeePage" :disabled="employeePage === totalEmployeePages" class="p-2 rounded-lg border border-border bg-white hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <font-awesome-icon icon="fa-solid fa-chevron-right" class="w-3 h-3 text-text-secondary" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ══════════ Policies Tab ══════════ -->
        <div v-if="activeTab === 'policies'">
          <div class="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div>
              <h2 class="text-lg font-bold text-text-primary">Active increment policies</h2>
              <p class="text-sm text-text-muted mt-0.5">Define raise rules, edit details, and assign staff to each policy.</p>
            </div>
            <button
                @click="openAddPolicyModal"
                class="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-xl shadow-md transition-all duration-300 cursor-pointer btn-primary-gradient"
            >
              <font-awesome-icon :icon="['fas', 'plus']" class="w-3.5 h-3.5" />
              Add new policy
            </button>
          </div>

          <div v-if="policiesLoading" class="py-2">
            <AppSkeleton variant="cards" :count="3" :cols="3" />
          </div>

          <div v-else-if="policies.length === 0" class="bg-white border border-border rounded-xl shadow-sm text-center py-16">
            <div class="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-3">
              <font-awesome-icon :icon="['fas', 'file-lines']" class="text-text-muted text-lg" />
            </div>
            <p class="text-text-secondary font-medium">No policies added yet</p>
            <p class="text-sm text-text-muted mt-1">Active compensation policies will appear here.</p>
          </div>

          <div v-else>
            <div class="relative px-8 sm:px-10">
              <!-- Left Arrow -->
              <button
                  v-if="totalPolicyPages > 1"
                  @click="prevPolicyPage"
                  :disabled="policyPage === 1"
                  class="absolute left-0 sm:-left-2 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-border shadow-md hover:shadow-lg hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <font-awesome-icon :icon="['fas', 'chevron-left']" class="w-4 h-4 text-text-secondary" />
              </button>

              <!-- Grid with 4 columns -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div
                    v-for="policy in paginatedPolicies"
                    :key="policy.id"
                    class="relative bg-white rounded-xl shadow-sm overflow-hidden flex flex-col"
                    :class="cardBorderClass(policy)"
                >
                  <div class="absolute top-0 left-0 right-0 h-1 policy-accent-brand"></div>

                  <div class="p-4 sm:p-5 flex-1">
                    <div class="flex items-start justify-between gap-2">
                      <h3 class="font-display font-bold text-text-primary break-words min-w-0 flex-1 text-sm">{{ policy.policy_name }}</h3>
                      <span
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0"
                          :class="{ 'policy-mode-auto': policy.application_mode_code === 'auto', 'policy-mode-manual': policy.application_mode_code === 'manual' }"
                      >
                {{ policy.application_mode_code }}
              </span>
                    </div>

                    <p class="text-2xl font-bold text-primary mt-2">{{ formatIncrement(policy) }}</p>
                    <p v-if="policy.description" class="text-sm text-text-secondary mt-2 leading-relaxed line-clamp-2">{{ policy.description }}</p>

                    <p class="text-sm text-text-secondary mt-2">
                      <span class="font-semibold text-text-primary">Cycle:</span> {{ policy.cycle_timing_name }} ·
                      <span class="font-semibold text-text-primary">Next:</span>
                      <span :class="dateClass(policy)">{{ formatDate(policy.next_effective_date) }}</span>
                    </p>


                  </div>

                  <div class="flex items-center gap-2 px-4 sm:px-5 pb-4 sm:pb-5">
                    <button
                        @click="editPolicy(policy)"
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer btn-gradient-border hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <font-awesome-icon :icon="['fas', 'pen']" class="w-3 h-3" />
                      Edit
                    </button>

                    <button
                        @click="assignPolicy(policy)"
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all duration-300 cursor-pointer btn-primary-gradient"
                    >
                      <font-awesome-icon :icon="['fas', 'users']" class="w-3 h-3" />
                      Assign
                    </button>

                    <button
                        v-if="!policyStore.isPolicyAssigned(policy.id)"
                        @click="openDeleteModal(policy)"
                        class="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-border text-text-secondary hover:bg-danger-subtle hover:text-danger hover:border-danger/30 transition cursor-pointer shrink-0"
                        title="Delete policy"
                    >
                      <font-awesome-icon :icon="['fas', 'trash']" class="w-3.5 h-3.5" />
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
        <!-- ══════════ Payroll Settings Tab ══════════ -->
        <div v-if="activeTab === 'payroll-settings'" class="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div class="p-4 sm:p-5">
            <h2 class="text-lg font-bold text-text-primary">Payroll Settings</h2>
            <p class="text-sm text-text-muted mt-0.5">
              Global rules used to calculate attendance-based deductions and overtime for Contract &amp; Permanent staff.
              Intern and Probation statuses are exempt from leave / absent / late payroll deductions.
            </p>
          </div>

          <div v-if="payrollSettingsLoading" class="py-2 px-4 sm:px-5">
            <AppSkeleton variant="form" :count="6" />
          </div>

          <div v-else class="px-4 sm:px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">

            <div class="dash-field">
              <label>Grace Minutes</label>
              <input v-model.number="payrollSettings.grace_minutes" type="number" min="0" max="480"
                     @keydown="blockNonDigitKeydown($event, { maxDigits: 3, currentValue: payrollSettings.grace_minutes })"
                     @paste="blockNonDigitPaste($event, { maxDigits: 3 })"
                     @input="validatePayrollField('grace_minutes')"
                     class="w-full mt-1 px-3.5 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                     :class="payrollErrors.grace_minutes ? 'border-danger' : 'border-border'" />
              <p v-if="payrollErrors.grace_minutes" class="text-xs text-danger mt-1">{{ payrollErrors.grace_minutes }}</p>
              <p v-else class="text-xs text-text-muted mt-1">Late arrival window with no deduction (minutes).</p>
            </div>

            <div class="dash-field">
              <label>Allowed Paid Leaves / Month</label>
              <input v-model.number="payrollSettings.allowed_leaves_per_month" type="number" min="0" max="31"
                     @keydown="blockNonDigitKeydown($event, { maxDigits: 2, currentValue: payrollSettings.allowed_leaves_per_month })"
                     @paste="blockNonDigitPaste($event, { maxDigits: 2 })"
                     @input="validatePayrollField('allowed_leaves_per_month')"
                     class="w-full mt-1 px-3.5 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                     :class="payrollErrors.allowed_leaves_per_month ? 'border-danger' : 'border-border'" />
              <p v-if="payrollErrors.allowed_leaves_per_month" class="text-xs text-danger mt-1">{{ payrollErrors.allowed_leaves_per_month }}</p>
              <p v-else class="text-xs text-text-muted mt-1">Leaves beyond this limit become unpaid.</p>
            </div>

            <div class="dash-field">
              <label>Allowed Unpaid-Free Absents / Month</label>
              <!-- NAYA -->
              <input v-model.number="payrollSettings.allowed_absents_per_month" type="number" min="0" max="31"
                     @keydown="blockNonDigitKeydown($event, { maxDigits: 2, currentValue: payrollSettings.allowed_absents_per_month })"
                     @paste="blockNonDigitPaste($event, { maxDigits: 2 })"
                     @input="validatePayrollField('allowed_absents_per_month')"

                     class="w-full mt-1 px-3.5 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                     :class="payrollErrors.allowed_absents_per_month ? 'border-danger' : 'border-border'" />
              <p v-if="payrollErrors.allowed_absents_per_month" class="text-xs text-danger mt-1">{{ payrollErrors.allowed_absents_per_month }}</p>
              <p v-else class="text-xs text-text-muted mt-1">Absents beyond this limit become unpaid.</p>
            </div>

            <div class="dash-field">
              <label>Overtime Rate / Hour</label>
              <!-- NAYA -->
              <input v-model.number="payrollSettings.overtime_rate_per_hour" type="number" step="0.01" min="0" max="1000"
                     @keydown="blockNonDigitKeydown($event, { allowDecimal: true, maxDigits: 4, currentValue: payrollSettings.overtime_rate_per_hour })"
                     @paste="blockNonDigitPaste($event, { allowDecimal: true, maxDigits: 4 })"
                     @input="validatePayrollField('overtime_rate_per_hour')"
                     class="w-full mt-1 px-3.5 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                     :class="payrollErrors.overtime_rate_per_hour ? 'border-danger' : 'border-border'" />
              <p v-if="payrollErrors.overtime_rate_per_hour" class="text-xs text-danger mt-1">{{ payrollErrors.overtime_rate_per_hour }}</p>
            </div>

            <div class="dash-field">
              <label>Default Shift (self check-in)</label>
              <input v-model="payrollSettings.default_timetable" type="text"
                     placeholder="10 - 7"
                     class="w-full mt-1 px-3.5 py-2.5 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <p class="text-xs text-text-muted mt-1">Used when employees punch in from Overview (e.g. 10 - 7).</p>
            </div>

            <div class="dash-field">
              <label>Office Radius (meters)</label>
              <!-- NAYA -->
              <input v-model.number="payrollSettings.office_radius_meters" type="number" min="10" max="5000"
                     @keydown="blockNonDigitKeydown($event, { maxDigits: 4, currentValue: payrollSettings.office_radius_meters })"
                     @paste="blockNonDigitPaste($event, { maxDigits: 4 })"
                     @input="validatePayrollField('office_radius_meters')"
                     class="w-full mt-1 px-3.5 py-2.5 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                     :class="payrollErrors.office_radius_meters ? 'border-danger' : 'border-border'" />
              <p v-if="payrollErrors.office_radius_meters" class="text-xs text-danger mt-1">{{ payrollErrors.office_radius_meters }}</p>
              <p v-else class="text-xs text-text-muted mt-1">Check-ins inside this radius are marked In office.</p>
            </div>

            <div class="sm:col-span-2 rounded-md border border-border bg-surface/50 p-4">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="text-sm font-bold text-text-primary">Office location</h3>
                  <p class="text-xs text-text-muted mt-1 max-w-xl">
                    Stand at the office and click the button — we save your current GPS pin the same way employees check in.
                  </p>
                  <p v-if="payrollSettings.office_configured" class="text-xs text-emerald-700 mt-2 font-medium">
                    Office pin set
                    <span v-if="payrollSettings.office_latitude != null">
                      · {{ payrollSettings.office_latitude }}, {{ payrollSettings.office_longitude }}
                    </span>
                  </p>
                  <p v-else class="text-xs text-amber-700 mt-2 font-medium">Office pin not set yet.</p>
                  <p v-if="payrollSettings.office_address" class="text-xs text-text-muted mt-1">{{ payrollSettings.office_address }}</p>
                </div>
                <ShineButton
                    variant="blue"
                    shape="xl"
                    size="sm"
                    :loading="isSettingOffice"
                    @click="captureOfficeLocation"
                >
                  <font-awesome-icon :icon="['fas', 'location-crosshairs']" class="w-3 h-3" />
                  Use my current location
                </ShineButton>
              </div>
            </div>

            <div class="sm:col-span-2 flex justify-end pt-2">
              <ShineButton variant="teal" shape="xl" size="sm" @click="openSaveSettingsModal">
                <font-awesome-icon :icon="['fas', 'floppy-disk']" class="w-3 h-3" />
                Save Settings
              </ShineButton>
            </div>

            <div class="sm:col-span-2 mt-2 rounded-md border border-border bg-surface/50 p-4">
              <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 class="text-sm font-bold text-text-primary">Company holidays</h3>
                  <p class="text-xs text-text-muted mt-1 max-w-xl">
                    Set a date as holiday — attendance is auto-marked <span class="font-semibold">Holiday</span> for all employees.
                    Holidays and weekends are excluded from absent / late salary deductions.
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <label class="text-xs text-text-muted">Year</label>
                  <input
                      v-model.number="holidayYear"
                      type="number"
                      min="2020"
                      max="2100"
                      class="w-24 px-2.5 py-1.5 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                <div class="dash-field sm:col-span-1">
                  <label>Date</label>
                  <input v-model="holidayForm.date" type="date"
                         class="w-full mt-1 px-3.5 py-2.5 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div class="dash-field sm:col-span-1">
                  <label>Name</label>
                  <input v-model="holidayForm.name" type="text" placeholder="E.g. Independence Day"
                         class="w-full mt-1 px-3.5 py-2.5 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div class="dash-field sm:col-span-1">
                  <label>Note (optional)</label>
                  <input v-model="holidayForm.note" type="text" placeholder="Optional note"
                         class="w-full mt-1 px-3.5 py-2.5 rounded-md border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div class="flex items-end">
                  <ShineButton variant="blue" shape="xl" size="sm" class="w-full sm:w-auto" :loading="holidaySaving" @click="addHoliday">
                    <font-awesome-icon :icon="['fas', 'plus']" class="w-3 h-3" />
                    Add holiday
                  </ShineButton>
                </div>
              </div>

              <div v-if="holidaysLoading" class="py-2">
                <AppSkeleton variant="table" :count="4" />
              </div>
              <div v-else-if="!holidays.length" class="text-sm text-text-muted py-4 text-center border border-dashed border-border rounded-md">
                No holidays set for {{ holidayYear }}.
              </div>
              <div v-else class="overflow-x-auto rounded-md border border-border">
                <table class="min-w-full text-sm">
                  <thead class="bg-surface text-left text-text-muted">
                  <tr>
                    <th class="px-3 py-2 font-semibold">Date</th>
                    <th class="px-3 py-2 font-semibold">Name</th>
                    <th class="px-3 py-2 font-semibold">Note</th>
                    <th class="px-3 py-2 font-semibold w-24"></th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="h in holidays" :key="h.id" class="border-t border-border">
                    <td class="px-3 py-2.5 text-text-primary whitespace-nowrap">{{ h.date }}</td>
                    <td class="px-3 py-2.5 text-text-primary">{{ h.name }}</td>
                    <td class="px-3 py-2.5 text-text-muted">{{ h.note || '—' }}</td>
                    <td class="px-3 py-2.5 text-right">
                      <button
                          type="button"
                          class="text-red-600 hover:text-red-700 text-xs font-semibold cursor-pointer disabled:opacity-50"
                          :disabled="holidaySaving"
                          @click="removeHoliday(h.id)"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>

    <!-- ══════════ Modals ══════════ -->
    <!-- Add/Edit Policy Modal -->
    <BaseModal
        :is-open="showPolicyModal"
        mode="form"
        :title="policyModalTitle"
        :subtitle="policyModalSubtitle"
        :submit-text="policySubmitText"
        :loading="isSubmitting"
        body-class="!max-h-[80vh]"
        @close="closePolicyModal"
        @save="handleSavePolicy"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
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

        <div class="dash-field">
          <label>Amount</label>
          <input
              v-model="formData.amount"
              type="text"
              inputmode="decimal"
              @keydown="blockNonNumericAmount"
              @paste="blockNonNumericPaste"
              @input="formErrors.amount = getAmountError(formData.amount) || ''"
              placeholder="e.g. 5000"
              class="w-full mt-1 px-3.5 py-2.5 rounded-md border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              :class="formErrors.amount ? 'border-danger' : 'border-border'"
          />

          <p v-if="formErrors.amount" class="text-xs text-danger mt-1">
            {{ formErrors.amount }}
          </p>
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

        <div class="dash-field sm:col-span-2">
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

    <!-- Delete Policy Modal -->
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

    <!-- Assign Policy Modal -->
    <BaseModal
        :is-open="showAssignModal"
        mode="form"
        :title="`Assign: ${assigningPolicy?.policy_name}`"
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
            Also: {{ otherAssignedPolicies(emp) }}
          </span>
        </label>
      </div>
    </BaseModal>

    <!-- Force Increment Modal -->
    <BaseModal
        :is-open="showForceModal"
        mode="form"
        title="Force increment"
        subtitle="Every employee below will have all their assigned active policies applied immediately."
        submit-text="Force apply"
        :loading="isForcing"
        @close="closeForceModal"
        @save="handleConfirmForceIncrement"
    >
      <div v-if="coveredEmployees.length === 0" class="text-center py-10 text-text-muted">
        No employees are currently assigned to an active policy.
      </div>

      <div v-else class="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        <div
            v-for="(emp, i) in coveredEmployees"
            :key="emp.id"
            class="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" :class="[avatarStyle(i).bg, avatarStyle(i).text]">
              {{ initials(emp.full_name) }}
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-text-primary truncate">{{ emp.full_name }}</p>
              <p class="text-xs text-text-muted truncate">{{ assignedPolicyNames(emp.id) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 whitespace-nowrap text-sm font-semibold">
            <span class="text-text-primary">{{ formatCurrency(emp.salary) }}</span>
            <span class="text-text-muted font-normal">+</span>
            <span class="text-success">{{ formatCurrency(calculateProjection(emp).increment) }}</span>
            <span class="text-text-muted font-normal">=</span>
            <span class="text-primary">{{ formatCurrency(calculateProjection(emp).projected) }}</span>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- Apply Increment Modal -->
    <BaseModal
        :is-open="showApplyModal"
        mode="form"
        title="Apply increments"
        subtitle="Employees with overdue or due today increments. Check the ones you want to apply now."
        submit-text="Apply increments"
        :loading="isApplying"
        @close="closeApplyModal"
        @save="handleConfirmApplyIncrement"
    >
      <div v-if="overdueEmployees.length === 0" class="text-center py-10 text-text-muted">
        <font-awesome-icon :icon="['fas', 'circle-check']" class="text-success text-2xl mb-2" />
        <p>No overdue or due today increments right now. You're all caught up.</p>
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p class="text-sm text-text-muted">{{ selectedApplyIds.length }} of {{ overdueEmployees.length }} selected</p>
          <button
              type="button"
              @click="toggleSelectAllApply"
              class="text-sm font-semibold text-primary hover:underline cursor-pointer"
          >
            {{ selectedApplyIds.length === overdueEmployees.length ? 'Unselect all' : 'Select all' }}
          </button>
        </div>

        <div class="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          <label
              v-for="(emp, i) in overdueEmployees"
              :key="emp.id"
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3 sm:px-4 py-3 rounded-lg border border-border cursor-pointer hover:bg-surface/50 transition"
          >
            <!-- Left section: Checkbox + Employee info -->
            <div class="flex items-center gap-3 min-w-0 w-full sm:w-auto">
              <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-border shrink-0 checked:bg-[image:var(--gradient-icon-brand)] checked:border-transparent"
                  :checked="selectedApplyIds.includes(emp.id)"
                  @change="toggleApplySelection(emp.id)"
              />
              <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0" :class="[avatarStyle(i).bg, avatarStyle(i).text]">
                {{ initials(emp.full_name) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-text-primary truncate text-sm sm:text-base">{{ emp.full_name }}</p>
                <p class="text-xs text-text-muted truncate">{{ assignedPolicyNames(emp.id) || 'No policies' }}</p>
              </div>
            </div>

            <!-- Right section: Badge + Salary calculation -->
            <div class="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto pl-7 sm:pl-0">
              <!-- Badge -->
              <span
                  v-if="isEmployeeOverdue(emp)"
                  class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-danger-subtle text-danger shrink-0"
              >
                        <font-awesome-icon :icon="['fas', 'clock']" class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span class="hidden xs:inline">Overdue</span>
                        <span class="xs:hidden">Due</span>
                    </span>
              <span
                  v-else-if="isEmployeeDueToday(emp)"
                  class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-warning-subtle text-warning shrink-0"
              >
                        <font-awesome-icon :icon="['fas', 'bell']" class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span class="hidden xs:inline">Due Today</span>
                        <span class="xs:hidden">Today</span>
                    </span>

              <!-- Salary calculation - mobile friendly -->
              <div class="text-xs sm:text-sm font-semibold text-right sm:text-left whitespace-nowrap">
                <span class="text-text-primary">{{ formatCurrency(emp.salary) }}</span>
                <span class="text-text-muted font-normal"> + </span>
                <span class="text-success">{{ formatCurrency(calculateProjection(emp).increment) }}</span>
                <span class="text-text-muted font-normal hidden xs:inline"> = </span>
                <span class="text-primary hidden xs:inline">{{ formatCurrency(calculateProjection(emp).projected) }}</span>
              </div>
            </div>
          </label>
        </div>
      </div>
    </BaseModal>

    <!-- Save Payroll Settings Confirmation -->
    <BaseModal
        :is-open="showSaveSettingsModal"
        mode="form"
        title="Save payroll settings?"
        subtitle="This will update the active payroll rules."
        submit-text="Yes, save settings"
        :loading="isSavingPayrollSettings"
        @close="closeSaveSettingsModal"
        @save="confirmSavePayrollSettings"
    >
      <div class="space-y-2 text-sm text-text-secondary">
        <div class="flex justify-between"><span>Grace Minutes</span><span class="font-semibold text-text-primary">{{ payrollSettings.grace_minutes }}</span></div>
        <div class="flex justify-between"><span>Allowed Paid Leaves / Month</span><span class="font-semibold text-text-primary">{{ payrollSettings.allowed_leaves_per_month }}</span></div>
        <div class="flex justify-between"><span>Allowed Unpaid-Free Absents / Month</span><span class="font-semibold text-text-primary">{{ payrollSettings.allowed_absents_per_month }}</span></div>
        <div class="flex justify-between"><span>Overtime Rate / Hour</span><span class="font-semibold text-text-primary">{{ formatCurrency(payrollSettings.overtime_rate_per_hour) }}</span></div>
        <div class="flex justify-between"><span>Free Lates Before Penalty</span><span class="font-semibold text-text-primary">{{ payrollSettings.late_count_threshold }}</span></div>
      </div>
    </BaseModal>

    <BaseDetailModal
        :is-open="showEmployeeDetailModal"
        title="Employee Details"
        size="lg"
        :item-id="employeeDetail?.employee_number"
        @close="closeEmployeeDetailModal">

      <!-- Loading -->
      <div v-if="isEmployeeDetailLoading" class="py-2">
        <AppSkeleton variant="detail" />
      </div>

      <div v-else-if="employeeDetail" class="p-0">

        <!-- Header -->
        <div class="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
          <div class="flex items-start gap-3">
            <div class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-200">
              <font-awesome-icon :icon="['fas', 'user']" class="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p class="text-[15px] font-semibold text-gray-900 leading-snug">
                {{ employeeDetail.name }}
              </p>
              <p class="text-xs text-gray-400 mt-0.5 font-mono">
                {{ employeeDetail.employee_number }}
              </p>
            </div>
          </div>

          <span class="flex-shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-full
                 bg-blue-50 text-blue-600 border border-blue-200 uppercase tracking-wide whitespace-nowrap">
        {{ employeeDetail.status }}
      </span>
        </div>

        <!-- Contact + Employment Info : single compact row -->
        <div class="flex items-stretch justify-between bg-gray-50 rounded-xl border border-gray-100 mb-4 divide-x divide-gray-200 overflow-hidden">

          <div class="flex-1 min-w-0 px-3 py-2.5">
            <p class="text-[9.5px] font-medium text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <font-awesome-icon :icon="['fas', 'envelope']" class="w-2.5 h-2.5" />
              Email
            </p>
            <p class="text-xs text-gray-800 font-medium truncate" :title="employeeDetail.email">
              {{ employeeDetail.email }}
            </p>
          </div>

          <div class="flex-1 min-w-0 px-3 py-2.5">
            <p class="text-[9.5px] font-medium text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <font-awesome-icon :icon="['fas', 'phone']" class="w-2.5 h-2.5" />
              Phone
            </p>
            <p class="text-xs text-gray-800 font-medium truncate">
              {{ employeeDetail.phone_number }}
            </p>
          </div>

          <div class="flex-1 min-w-0 px-3 py-2.5">
            <p class="text-[9.5px] font-medium text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <font-awesome-icon :icon="['fas', 'building']" class="w-2.5 h-2.5" />
              Department
            </p>
            <p class="text-xs text-gray-800 font-medium truncate">
              {{ employeeDetail.department }}
            </p>
          </div>

          <div class="flex-1 min-w-0 px-3 py-2.5">
            <p class="text-[9.5px] font-medium text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <font-awesome-icon :icon="['far', 'calendar']" class="w-2.5 h-2.5" />
              Joined
            </p>
            <p class="text-xs text-gray-800 font-medium truncate">
              {{ employeeDetail.joined_date || 'N/A' }}
            </p>
          </div>

        </div>

        <!-- Salary Breakdown Card -->
        <div class="rounded-xl p-[1px] bg-gradient-to-r from-blue-200 via-orange-100 to-blue-200">
          <div class="rounded-[11px] bg-white p-3.5">

            <label class="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
              Salary Breakdown
            </label>

            <!-- Base vs Current -->
            <div class="grid grid-cols-2 gap-2.5 mb-2.5">
              <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Base Salary</p>
                <p class="text-sm font-semibold text-gray-700">
                  {{ formatCurrency(employeeDetail.base_salary) }}
                </p>
              </div>
              <div class="p-2.5 bg-blue-50 rounded-lg border border-blue-300">
                <p class="text-[10px] text-blue-700 uppercase tracking-wide mb-0.5">Current Salary</p>
                <p class="text-sm font-bold text-blue-600 uppercase">
                  {{ formatCurrency(employeeDetail.current_salary) }}
                </p>
              </div>
            </div>

            <!-- Attendance Summary (new) -->
            <div v-if="employeeDetail.total_days" class="grid grid-cols-4 gap-1.5 mb-2.5 text-center">
              <div class="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-[9px] text-gray-400 uppercase tracking-wide">Present</p>
                <p class="text-xs font-semibold text-gray-700">{{ employeeDetail.present_days ?? '—' }}</p>
              </div>
              <div class="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-[9px] text-gray-400 uppercase tracking-wide">Unpaid Leave</p>
                <p class="text-xs font-semibold text-gray-700">{{ employeeDetail.unpaid_leave_days ?? '—' }}</p>
              </div>
              <div class="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-[9px] text-gray-400 uppercase tracking-wide">Unpaid Absent</p>
                <p class="text-xs font-semibold text-gray-700">{{ employeeDetail.unpaid_absent_days ?? '—' }}</p>
              </div>
              <div class="p-1.5 bg-gray-50 rounded-lg border border-gray-100">
                <p class="text-[9px] text-gray-400 uppercase tracking-wide">Lates</p>
                <p class="text-xs font-semibold text-gray-700">{{ employeeDetail.late_count ?? '—' }}</p>
              </div>
            </div>

            <!-- Deductions -->
            <div class="space-y-1.5 mb-2.5">
              <div v-if="employeeDetail.unpaid_leave_days || employeeDetail.unpaid_absent_days" class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 text-gray-500">
              <font-awesome-icon :icon="['fas', 'calendar-xmark']" class="w-3 h-3 text-gray-300" />
              Off Days ({{ (employeeDetail.unpaid_leave_days || 0) + (employeeDetail.unpaid_absent_days || 0) }} unpaid)
            </span>
                <span class="text-red-500 font-medium">
              - {{ formatCurrency((employeeDetail.attendance_deduction_total || 0) - (employeeDetail.late_penalty_amount || 0)) }}
            </span>
              </div>

              <div v-if="employeeDetail.late_penalty_amount" class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 text-gray-500">
              <font-awesome-icon :icon="['fas', 'clock']" class="w-3 h-3 text-gray-300" />
              Late Penalty ({{ employeeDetail.late_count }} lates)
            </span>
                <span class="text-red-500 font-medium">- {{ formatCurrency(employeeDetail.late_penalty_amount) }}</span>
              </div>

              <div v-if="employeeDetail.overtime_amount" class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 text-gray-500">
              <font-awesome-icon :icon="['fas', 'business-time']" class="w-3 h-3 text-gray-300" />
              Overtime ({{ employeeDetail.overtime_hours }} hrs)
            </span>
                <span class="text-success font-medium">+ {{ formatCurrency(employeeDetail.overtime_amount) }}</span>
              </div>

              <div class="flex items-center justify-between gap-2 text-xs py-1">
                <span class="flex items-center gap-1.5 text-gray-500">
                  <font-awesome-icon :icon="['fas', 'gift']" class="w-3 h-3 text-gray-300" />
                  Bonus (this month)
                </span>
                <div class="flex items-center gap-2">
                  <input
                      v-model.number="bonusDraft"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-28 px-2 py-1 rounded-md border border-border text-xs text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                      type="button"
                      class="px-2.5 py-1 rounded-md bg-primary text-white text-[11px] font-semibold disabled:opacity-50 cursor-pointer"
                      :disabled="isSavingBonus"
                      @click="saveMonthlyBonus"
                  >
                    {{ isSavingBonus ? 'Saving…' : 'Save' }}
                  </button>
                </div>
              </div>

              <p
                  v-if="employeeDetail.payroll_deductions_applied === false"
                  class="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5"
              >
                Leave / absent / late payroll settings do not apply for {{ employeeDetail.status }} employees.
              </p>

              <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 text-gray-500">
              <font-awesome-icon :icon="['fas', 'file-invoice-dollar']" class="w-3 h-3 text-gray-300" />
              Tax ({{ employeeDetail.tax_percent }}%)
            </span>
                <span class="text-red-500 font-medium">- {{ formatCurrency(employeeDetail.tax_amount) }}</span>
              </div>

              <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1.5 text-gray-500">
              Insurance
              <font-awesome-icon :icon="['fas', 'shield-halved']" class="w-3 h-3 text-gray-300" />
            </span>
                <span class="text-red-500 font-medium">- {{ formatCurrency(employeeDetail.insurance_amount) }}</span>
              </div>
            </div>

            <!-- Net Salary Highlight -->
            <div class="flex items-center justify-between rounded-lg  bg-blue-50 border border-blue-300 px-3 py-2.5">
              <span class="text-[10px] text-blue-700 uppercase tracking-wide">Total Salary</span>
              <span class="text-base font-bold text-blue-600">{{ formatCurrency(employeeDetail.net_salary ?? employeeDetail.current_salary) }}</span>
            </div>
          </div>
        </div>
      </div>
    </BaseDetailModal>
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