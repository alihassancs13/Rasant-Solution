import { ref } from 'vue'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

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

    const handleSubmit = async () => {
        loading.value = true
        error.value   = null
        success.value = false

        try {
            await axios.post(`${API_BASE}/api/contact/`, form.value)

            success.value = true
            form.value = { full_name: '', email: '', phone: '', message: '' }

        } catch (err) {
            error.value = err.response?.data
                ? Object.values(err.response.data).flat().join(' ')
                : 'Something went wrong.'
        } finally {
            loading.value = false
        }
    }

    return { form, loading, error, success, handleSubmit }
}