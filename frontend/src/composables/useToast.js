// src/composables/useToast.js
import { reactive } from 'vue'

const toasts = reactive([])
let idCounter = 0

const removeToast = (id) => {
    const index = toasts.findIndex((t) => t.id === id)
    if (index !== -1) toasts.splice(index, 1)
}

const showToast = (message, type = 'success', duration = 3500) => {
    const id = ++idCounter
    toasts.push({ id, message, type })

    setTimeout(() => {
        removeToast(id)
    }, duration)

    return id
}

export function useToast() {
    return {
        toasts,
        showToast,
        removeToast,
    }
}