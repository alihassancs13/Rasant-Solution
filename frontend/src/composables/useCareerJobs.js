import { ref, reactive } from 'vue'
import { jobAPI } from '@/services/cvApi.js'
import { useToast } from './useToast.js'

export function useJobs() {
    const { showToast } = useToast()

    // ── State: Create Form ──────────────────────────────────
    const formData = reactive({
        job_title: '',
        job_type: '',
        department: '',
        location: '',
        salary_range: null,
        description: '',
        requirements: '',
        status: 1, // 1 = Published (unchecked), 3 = Closed (checked)
    })
    const formErrors = reactive({})
    const isClosed = ref(false)
    const isSubmitting = ref(false)
    const submitSuccess = ref(false)
    const submitError = ref('')

    // ── State: Lists ─────────────────────────────────────────
    const adminJobs = ref([])
    const publicJobs = ref([])
    const loadingAdmin = ref(false)
    const loadingPublic = ref(false)
    const listError = ref('')

    // ── Checkbox toggle: status 1 <-> 3 ─────────────────────
    const toggleStatus = (checked) => {
        isClosed.value = checked
        formData.status = checked ? 3 : 1
    }

    // ── Validation ───────────────────────────────────────────
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

    // ── Create Job ───────────────────────────────────────────
    const createJob = async () => {
        submitError.value = ''
        submitSuccess.value = false

        if (!validateForm()) {
            showToast('Please fix the highlighted fields.', 'error')
            return null
        }

        isSubmitting.value = true
        try {
            const response = await jobAPI.create({ ...formData })
            submitSuccess.value = true
            showToast('Job opening created successfully.', 'success')
            return response.data.data
        } catch (err) {
            if (err.response?.data?.errors) {
                Object.assign(formErrors, err.response.data.errors)
            }
            const message = err.response?.data?.message || 'Failed to create job opening.'
            submitError.value = message
            showToast(message, 'error')
            return null
        } finally {
            isSubmitting.value = false
        }
    }

    // ── Update Job (status toggle, edit, etc.) ──────────────
    const updateJob = async (id, jobData) => {
        isSubmitting.value = true
        try {
            const response = await jobAPI.update(id, jobData)
            showToast('Job opening updated.', 'success')
            return response.data.data
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to update job opening.'
            showToast(message, 'error')
            return null
        } finally {
            isSubmitting.value = false
        }
    }

    // ── Fetch: Admin List (all statuses) ────────────────────
    const fetchAdminJobs = async () => {
        loadingAdmin.value = true
        listError.value = ''
        try {
            const { data } = await jobAPI.getAdminJobs()
            adminJobs.value = data?.data || []
        } catch (err) {
            listError.value = 'Failed to load jobs.'
            showToast(listError.value, 'error')
            adminJobs.value = []
        } finally {
            loadingAdmin.value = false
        }
    }

    // ── Fetch: Public List (published only) ─────────────────
    const fetchPublicJobs = async () => {
        loadingPublic.value = true
        try {
            const { data } = await jobAPI.getPublicJobs()
            publicJobs.value = data?.data || []
        } catch {
            publicJobs.value = []
        } finally {
            loadingPublic.value = false
        }
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