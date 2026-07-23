import { defineStore } from 'pinia';
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../services/baseUrl.js';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const useLeaveStore = defineStore('leaveRequests', {
    state: () => ({
        myRequests: [],
        adminRequests: [],
        stats: { pending: 0, approved: 0, rejected: 0 },
        isLoading: false,
        isSubmitting: false,
        error: null,
    }),

    actions: {
        async fetchMyRequests(status = 'all') {
            this.isLoading = true;
            this.error = null;
            try {
                const { data } = await api.get(API_ENDPOINTS.LEAVE.MY, {
                    params: status && status !== 'all' ? { status } : {},
                });
                this.myRequests = data.requests || [];
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.error || 'Failed to load leave requests';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async submitRequest(payload) {
            this.isSubmitting = true;
            this.error = null;
            try {
                const { data } = await api.post(API_ENDPOINTS.LEAVE.MY, payload);
                if (data.request) this.myRequests = [data.request, ...this.myRequests];
                return { success: true, data };
            } catch (error) {
                this.error = error.response?.data?.error || 'Failed to submit leave request';
                return { success: false, error: this.error };
            } finally {
                this.isSubmitting = false;
            }
        },

        async fetchAdminRequests(status = 'pending') {
            this.isLoading = true;
            this.error = null;
            try {
                const { data } = await api.get(API_ENDPOINTS.LEAVE.ADMIN_LIST, {
                    params: { status },
                });
                this.adminRequests = data.requests || [];
                this.stats = data.stats || this.stats;
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.error || 'Failed to load leave requests';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async decide(id, decision, adminNote = '') {
            this.isSubmitting = true;
            this.error = null;
            try {
                const { data } = await api.post(API_ENDPOINTS.LEAVE.DECIDE(id), {
                    decision,
                    admin_note: adminNote,
                });
                const updated = data.request;
                if (updated) {
                    this.adminRequests = this.adminRequests.map((r) =>
                        r.id === updated.id ? updated : r,
                    );
                }
                await this.fetchAdminRequests('pending');
                return { success: true, data };
            } catch (error) {
                this.error = error.response?.data?.error || 'Failed to update leave request';
                return { success: false, error: this.error };
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
