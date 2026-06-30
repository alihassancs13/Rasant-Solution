import { ref } from 'vue'
import { contactAPI } from '@/services/contactApi.js'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

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

    // ── Validation ──────────────────────────────────────────────────────
    const validateEmail = (val) => {
        if (!val.trim())                   return 'Email address is required.'
        if (!EMAIL_REGEX.test(val.trim())) return 'Invalid format — try name@example.com'
        return ''
    }

    const onEmailInput = () => {
        formErrors.value.email = validateEmail(form.value.email)
    }

    const validateAll = () => {
        formErrors.value.full_name = form.value.full_name.trim() ? '' : 'Full name is required.'
        formErrors.value.email     = validateEmail(form.value.email)
        formErrors.value.phone     = form.value.phone.trim()     ? '' : 'Phone number is required.'
        formErrors.value.message   = form.value.message.trim()   ? '' : 'Message is required.'
        return !Object.values(formErrors.value).some(Boolean)
    }

    // ── Clear Success Message After 1 Second ──────────────────────────
    const clearSuccessMessage = () => {
        if (successTimer) {
            clearTimeout(successTimer)
            successTimer = null
        }
        successTimer = setTimeout(() => {
            success.value = false
            successTimer = null
        }, 1000) // ✅ 1 second = 1000ms
    }

    // ── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = async (event) => {
        // ✅ Event prevent karein
        if (event) {
            event.preventDefault()
            event.stopPropagation()
        }

        // ✅ Clear previous success timer
        if (successTimer) {
            clearTimeout(successTimer)
            successTimer = null
        }

        if (!validateAll()) {
            error.value = 'Please fill all required fields correctly.'

            // ✅ Error bhi 3 sec baad auto clear ho
            setTimeout(() => {
                error.value = null
            }, 3000)
            return
        }

        loading.value = true
        error.value   = null
        success.value = false

        try {
            await contactAPI.sendMessage(form.value)

            success.value = true
            form.value = { full_name: '', email: '', phone: '', message: '' }
            Object.keys(formErrors.value).forEach(k => formErrors.value[k] = '')

            // ✅ Success message auto clear after 1 second
            clearSuccessMessage()

        } catch (err) {
            const data   = err.response?.data
            const status = err.response?.status

            if (!data) {
                error.value = 'Network error. Please check your connection and try again.'
                // ✅ Error auto clear after 3 seconds
                setTimeout(() => {
                    error.value = null
                }, 3000)
                return
            }

            // DRF field errors → map to formErrors
            const fieldMap = {
                full_name: 'full_name',
                email:     'email',
                phone:     'phone',
                message:   'message',
            }
            let hasFieldError = false

            for (const [backendKey, frontendKey] of Object.entries(fieldMap)) {
                if (data[backendKey]) {
                    formErrors.value[frontendKey] = [data[backendKey]].flat().join(' ')
                    hasFieldError = true
                }
            }

            if (!hasFieldError) {
                error.value =
                    data.error || data.detail ||
                    Object.values(data).flat().join(' ') ||
                    'Something went wrong. Please try again.'

                // ✅ Error auto clear after 3 seconds
                setTimeout(() => {
                    error.value = null
                }, 3000)
            }
        } finally {
            loading.value = false
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