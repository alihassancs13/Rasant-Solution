import { reactive, ref, computed } from 'vue'
import { usePolicyStore } from '@/stores/policyStore.js'
import { useToast } from './useToast.js'

export function useIncrementPolicy(employees) {
    const policyStore = usePolicyStore()
    const { showToast } = useToast()
    const policyPage = ref(1)
    const policiesPerPage = ref(4)

    const formData = reactive({
        id: null,
        policy_name: '',
        increment_type: null,
        amount: null,
        cycle_timing: null,
        application_mode: null,
        description: '',
        is_active: true,
    })
    const formErrors = reactive({})

    const isSubmitting     = computed(() => policyStore.isSubmitting)
    const policies         = computed(() => policyStore.policies)
    const loading          = computed(() => policyStore.isLoading)
    const incrementTypes   = computed(() => policyStore.incrementTypes)
    const cycleTimings     = computed(() => policyStore.cycleTimings)
    const applicationModes = computed(() => policyStore.applicationModes)
    const activePolicies   = computed(() => policies.value.filter(p => p.is_active).length)
    const isTogglingActive = ref(null)
    const assignments        = computed(() => policyStore.assignments)
    const assignmentsLoading = computed(() => policyStore.isLoadingAssignments)

    const formatCurrency = (amount) =>
        amount || amount === 0
            ? `₨${Math.round(Number(amount)).toLocaleString('en-US')}`
            : '—'
    const totalPolicyPages = computed(() =>
        Math.ceil(policies.value.length / policiesPerPage.value) || 1
    )
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
        (isOverdue(policy.next_effective_date) && isDueSoon(policy.next_effective_date))
            ? 'text-danger font-semibold'
            : 'text-text-primary font-semibold'

    const validateForm = () => {
        Object.keys(formErrors).forEach((key) => delete formErrors[key])

        if (!formData.policy_name.trim()) formErrors.policy_name = 'Policy name is required.'
        if (!formData.increment_type)     formErrors.increment_type = 'Increment type is required.'
        if (formData.amount === null || formData.amount === '') formErrors.amount = 'Amount is required.'
        if (!formData.cycle_timing)       formErrors.cycle_timing = 'Cycle/timing is required.'
        if (!formData.application_mode)   formErrors.application_mode = 'Application mode is required.'

        return Object.keys(formErrors).length === 0
    }

    const resetForm = () => {
        Object.assign(formData, {
            id: null, policy_name: '', increment_type: null, amount: null,
            cycle_timing: null, application_mode: null,
            description: '', is_active: true,
        })
        Object.keys(formErrors).forEach((key) => delete formErrors[key])
    }

    const loadIntoForm = (policy) => {
        Object.assign(formData, {
            id: policy.id,
            policy_name: policy.policy_name,
            increment_type: policy.increment_type,
            amount: policy.amount,
            cycle_timing: policy.cycle_timing,
            application_mode: policy.application_mode,
            description: policy.description || '',
            is_active: policy.is_active,
        })
    }

    const fetchPolicies = async () => {
        const result = await policyStore.fetchPolicies()
        if (!result.success) showToast(result.error, 'error')
    }

    const fetchLookups = async () => {
        const result = await policyStore.fetchLookups()
        if (!result.success) showToast(result.error, 'error')
    }

    const savePolicy = async () => {
        if (!validateForm()) {
            showToast('Please fix the highlighted fields.', 'error')
            return null
        }

        const payload = { ...formData }
        delete payload.id

        const result = formData.id
            ? await policyStore.updatePolicy(formData.id, payload)
            : await policyStore.createPolicy(payload)

        if (result.success) {
            showToast(formData.id ? 'Policy updated.' : 'Policy created.', 'success')
            return result.data
        }
        if (typeof result.error === 'object') Object.assign(formErrors, result.error)
        showToast('Failed to save policy.', 'error')
        return null
    }

    // ── Policy add/edit modal ──
    const showPolicyModal = ref(false)

    const policyModalTitle = computed(() => formData.id ? 'Edit policy' : 'Create Policy')
    const policyModalSubtitle = computed(() =>
        formData.id
            ? `Update increment rules`
            : 'Define raise rules for a new policy.'
    )
    const policySubmitText = computed(() => formData.id ? 'Save Policy' : 'Create Policy')

    const openAddPolicyModal = () => { resetForm(); showPolicyModal.value = true }
    const editPolicy = (policy) => { loadIntoForm(policy); showPolicyModal.value = true }
    const closePolicyModal = () => { showPolicyModal.value = false; resetForm() }

    const handleSavePolicy = async () => {
        const saved = await savePolicy()
        if (saved) closePolicyModal()
    }

    // ── Delete confirmation modal ──
    const showDeleteModal = ref(false)
    const policyToDelete  = ref(null)
    const isDeleting       = ref(false)

    const deleteModalSubtitle = computed(() => {
        if (!policyToDelete.value) return ''
        return `Remove "${policyToDelete.value.policy_name}" from active policies? Assigned employees will keep other policies only.`
    })

    const openDeleteModal = (policy) => {
        policyToDelete.value = policy
        showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
        showDeleteModal.value = false
        policyToDelete.value = null
    }

    const confirmDeletePolicy = async () => {
        if (!policyToDelete.value) return
        isDeleting.value = true
        const result = await policyStore.deletePolicy(policyToDelete.value.id)
        isDeleting.value = false

        showToast(result.success ? 'Policy deleted.' : (result.error || 'Failed to delete policy.'), result.success ? 'success' : 'error')

        if (result.success) closeDeleteModal()
    }

    const toggleActive = async (policy) => {
        isTogglingActive.value = policy.id
        const result = await policyStore.updatePolicy(policy.id, { is_active: !policy.is_active })
        isTogglingActive.value = null

        if (result.success) {
            showToast(result.data.is_active ? 'Policy activated.' : 'Policy marked inactive.', 'success')
        } else {
            showToast('Failed to update policy status.', 'error')
        }
    }

    const fetchAssignments = async () => {
        const result = await policyStore.fetchAssignments()
        if (!result.success) showToast(result.error, 'error')
    }

    const assignedPolicyNames = (employeeId) => {
        const names = assignments.value
            .filter(a => a.employee === employeeId)
            .map(a => a.policy_name)
        return names.length ? names.join(', ') : null
    }

    const assignedPolicyList = (employeeId) =>
        assignments.value.filter(a => a.employee === employeeId).map(a => a.policy_name)

    const hasAssignedPolicy = (employeeId) =>
        assignments.value.some(a => a.employee === employeeId)

    // Replicates the backend's compounding logic (sequential, ordered by policy id)
    // purely for UI preview — actual numbers are only committed on Force Apply.
    const calculateProjection = (employee) => {
        const empAssignments = assignments.value
            .filter(a => a.employee === employee.id)
            .slice()
            .sort((a, b) => a.policy - b.policy)

        if (!empAssignments.length) return { projected: null, increment: 0 }

        let running = Number(employee.salary) || 0
        for (const a of empAssignments) {
            const policy = policies.value.find(p => p.id === a.policy)
            if (!policy || !policy.is_active) continue
            const amt = Number(policy.amount)
            const inc = policy.increment_type_code === 'percentage' ? (running * amt) / 100 : amt
            running += inc
        }
        return { projected: running, increment: running - (Number(employee.salary) || 0) }
    }

    const todayStr = () => new Date().toISOString().split('T')[0]

    // ── Per-employee next effective date ──
    // Each employee's next effective date is anchored to THEIR OWN joined_date,
    // not a single shared date on the policy. Two employees on the same monthly
    // policy but joined on different days will have different due dates.
    // Once an increment has actually been applied (employee.increment_applied_on),
    // the date rolls forward to the next cycle on that same joined_date grid —
    // it does not restart from the applied date, it just advances past it.
    const CYCLE_MONTHS_MAP = {
        monthly: 1,
        bi_monthly: 2,
        bimonthly: 2,
        quarterly: 3,
        tri_annual: 4,
        half_yearly: 6,
        semi_annual: 6,
        semiannual: 6,
        annual: 12,
        yearly: 12,
    }

    const getCycleMonths = (cycleCode, cycleName) => {
        const key = String(cycleCode || '').toLowerCase().replace(/[\s-]/g, '_')
        if (CYCLE_MONTHS_MAP[key] != null) return CYCLE_MONTHS_MAP[key]

        const name = String(cycleName || '').toLowerCase()
        if (name.includes('quarter')) return 3
        if (name.includes('semi') || name.includes('half')) return 6
        if (name.includes('annual') || name.includes('year')) return 12
        if (name.includes('month')) return 1
        return 12 // safe fallback if an unrecognised cycle name comes from the backend
    }

    const addMonths = (dateStr, months) => {
        const d = new Date(dateStr)
        d.setMonth(d.getMonth() + months)
        return d
    }

    // Returns 'YYYY-MM-DD' or null if the employee has no joined_date on record.
    const computeNextEffectiveDate = (employee, policy) => {
        if (!employee?.joined_date || !policy) return null

        const cycleMonths = getCycleMonths(policy.cycle_timing_code, policy.cycle_timing_name)
        let next = addMonths(employee.joined_date, cycleMonths)

        // Advance past the last actually-applied increment so a paid cycle
        // doesn't keep showing as due/overdue.
        const lastApplied = employee.increment_applied_on ? new Date(employee.increment_applied_on) : null
        while (lastApplied && next <= lastApplied) {
            next = addMonths(next.toISOString().split('T')[0], cycleMonths)
        }

        return next.toISOString().split('T')[0]
    }

    // Returns [{ id, name, nextDate, cycleCode }] for one employee's assigned policies.
    // nextDate is computed per-employee from their joined_date, not read off the policy.
    const assignedPolicyDetails = (employeeId) => {
        const employee = (employees?.value ?? []).find(e => e.id === employeeId)

        return assignments.value
            .filter(a => a.employee === employeeId)
            .map(a => policies.value.find(p => p.id === a.policy))
            .filter(Boolean)
            .map(p => ({
                id: p.id,
                name: p.policy_name,
                nextDate: computeNextEffectiveDate(employee, p),
                cycleCode: p.cycle_timing_code,
            }))
    }

    const formatDueLabel = (dateStr, cycleCode) => {
        if (!dateStr) return '—'
        const days = daysUntil(dateStr)
        if (days < 0) return 'Overdue'
        if (days === 0) return 'Due today'

        const months = Math.floor(days / 30)
        if (months >= 1) return `Due in ${months} month${months === 1 ? '' : 's'}`

        return `Due in ${days} day${days === 1 ? '' : 's'}`
    }

    const isRecentlyApproved = (emp) => emp.increment_applied_on === todayStr()

    // Single status badge per employee row: Approved, or the soonest upcoming due date
    // among all their assigned active policies.
    const incrementStatusFor = (emp) => {
        if (!hasAssignedPolicy(emp.id)) return null
        if (isRecentlyApproved(emp)) {
            return { label: 'Approved', classes: 'policy-mode-auto', icon: ['fas', 'circle-check'] }
        }

        const details = assignedPolicyDetails(emp.id).filter(d => d.nextDate)
        if (!details.length) return { label: '—', classes: 'text-text-muted', icon: null }

        const soonest = details.reduce((a, b) => new Date(a.nextDate) < new Date(b.nextDate) ? a : b)
        return {
            label: formatDueLabel(soonest.nextDate, soonest.cycleCode),
            classes: soonest.nextDate && daysUntil(soonest.nextDate) < 0 ? 'bg-danger-subtle text-danger' : 'policy-mode-manual',
            icon: ['fas', 'clock'],
        }
    }

    // ── Force increment modal ──
    const showForceModal = ref(false)
    const isForcing = ref(false)

    // Only employees covered by at least one policy assignment
    const coveredEmployees = computed(() =>
        (employees?.value ?? []).filter(emp => hasAssignedPolicy(emp.id))
    )

    const openForceModal = () => { showForceModal.value = true }
    const closeForceModal = () => { showForceModal.value = false }

    const confirmForceIncrement = async () => {
        isForcing.value = true
        const employeeIds = coveredEmployees.value.map(e => e.id)
        const result = await policyStore.forceIncrement(employeeIds)
        isForcing.value = false

        showToast(
            result.success ? (result.message || 'Increments applied.') : (result.error || 'Failed to force increment.'),
            result.success ? 'success' : 'error'
        )

        if (result.success) closeForceModal()
        return result
    }

    const showApplyModal = ref(false)
    const isApplying = ref(false)
    const selectedApplyIds = ref([])
    const recentlyAppliedIds = ref(new Set())

// Check if employee is overdue
    const isEmployeeOverdue = (emp) =>
        incrementStatusFor(emp)?.label === 'Overdue' && !recentlyAppliedIds.value.has(emp.id)

// Check if employee is due today
    const isEmployeeDueToday = (emp) =>
        incrementStatusFor(emp)?.label === 'Due today' && !recentlyAppliedIds.value.has(emp.id)

    const overdueEmployees = computed(() =>
        (employees?.value ?? []).filter(emp =>
            isEmployeeOverdue(emp) || isEmployeeDueToday(emp)
        )
    )

    const dueTodayEmployees = computed(() =>
        (employees?.value ?? []).filter(emp => isEmployeeDueToday(emp))
    )

    const openApplyModal = () => {
        selectedApplyIds.value = []
        showApplyModal.value = true
    }

    const closeApplyModal = () => {
        showApplyModal.value = false
        selectedApplyIds.value = []
    }

    const toggleApplySelection = (employeeId) => {
        const idx = selectedApplyIds.value.indexOf(employeeId)
        if (idx === -1) selectedApplyIds.value.push(employeeId)
        else selectedApplyIds.value.splice(idx, 1)
    }

    const toggleSelectAllApply = () => {
        selectedApplyIds.value = selectedApplyIds.value.length === overdueEmployees.value.length
            ? []
            : overdueEmployees.value.map(e => e.id)
    }

    const confirmApplyIncrement = async () => {
        if (!selectedApplyIds.value.length) {
            showToast('Select at least one employee to apply.', 'error')
            return { success: false }
        }

        isApplying.value = true
        const idsBeingApplied = [...selectedApplyIds.value]
        const result = await policyStore.forceIncrement(idsBeingApplied)
        isApplying.value = false

        showToast(
            result.success ? (result.message || 'Increments applied.') : (result.error || 'Failed to apply increments.'),
            result.success ? 'success' : 'error'
        )

        if (result.success) {
            idsBeingApplied.forEach(id => recentlyAppliedIds.value.add(id))
            closeApplyModal()
        }
        return result
    }


    return {
        formData, formErrors, isSubmitting,
        policies, loading, incrementTypes, cycleTimings, applicationModes, activePolicies,
        formatCurrency, formatIncrement, cardBorderClass, dateClass,
        resetForm, loadIntoForm, fetchPolicies, fetchLookups, savePolicy,
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
        showApplyModal, isApplying, overdueEmployees, isEmployeeOverdue,
        selectedApplyIds, toggleApplySelection, toggleSelectAllApply,
        openApplyModal, closeApplyModal, confirmApplyIncrement,
        dueTodayEmployees,
        isEmployeeDueToday,
    }
}