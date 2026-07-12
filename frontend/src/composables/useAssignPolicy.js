import { ref, computed } from 'vue'
import { useToast } from './useToast.js'

export function useAssignPolicy(employees) {
    const { showToast } = useToast()

    const showAssignModal     = ref(false)
    const assigningPolicy     = ref(null)
    const selectedEmployeeIds = ref([])
    const isSaving             = ref(false)

    const assignSubtitle = computed(() => {
        if (!assigningPolicy.value) return ''
        const p = assigningPolicy.value
        return `POL-${String(p.id).padStart(3, '0')} · +${p.amount}${p.increment_type_code === 'percentage' ? '%' : ''} · ${p.cycle_timing_name?.toLowerCase()}`
    })

    const isAssigned = (emp, policy) =>
        !!emp.policies && emp.policies.split(',').map(s => s.trim()).includes(policy.policy_name)

    const otherAssignedPolicies = (emp) => {
        if (!emp.policies || !assigningPolicy.value) return null
        const names = emp.policies
            .split(',')
            .map(s => s.trim())
            .filter(n => n && n !== assigningPolicy.value.policy_name)
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

    // TODO: replace with real assignment endpoint once it exists — should send
    // selectedEmployeeIds + assigningPolicy.value.id to backend
    const saveAssignments = async () => {
        isSaving.value = true
        try {
            showToast('Assignments saved.', 'success')
            closeAssignModal()
        } catch (err) {
            showToast('Failed to save assignments.', 'error')
        } finally {
            isSaving.value = false
        }
    }

    return {
        showAssignModal, assigningPolicy, selectedEmployeeIds, isSaving, assignSubtitle,
        isAssigned, otherAssignedPolicies, toggleEmployeeSelection,
        assignPolicy, closeAssignModal, saveAssignments,
    }
}