// stores/inquiries.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { BASE_URL, API_ENDPOINTS } from '../services/baseUrl.js'

const getAuthToken = () => localStorage.getItem('accessToken')

const apiClient = axios.create({ baseURL: BASE_URL })

apiClient.interceptors.request.use((config) => {
    const token = getAuthToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export const useInquiriesStore = defineStore('inquiries', {
    state: () => ({
        messages: [],
        statuses: [],       // [{ id, code, name }] — fetched from DB
        loading: false,
        error: null,

        deletingIds: [],
        sendingReplyIds: [],
        updatingStatusIds: [],
    }),

    getters: {
        // status pipeline counts — built dynamically from whatever statuses exist in DB
        statusCounts: (state) => {
            const counts = {}
            for (const s of state.statuses) counts[s.code] = 0
            for (const msg of state.messages) {
                const code = msg.status || 'new'
                if (counts[code] !== undefined) counts[code]++
            }
            return counts
        },
    },

    actions: {
        async fetchStatuses() {
            try {
                const response = await apiClient.get(API_ENDPOINTS.INQUIRY_STATUSES)
                this.statuses = response.data?.data || response.data || []
                return { success: true, data: this.statuses }
            } catch (err) {
                return { success: false, error: 'Failed to load statuses.' }
            }
        },

        async fetchMessages() {
            this.loading = true
            this.error = null
            try {
                const response = await apiClient.get(API_ENDPOINTS.CONTACT)

                let messagesData = []
                if (Array.isArray(response.data)) {
                    messagesData = response.data
                } else if (response.data?.data) {
                    if (Array.isArray(response.data.data)) {
                        messagesData = response.data.data
                    } else if (response.data.data?.data && Array.isArray(response.data.data.data)) {
                        messagesData = response.data.data.data
                    }
                }

                this.messages = messagesData.map((msg) => ({
                    ...msg,
                    status: msg.status || 'new',
                    replies: msg.replies || [],
                }))
            } catch (err) {
                this.error = err.response?.data?.message || 'Could not load inquiries. Please try again.'
            } finally {
                this.loading = false
            }
        },

        async deleteMessage(id) {
            this.deletingIds.push(id)
            try {
                await apiClient.delete(`${API_ENDPOINTS.CONTACT}${id}/`)
                this.messages = this.messages.filter((m) => m.id !== id)
                return { success: true }
            } catch (err) {
                return {
                    success: false,
                    message: err.response?.data?.message || 'Failed to delete inquiry.',
                }
            } finally {
                this.deletingIds = this.deletingIds.filter((i) => i !== id)
            }
        },

        async sendReply(id, replyBody, subject) {
            this.sendingReplyIds.push(id)
            try {
                const response = await apiClient.post(
                    `${API_ENDPOINTS.CONTACT}${id}/reply/`,
                    { body: replyBody, subject }
                )

                let updated = null
                if (response?.data) {
                    updated = response.data.data || response.data
                } else if (response) {
                    updated = response
                }

                if (updated) {
                    const idx = this.messages.findIndex((m) => m.id === id)
                    if (idx !== -1) {
                        this.messages[idx] = {
                            ...this.messages[idx],
                            ...updated,
                            replies: updated.replies || this.messages[idx].replies || [],
                        }
                    }
                }
                return { success: true, data: updated }
            } catch (err) {
                return {
                    success: false,
                    message: err.response?.data?.error || err.response?.data?.message || 'Failed to send email reply.',
                }
            } finally {
                this.sendingReplyIds = this.sendingReplyIds.filter((i) => i !== id)
            }
        },

        async updateStatus(id, status) {
            this.updatingStatusIds.push(id)
            try {
                const response = await apiClient.patch(
                    `${API_ENDPOINTS.CONTACT}${id}/status/`,
                    { status }
                )

                let updated = null
                if (response?.data) {
                    updated = response.data.data || response.data
                } else if (response) {
                    updated = response
                }

                if (updated) {
                    const idx = this.messages.findIndex((m) => m.id === id)
                    if (idx !== -1) {
                        this.messages[idx] = {
                            ...this.messages[idx],
                            ...updated,
                        }
                    }
                }
                return { success: true, data: updated }
            } catch (err) {
                return {
                    success: false,
                    message: err.response?.data?.message || 'Failed to update status.',
                }
            } finally {
                this.updatingStatusIds = this.updatingStatusIds.filter((i) => i !== id)
            }
        },
    },
})