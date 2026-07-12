import { ref, computed } from 'vue'
import { usePolicyStore } from '@/stores/policyStore.js'
import { useToast } from './useToast.js'

export function useAssignPolicy(employees, assignments) {
    const policyStore = usePolicyStore()
    const { showToast } = useToast()

    const showAssignModal     = ref(false)
    const assigningPolicy     = ref(null)
    const selectedEmployeeIds = ref([])
    const isSaving            = ref(false)

    const assignSubtitle = computed(() => {
        if (!assigningPolicy.value) return ''
        const p = assigningPolicy.value
        return `${p.amount}${p.increment_type_code === 'percentage' ? '%' : ''} · ${p.cycle_timing_name?.toLowerCase()}`
    })

    const isAssigned = (emp, policy) =>
        assignments.value.some(a => a.employee === emp.id && a.policy === policy.id)

    const otherAssignedPolicies = (emp) => {
        if (!assigningPolicy.value) return null
        const names = assignments.value
            .filter(a => a.employee === emp.id && a.policy !== assigningPolicy.value.id)
            .map(a => a.policy_name)
        return names.length ? names.join(', ') : null
    }

    const toggleEmployeeSelection = (empId) => {
        const idx = selectedEmployeeIds.value.indexOf(empId)
        if (idx === -1) selectedEmployeeIds.value.push(empId)
        else selectedEmployeeIds.value.splice(idx, 1)
    }

    const assignPolicy = (policy) => {
        assigningPolicy.value = policy
        selectedEmployeeIds.value = employees.value
            .filter(emp => isAssigned(emp, policy))
            .map(emp => emp.id)
        showAssignModal.value = true
    }

    const closeAssignModal = () => {
        showAssignModal.value = false
        assigningPolicy.value = null
        selectedEmployeeIds.value = []
    }

    const saveAssignments = async () => {
        if (!assigningPolicy.value) return
        isSaving.value = true
        const result = await policyStore.syncPolicyAssignments(assigningPolicy.value.id, selectedEmployeeIds.value)
        isSaving.value = false

        if (result.success) {
            showToast('Assignments saved.', 'success')
            closeAssignModal()
        } else {
            showToast(result.error || 'Failed to save assignments.', 'error')
        }
    }

    return {
        showAssignModal, assigningPolicy, selectedEmployeeIds, isSaving, assignSubtitle,
        isAssigned, otherAssignedPolicies, toggleEmployeeSelection,
        assignPolicy, closeAssignModal, saveAssignments,
    }
}