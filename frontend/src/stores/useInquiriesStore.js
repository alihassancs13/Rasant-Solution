// stores/inquiries.js
import { defineStore } from 'pinia'
import axios from 'axios'
import { BASE_URL, API_ENDPOINTS } from '@/services/baseUrl'  // adjust path as needed

export const useInquiriesStore = defineStore('inquiries', {
    state: () => ({
        messages: [],
        loading: false,
        error: null,

        // per-inquiry action flags, keyed by id, so one row's spinner
        // doesn't lock up the whole list
        deletingIds: [],
        sendingReplyIds: [],
        updatingStatusIds: [],
    }),

    getters: {
        // status pipeline counts for the 4 top cards (New / In Progress / Replied / Quoted)
        statusCounts: (state) => {
            const counts = { new: 0, in_progress: 0, replied: 0, quoted: 0 }
            for (const msg of state.messages) {
                const status = msg.status || 'new'
                if (counts[status] !== undefined) counts[status]++
            }
            return counts
        },
    },

    actions: {
        async fetchMessages() {
            this.loading = true
            this.error = null
            try {
                // GET /api/contact/
                const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.CONTACT}`)

                let messagesData = []
                // Handle different response structures
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
                // DELETE /api/contact/<id>/
                await axios.delete(`${BASE_URL}${API_ENDPOINTS.CONTACT}${id}/`)
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

        async sendReply(id, body) {
            this.sendingReplyIds.push(id)
            try {
                // POST /api/contact/<id>/reply/   (adjust endpoint if needed)
                const response = await axios.post(
                    `${BASE_URL}${API_ENDPOINTS.CONTACT}${id}/reply/`,
                    body
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
                    message: err.response?.data?.message || 'Failed to send email reply.',
                }
            } finally {
                this.sendingReplyIds = this.sendingReplyIds.filter((i) => i !== id)
            }
        },

        async updateStatus(id, status) {
            this.updatingStatusIds.push(id)
            try {
                // PATCH /api/contact/<id>/status/   (adjust endpoint if needed)
                const response = await axios.patch(
                    `${BASE_URL}${API_ENDPOINTS.CONTACT}${id}/status/`,
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