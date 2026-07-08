// composables/useJobs.js
import { ref, reactive, computed } from 'vue'
import { useJobStore } from '@/stores/jobStore.js'
import { useToast } from './useToast.js'

export function useJobs() {
    const jobStore = useJobStore()
    const { showToast } = useToast()

    const formData = reactive({
        job_title: '',
        job_type: '',
        department: '',
        location: '',
        salary_range: null,
        description: '',
        requirements: '',
        status: 1,
    })
    const formErrors = reactive({})
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
        formData.status = checked ? 3 : 1
    }

    const validateForm = () => {
        Object.keys(formErrors).forEach((key) => delete formErrors[key])

        if (!formData.job_title.trim()) formErrors.job_title = 'Job title is required.'
        if (!formData.job_type) formErrors.job_type = 'Job type is required.'
        if (!formData.department.trim()) formErrors.department = 'Department is required.'
        if (!formData.location.trim()) formErrors.location = 'Location is required.'
        if (!formData.description.trim()) formErrors.description = 'Description is required.'
        if (!formData.requirements.trim()) formErrors.requirements = 'Requirements are required.'

        return Object.keys(formErrors).length === 0
    }

    const resetForm = () => {
        formData.job_title = ''
        formData.job_type = ''
        formData.department = ''
        formData.location = ''
        formData.salary_range = null
        formData.description = ''
        formData.requirements = ''
        formData.status = 1
        isClosed.value = false
        submitSuccess.value = false
        submitError.value = ''
    }

    const createJob = async () => {
        submitError.value = ''
        submitSuccess.value = false

        if (!validateForm()) {
            showToast('Please fix the highlighted fields.', 'error')
            return null
        }

        isSubmitting.value = true
        const result = await jobStore.createJob({ ...formData })
        isSubmitting.value = false

        if (result.success) {
            submitSuccess.value = true
            showToast('Job opening created successfully.', 'success')
            return result.data
        } else {
            submitError.value = result.error
            showToast(result.error, 'error')
            return null
        }
    }

    const updateJob = async (id, jobData) => {
        isSubmitting.value = true
        const result = await jobStore.updateJob(id, jobData)
        isSubmitting.value = false

        if (result.success) {
            showToast('Job opening updated.', 'success')
            return result.data
        } else {
            showToast(result.error, 'error')
            return null
        }
    }

    const fetchAdminJobs = async () => {
        const result = await jobStore.fetchAdminJobs()
        if (!result.success) {
            showToast(result.error, 'error')
        }
    }

    const fetchPublicJobs = async () => {
        await jobStore.fetchPublicJobs()
    }



    return {
        formData,
        formErrors,
        isClosed,
        isSubmitting,
        submitSuccess,
        submitError,
        toggleStatus,
        createJob,
        resetForm,
        updateJob,
        adminJobs,
        publicJobs,
        loadingAdmin,
        loadingPublic,
        listError,
        fetchAdminJobs,
        fetchPublicJobs,
    }
}