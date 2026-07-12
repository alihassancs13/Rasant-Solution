import { reactive, ref, computed } from 'vue'
import { usePolicyStore } from '@/stores/policyStore.js'
import { useToast } from './useToast.js'

export function useIncrementPolicy() {
    const policyStore = usePolicyStore()
    const { showToast } = useToast()

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
    const showForceModal = ref(false)
    const isForcing = ref(false)
    const formatCurrency = (amount) =>
        amount || amount === 0 ? `₨${Number(amount).toLocaleString('en-US')}` : '—'

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
            cycle_timing: null, next_effective_date: '', application_mode: null,
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
            next_effective_date: policy.next_effective_date || '',
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
    const openForceModal = () => { showForceModal.value = true }
    const closeForceModal = () => { showForceModal.value = false }
    const confirmForceIncrement = async () => {
        isForcing.value = true
        const result = await policyStore.forceIncrement()
        isForcing.value = false

        showToast(result.success ? (result.message || 'Increments applied.') : (result.error || 'Failed to force increment.'), result.success ? 'success' : 'error')
        if (result.success) {
            closeForceModal()
            await policyStore.fetchPolicies() // refresh last_run_date on policy cards
        }
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
        assignments, assignmentsLoading, fetchAssignments, assignedPolicyNames,assignedPolicyList,
        showForceModal, isForcing, openForceModal, closeForceModal, confirmForceIncrement,
    }
}