import { reactive, ref, onMounted } from 'vue'
import { cvAPI } from '@/services/cvApi.js'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export function useCareers() {
    const isModalOpen    = ref(false)
    const submitSuccess  = ref(false)
    const isDragging     = ref(false)
    const fileName       = ref('No file chosen')
    const fileUploaded   = ref(false)
    const fileInput      = ref(null)
    const cardsVisible   = ref(false)
    const isSubmitting   = ref(false)
    const submitError    = ref('')
    const savedScrollPos = ref(0)
    const countdown      = ref(5)
    let countdownInterval = null

    const formData = reactive({
        name: '', email: '', contact: '',
        position: '', coverLetter: '', file: null,
    })

    const formErrors = reactive({
        name: '', email: '', contact: '', position: '', file: '',
    })

    onMounted(() => {
        requestAnimationFrame(() => { cardsVisible.value = true })
    })

    // ── Validation ──────────────────────────────────────────────────────
    const validateEmail = (val) => {
        if (!val.trim())                   return 'Email address is required.'
        if (!EMAIL_REGEX.test(val.trim())) return 'Invalid format — try name@example.com'
        return ''
    }

    const onEmailInput = () => {
        formErrors.email = validateEmail(formData.email)
    }

    const validateAll = () => {
        formErrors.name     = formData.name.trim()     ? '' : 'Full name is required.'
        formErrors.email    = validateEmail(formData.email)
        formErrors.contact  = formData.contact.trim()  ? '' : 'Phone number is required.'
        formErrors.position = formData.position.trim() ? '' : 'Desired position is required.'
        formErrors.file     = formData.file            ? '' : 'Please upload your CV.'
        return !Object.values(formErrors).some(Boolean)
    }

    // ── Modal ────────────────────────────────────────────────────────────
    const openModal = (defaultPosition = '') => {
        formData.position    = defaultPosition
        savedScrollPos.value = window.scrollY
        isModalOpen.value    = true
        submitSuccess.value  = false
        document.body.style.cssText = `position:fixed;top:-${savedScrollPos.value}px;left:0;right:0;width:100%`
    }

    const closeModal = () => {
        isModalOpen.value = false
        document.body.style.cssText = ''
        window.scrollTo(0, savedScrollPos.value)
        clearInterval(countdownInterval)
        countdown.value = 1
        resetForm()
    }

    // ── Countdown ────────────────────────────────────────────────────────
    const startCountdown = () => {
        countdown.value = 1
        clearInterval(countdownInterval)
        countdownInterval = setInterval(() => {
            countdown.value--
            if (countdown.value <= 0) {
                clearInterval(countdownInterval)
                closeModal()
            }
        }, 1000)
    }

    // ── File handling ────────────────────────────────────────────────────
    const triggerFileSelect = () => fileInput.value?.click()

    const processUploadedFile = (file) => {
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            formErrors.file    = 'File size must not exceed 5MB.'
            formData.file      = null
            fileName.value     = 'No file chosen'
            fileUploaded.value = false
            if (fileInput.value) fileInput.value.value = ''
            return
        }

        formData.file      = file
        fileName.value     = file.name
        fileUploaded.value = true
        formErrors.file    = ''
    }

    const handleFileSelect = (e) => processUploadedFile(e.target.files[0])
    const handleFileDrop   = (e) => { isDragging.value = false; processUploadedFile(e.dataTransfer.files[0]) }

    // ── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validateAll()) return

        isSubmitting.value = true
        submitError.value  = ''

        try {
            const payload = new FormData()
            payload.append('full_name',        formData.name)
            payload.append('email',            formData.email)
            payload.append('phone',            formData.contact)
            payload.append('desired_position', formData.position)
            payload.append('cv_file',          formData.file)
            if (formData.coverLetter) payload.append('cover_letter', formData.coverLetter)

            await cvAPI.submitCV(payload)

            submitSuccess.value = true
            startCountdown()  // ← countdown shuru

        } catch (err) {
            const data   = err.response?.data
            const status = err.response?.status

            if (!data) {
                submitError.value = 'Network error. Please check your connection and try again.'
                return
            }

            if (status === 429) {
                submitError.value = data.error || 'You have already submitted a CV today. Please try again tomorrow.'
                return
            }

            const fieldMap = {
                full_name:        'name',
                email:            'email',
                phone:            'contact',
                desired_position: 'position',
                cv_file:          'file',
            }
            let hasFieldError = false

            for (const [backendKey, frontendKey] of Object.entries(fieldMap)) {
                if (data[backendKey]) {
                    formErrors[frontendKey] = [data[backendKey]].flat().join(' ')
                    hasFieldError = true
                }
            }

            if (!hasFieldError) {
                submitError.value =
                    data.error || data.detail ||
                    Object.values(data).flat().join(' ') ||
                    'Something went wrong. Please try again.'
            }
        } finally {
            isSubmitting.value = false
        }
    }

    // ── Reset ────────────────────────────────────────────────────────────
    const resetForm = () => {
        Object.assign(formData, { name: '', email: '', contact: '', position: '', coverLetter: '', file: null })
        Object.keys(formErrors).forEach(k => formErrors[k] = '')
        fileName.value     = 'No file chosen'
        fileUploaded.value = false
        submitError.value  = ''
        if (fileInput.value) fileInput.value.value = ''
    }

    return {
        isModalOpen, submitSuccess, isDragging,
        fileName, fileUploaded, fileInput,
        cardsVisible, isSubmitting, submitError,
        formData, formErrors, countdown,
        openModal, closeModal,
        triggerFileSelect, handleFileSelect, handleFileDrop,
        handleSubmit, resetForm, onEmailInput,
    }
}