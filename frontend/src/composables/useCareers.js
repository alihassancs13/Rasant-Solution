import { reactive, ref, onMounted } from 'vue'
import { useCvStore } from '@/stores/cvStore.js'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx']
const MAX_FILE_SIZE = 5 * 1024 * 1024

export function useCareers() {
    const cvStore = useCvStore()

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

    // ── Toasts (inline, no separate file) ──────────────────────────────
    const toasts = reactive([])
    let toastIdCounter = 0

    const removeToast = (id) => {
        const idx = toasts.findIndex(t => t.id === id)
        if (idx !== -1) toasts.splice(idx, 1)
    }

    const pushToast = (type, message, duration = 4500) => {
        const id = ++toastIdCounter
        toasts.push({ id, type, message })
        if (duration > 0) setTimeout(() => removeToast(id), duration)
    }

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

    const getFileExtension = (name) => {
        const idx = name.lastIndexOf('.')
        return idx === -1 ? '' : name.slice(idx).toLowerCase()
    }

    const processUploadedFile = (file) => {
        if (!file) return

        const ext = getFileExtension(file.name)
        const isValidType = ALLOWED_FILE_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(ext)

        if (!isValidType) {
            const msg = 'Only PDF, DOC, or DOCX files are allowed.'
            formErrors.file    = msg
            formData.file      = null
            fileName.value     = 'No file chosen'
            fileUploaded.value = false
            if (fileInput.value) fileInput.value.value = ''
            pushToast('error', msg)
            return
        }

        if (file.size > MAX_FILE_SIZE) {
            const msg = 'File size must not exceed 5MB.'
            formErrors.file    = msg
            formData.file      = null
            fileName.value     = 'No file chosen'
            fileUploaded.value = false
            if (fileInput.value) fileInput.value.value = ''
            pushToast('error', msg)
            return
        }

        formData.file      = file
        fileName.value     = file.name
        fileUploaded.value = true
        formErrors.file    = ''
    }

    const handleFileSelect = (e) => processUploadedFile(e.target.files[0])
    const handleFileDrop   = (e) => { isDragging.value = false; processUploadedFile(e.dataTransfer.files[0]) }

    const isPlainObject = (val) =>
        typeof val === 'object' && val !== null && !Array.isArray(val)

    const looksLikeHtml = (val) =>
        typeof val === 'string' && /<\/?[a-z][\s\S]*>/i.test(val.trim().slice(0, 100))

    const genericMessageForStatus = (status) => {
        if (!status) return 'Network error. Please check your connection and try again.'
        if (status === 404) return 'We couldn\u2019t reach the submission service. Please try again later.'
        if (status >= 500) return 'Something went wrong on our end. Please try again shortly.'
        if (status >= 400) return 'We couldn\u2019t process your request. Please check your details and try again.'
        return 'Something went wrong. Please try again.'
    }

    // ── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validateAll()) {
            pushToast('warning', 'Please fill in all required fields correctly.')
            return
        }

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

            await cvStore.submitCV(payload)

            submitSuccess.value = true
            pushToast('success', 'Your CV has been submitted successfully!')
            startCountdown()

        } catch (err) {
            const data   = err?.response?.data
            const status = err?.response?.status

            // No response at all → real network failure
            if (!data) {
                const msg = genericMessageForStatus(status)
                submitError.value = msg
                pushToast('error', msg)
                console.error('CV submission network error:', err)
                return
            }

            if (!isPlainObject(data) || looksLikeHtml(JSON.stringify(data))) {
                const msg = genericMessageForStatus(status)
                submitError.value = msg
                pushToast('error', msg)
                console.error('CV submission returned a non-JSON response:', { status, data })
                return
            }

            // Rate limited
            if (status === 429) {
                const msg = typeof data.error === 'string' && data.error.trim()
                    ? data.error
                    : 'You have already submitted a CV today. Please try again tomorrow.'
                submitError.value = msg
                pushToast('warning', msg)
                return
            }

            // Server error (5xx)
            if (status >= 500) {
                const msg = genericMessageForStatus(status)
                submitError.value = msg
                pushToast('error', msg)
                console.error('CV submission server error:', err)
                return
            }

            // Field-level validation errors from backend
            const fieldMap = {
                full_name:        'name',
                email:            'email',
                phone:            'contact',
                desired_position: 'position',
                cv_file:          'file',
            }
            let hasFieldError = false

            for (const [backendKey, frontendKey] of Object.entries(fieldMap)) {
                const fieldMsg = data[backendKey]
                if (fieldMsg && (typeof fieldMsg === 'string' || Array.isArray(fieldMsg))) {
                    const cleanMsg = [fieldMsg].flat().filter(v => typeof v === 'string').join(' ').trim()
                    if (cleanMsg) {
                        formErrors[frontendKey] = cleanMsg
                        hasFieldError = true
                    }
                }
            }

            if (hasFieldError) {
                pushToast('error', 'Please check the highlighted fields and try again.')
            } else {
                const fallback = typeof data.error === 'string' ? data.error
                    : typeof data.detail === 'string' ? data.detail
                        : ''
                const msg = fallback.trim() || genericMessageForStatus(status)
                submitError.value = msg
                pushToast('error', msg)
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
        toasts, removeToast,
        openModal, closeModal,
        triggerFileSelect, handleFileSelect, handleFileDrop,
        handleSubmit, resetForm, onEmailInput,
    }
}