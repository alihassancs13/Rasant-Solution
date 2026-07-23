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

export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        items: [],
        unreadCount: 0,
        isLoading: false,
        error: null,
        pollTimer: null,
    }),

    getters: {
        notifications: (state) => state.items,
    },

    actions: {
        async fetchNotifications() {
            this.isLoading = true;
            this.error = null;
            try {
                const { data } = await api.get(API_ENDPOINTS.NOTIFICATIONS);
                this.items = Array.isArray(data.notifications) ? data.notifications : [];
                this.unreadCount = Number(data.unread_count || 0);
                return { success: true, data };
            } catch (error) {
                this.error = error.response?.data?.error || 'Failed to load notifications';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async markRead(ids = [], markAll = false) {
            try {
                const { data } = await api.post(API_ENDPOINTS.NOTIFICATIONS_MARK_READ, {
                    ids,
                    mark_all: markAll,
                });
                if (markAll) {
                    this.items = this.items.map((n) => ({ ...n, is_read: true }));
                } else if (ids.length) {
                    const set = new Set(ids);
                    this.items = this.items.map((n) => (set.has(n.id) ? { ...n, is_read: true } : n));
                }
                this.unreadCount = Number(data.unread_count ?? 0);
                return { success: true };
            } catch (error) {
                return { success: false, error: error.response?.data?.error || 'Failed to mark read' };
            }
        },

        startPolling(intervalMs = 45000) {
            this.stopPolling();
            this.fetchNotifications();
            this.pollTimer = setInterval(() => {
                this.fetchNotifications();
            }, intervalMs);
        },

        stopPolling() {
            if (this.pollTimer) {
                clearInterval(this.pollTimer);
                this.pollTimer = null;
            }
        },
    },
});
