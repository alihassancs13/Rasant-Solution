// composables/useJobs.js
import { ref, reactive, computed, watch } from 'vue'
import { useJobStore } from '@/stores/jobStore.js'
import { useToast } from './useToast.js'
import { useValidation } from './useValidation.js'

export function useJobs() {
    const jobStore = useJobStore()
    const { showToast } = useToast()
    const { getUsernameError, getAmountError, getLocationError, requiredLengthError } = useValidation()
    const getStatusId = (name) => jobStore.jobStatus.find(s => s.name?.toLowerCase() === name.toLowerCase())?.id ?? null
    const formData = reactive({
        job_title: '', job_type: null, department: '', location: '',
        salary_range: null, description: '', requirements: '', status: null, id: null,
    })
    const formErrors = reactive({})
    const touched = reactive({}) // tracks which fields the user has actually interacted with
    const isFormValid = ref(false)
    const isClosed = ref(false)
    const isSubmitting = ref(false)
    const submitSuccess = ref(false)
    const submitError = ref('')

    const adminJobs = computed(() => jobStore.adminJobs)
    const publicJobs = computed(() => jobStore.publicJobs)
    const loadingAdmin = computed(() => jobStore.isLoading)
    const loadingPublic = computed(() => jobStore.isLoading)
    const listError = computed(() => jobStore.error || '')

    const toggleStatus = (checked) => {
        isClosed.value = checked
        formData.status = checked ? getStatusId('Published') : getStatusId('Draft')
    }

    const touchField = (key) => { touched[key] = true }
    const touchAll = () => { Object.keys(formData).forEach((key) => { touched[key] = true }) }

    const collectErrors = () => ({
        job_title: getUsernameError(formData.job_title, undefined, 'Job title'),
        job_type: formData.job_type ? null : 'Job type is required.',
        department: getUsernameError(formData.department, undefined, 'Department'),
        location: getLocationError(formData.location, 50, 'Location'),
        salary_range: getAmountError(formData.salary_range, undefined, 'Salary range'),
        description: requiredLengthError(formData.description, 'Description', 2000),
        requirements: requiredLengthError(formData.requirements, 'Requirements', 2000),
    })

    watch(formData, () => {
        const errors = collectErrors()
        Object.keys(formErrors).forEach((key) => delete formErrors[key])
        Object.entries(errors).forEach(([key, msg]) => { if (msg) formErrors[key] = msg })
        isFormValid.value = Object.values(errors).every((msg) => !msg)
    }, { deep: true, immediate: true })

    const validateForm = () => isFormValid.value

    // Border/error text visible only when BOTH true — invalid AND touched.
    const fieldClass = (key, extra = '') =>
        `w-full min-w-0 px-3.5 py-2.5 text-sm bg-surface border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${extra} ${touched[key] && formErrors[key] ? 'border-danger' : 'border-border'}`
    const fieldErrorVisible = (key) => touched[key] && formErrors[key]

    const resetForm = () => {
        Object.assign(formData, {
            id: null, job_title: '', job_type: null, department: '', location: '',
            salary_range: null, description: '', requirements: '', status: getStatusId('Draft'),
        })
        Object.keys(touched).forEach((key) => delete touched[key])
        isClosed.value = false
        submitSuccess.value = false
        submitError.value = ''
    }

    const createJob = async () => {
        submitError.value = ''
        submitSuccess.value = false
        isSubmitting.value = true
        const result = await jobStore.createJob({ ...formData })
        isSubmitting.value = false

        if (result.success) {
            submitSuccess.value = true
            showToast(isClosed.value ? 'Job published on careers page.' : 'Job saved as draft.', 'success')
            return result.data
        }
        submitError.value = result.error
        showToast(result.error, 'error')
        return null
    }

    const updateJob = async (id, jobData) => {
        isSubmitting.value = true
        const result = await jobStore.updateJob(id, jobData)
        isSubmitting.value = false

        if (result.success) {
            showToast('Job opening updated.', 'success')
            return result.data
        }
        showToast(result.error, 'error')
        return null
    }

    const fetchAdminJobs = async () => {
        const result = await jobStore.fetchAdminJobs()
        if (!result.success) showToast(result.error, 'error')
    }

    const fetchPublicJobs = async () => { await jobStore.fetchPublicJobs() }

    return {
        formData, formErrors, isClosed, isSubmitting, submitSuccess, submitError,
        toggleStatus, createJob, resetForm, updateJob, validateForm, isFormValid,
        touchField, touchAll, fieldClass, fieldErrorVisible,
        adminJobs, publicJobs, loadingAdmin, loadingPublic, listError,
        fetchAdminJobs, fetchPublicJobs,
    }
}