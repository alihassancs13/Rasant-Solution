import { ref, reactive, nextTick } from 'vue'
import { contactAPI } from '@/services/contactApi.js'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/

export function useContact() {
    const loading = ref(false)

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

    // ── Error helpers ────────────────────────────────────────────────────
    // Only treat backend response as usable JSON if it's a plain object.
    // Anything else (HTML error pages, plain strings, arrays, null) is unsafe
    // to display directly — fall back to a clean, generic message instead.
    const isPlainObject = (val) =>
        typeof val === 'object' && val !== null && !Array.isArray(val)

    const looksLikeHtml = (val) =>
        typeof val === 'string' && /<\/?[a-z][\s\S]*>/i.test(val.trim().slice(0, 100))

    const genericMessageForStatus = (status) => {
        if (!status) return 'Network error. Please check your connection and try again.'
        if (status === 404) return 'We couldn\u2019t reach the messaging service. Please try again later.'
        if (status >= 500) return 'Server error. Please try again in a few minutes.'
        if (status >= 400) return 'We couldn\u2019t process your request. Please check your details and try again.'
        return 'Something went wrong. Please try again.'
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

        if (!validateAll()) {
            pushToast('warning', 'Please fill all required fields correctly.')
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

            pushToast('success', 'Message sent! Our team will get back to you within 24 hours.')

        } catch (err) {
            const data   = err?.response?.data
            const status = err?.response?.status

            // No response at all → real network failure
            if (!err.response) {
                pushToast('error', genericMessageForStatus(status))
                console.error('Contact form network error:', err)
            }
                // Response exists but isn't usable JSON (HTML error page, plain
            // string, etc.) — never render this raw, always show a clean message.
            else if (!isPlainObject(data) || looksLikeHtml(JSON.stringify(data))) {
                pushToast('error', genericMessageForStatus(status))
                console.error('Contact form returned a non-JSON response:', { status, data })
            }
            else if (status === 429) {
                const msg = typeof data.error === 'string' && data.error.trim()
                    ? data.error
                    : 'Too many requests. Please wait a moment and try again.'
                pushToast('warning', msg)
            }
            else if (status >= 500) {
                pushToast('error', genericMessageForStatus(status))
                console.error('Contact form server error:', err)
            }
            else {
                // DRF field errors → map to formErrors
                const fieldMap = { full_name: 'full_name', email: 'email', phone: 'phone', message: 'message' }
                let hasFieldError = false

                for (const [backendKey, frontendKey] of Object.entries(fieldMap)) {
                    const fieldMsg = data[backendKey]
                    if (fieldMsg && (typeof fieldMsg === 'string' || Array.isArray(fieldMsg))) {
                        const cleanMsg = [fieldMsg].flat().filter(v => typeof v === 'string').join(' ').trim()
                        if (cleanMsg) {
                            formErrors.value[frontendKey] = cleanMsg
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
                    pushToast('error', fallback.trim() || genericMessageForStatus(status))
                }
            }
        } finally {
            loading.value = false
            // wait for DOM (label reset) to settle, then unlock
            await nextTick()
            unlockBodyScroll()
        }
    }

    return {
        form,
        formErrors,
        loading,
        toasts,
        removeToast,
        handleSubmit,
        onEmailInput,
    }
}