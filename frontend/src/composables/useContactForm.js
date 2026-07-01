import { ref, nextTick } from 'vue'
import { contactAPI } from '@/services/contactApi.js'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/

const SUCCESS_DURATION = 4000 // 4 seconds — visible long enough to read
const ERROR_DURATION = 5000   // 5 seconds

export function useContact() {
    const loading = ref(false)
    const error   = ref(null)
    const success = ref(false)

    const form = ref({
        full_name: '',
        email:     '',
        phone:     '',
        message:   '',
    })

    const formErrors = ref({
        full_name: '',
        email:     '',
        phone:     '',
        message:   '',
    })

    let successTimer = null
    let errorTimer = null
    let savedScrollY = 0

    // ── Validation ──────────────────────────────────────────────────────
    const validateEmail = (val) => {
        if (!val.trim())                   return 'Email address is required.'
        if (!EMAIL_REGEX.test(val.trim())) return 'Invalid format — try name@example.com'
        return ''
    }

    const validatePhone = (val) => {
        // phone is optional, only validate format if provided
        if (!val.trim()) return ''
        if (!PHONE_REGEX.test(val.trim())) return 'Invalid phone number format.'
        return ''
    }

    const onEmailInput = () => {
        formErrors.value.email = validateEmail(form.value.email)
    }

    const validateAll = () => {
        formErrors.value.full_name = form.value.full_name.trim() ? '' : 'Full name is required.'
        formErrors.value.email     = validateEmail(form.value.email)
        formErrors.value.phone     = validatePhone(form.value.phone)
        formErrors.value.message   = form.value.message.trim() ? '' : 'Message is required.'
        return !Object.values(formErrors.value).some(Boolean)
    }

    // ── Messages ─────────────────────────────────────────────────────
    const showSuccess = () => {
        if (successTimer) clearTimeout(successTimer)
        success.value = true
        successTimer = setTimeout(() => {
            success.value = false
            successTimer = null
        }, SUCCESS_DURATION)
    }

    const showError = (msg) => {
        if (errorTimer) clearTimeout(errorTimer)
        error.value = msg
        errorTimer = setTimeout(() => {
            error.value = null
            errorTimer = null
        }, ERROR_DURATION)
    }

    // ── Body scroll lock — prevents ANY scroll movement (incl. keyboard
    //    dismiss jump on mobile) while submit is in progress ────────────
    const lockBodyScroll = () => {
        savedScrollY = window.scrollY
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
        const body = document.body

        body.style.position = 'fixed'
        body.style.top = `-${savedScrollY}px`
        body.style.left = '0'
        body.style.right = '0'
        body.style.width = '100%'

        // prevent the tiny horizontal jiggle caused by scrollbar disappearing
        if (scrollBarWidth > 0) {
            body.style.paddingRight = `${scrollBarWidth}px`
        }
    }

    const unlockBodyScroll = () => {
        const body = document.body
        body.style.position = ''
        body.style.top = ''
        body.style.left = ''
        body.style.right = ''
        body.style.width = ''
        body.style.paddingRight = ''

        // restore exact scroll position instantly, no animation
        window.scrollTo({ top: savedScrollY, behavior: 'instant' })
    }

    // ── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = async (event) => {
        if (event) {
            event.preventDefault()
            event.stopPropagation()
        }

        // Blur first so the keyboard starts closing while the page is still
        // free to move — then immediately lock the body before it can jump.
        if (document.activeElement) {
            document.activeElement.blur()
        }

        lockBodyScroll()

        // Clear any previous timers
        if (successTimer) { clearTimeout(successTimer); successTimer = null }
        if (errorTimer)   { clearTimeout(errorTimer);   errorTimer = null }

        success.value = false
        error.value = null

        if (!validateAll()) {
            showError('Please fill all required fields correctly.')
            await nextTick()
            unlockBodyScroll()
            return
        }

        loading.value = true

        try {
            await contactAPI.sendMessage(form.value)

            // Reset form
            form.value = { full_name: '', email: '', phone: '', message: '' }
            Object.keys(formErrors.value).forEach(k => formErrors.value[k] = '')

            showSuccess()

        } catch (err) {
            console.log('DEBUG - error response data:', err.response?.data)
            const data   = err.response?.data
            const status = err.response?.status

            if (!err.response) {
                // network error / no response from server (timeout, offline, CORS, server down)
                showError('Network error. Please check your connection and try again.')
            } else if (status === 429) {
                showError('Too many requests. Please wait a moment and try again.')
            } else if (status >= 500) {
                showError('Server error. Please try again in a few minutes.')
            } else if (data && typeof data === 'object') {
                // DRF field errors → map to formErrors
                const fieldMap = { full_name: 'full_name', email: 'email', phone: 'phone', message: 'message' }
                let hasFieldError = false

                for (const [backendKey, frontendKey] of Object.entries(fieldMap)) {
                    if (data[backendKey]) {
                        formErrors.value[frontendKey] = [data[backendKey]].flat().join(' ')
                        hasFieldError = true
                    }
                }

                if (!hasFieldError) {
                    const msg = data.error || data.detail || Object.values(data).flat().join(' ')
                    showError(msg || 'Something went wrong. Please try again.')
                }
            } else {
                showError('Something went wrong. Please try again.')
            }
        } finally {
            loading.value = false
            // wait for DOM (success/error box, label reset) to settle, then unlock
            await nextTick()
            unlockBodyScroll()
        }
    }

    return {
        form,
        formErrors,
        loading,
        error,
        success,
        handleSubmit,
        onEmailInput,
    }
}