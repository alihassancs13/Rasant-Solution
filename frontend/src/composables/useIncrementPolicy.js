import { reactive, computed } from 'vue'
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
        next_effective_date: '',
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

    const deletePolicy = async (id) => {
        const result = await policyStore.deletePolicy(id)
        showToast(result.success ? 'Policy deleted.' : result.error, result.success ? 'success' : 'error')
        return result.success
    }

    return {
        formData, formErrors, isSubmitting,
        policies, loading, incrementTypes, cycleTimings, applicationModes,
        resetForm, loadIntoForm, fetchPolicies, fetchLookups, savePolicy, deletePolicy,
    }
}