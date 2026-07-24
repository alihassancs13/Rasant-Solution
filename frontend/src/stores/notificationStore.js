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
        lastFetchedAt: 0,
    }),

    getters: {
        notifications: (state) => state.items,
    },

    actions: {
        async fetchNotifications(opts = {}) {
            const force = Boolean(opts.force);
            const TTL = 30 * 1000;
            if (!force && this.lastFetchedAt && Date.now() - this.lastFetchedAt < TTL) {
                return { success: true, cached: true };
            }

            this.isLoading = !this.lastFetchedAt;
            this.error = null;
            try {
                const { data } = await api.get(API_ENDPOINTS.NOTIFICATIONS);
                this.items = Array.isArray(data.notifications) ? data.notifications : [];
                this.unreadCount = Number(data.unread_count || 0);
                this.lastFetchedAt = Date.now();
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

        /**
         * Delete notifications.
         * @param {{ clearAll?: boolean, ids?: number[], readOnly?: boolean }} [opts]
         */
        async clearNotifications(opts = {}) {
            const ids = Array.isArray(opts.ids) ? opts.ids : [];
            const readOnly = Boolean(opts.readOnly);
            const clearAll = Boolean(opts.clearAll) || (!ids.length && !readOnly);
            const payload = {
                clear_all: clearAll,
                read_only: readOnly,
                ids,
            };
            try {
                const { data } = await api.post(API_ENDPOINTS.NOTIFICATIONS_CLEAR, payload);
                if (clearAll) {
                    this.items = [];
                    this.unreadCount = 0;
                } else if (ids.length) {
                    const set = new Set(ids);
                    this.items = this.items.filter((n) => !set.has(n.id));
                    this.unreadCount = Number(data.unread_count ?? this.items.filter((n) => !n.is_read).length);
                } else if (readOnly) {
                    this.items = this.items.filter((n) => !n.is_read);
                    this.unreadCount = Number(data.unread_count ?? this.items.length);
                }
                this.lastFetchedAt = Date.now();
                return { success: true, deleted: data.deleted || 0 };
            } catch (error) {
                return { success: false, error: error.response?.data?.error || 'Failed to clear notifications' };
            }
        },

        startPolling(intervalMs = 45000) {
            if (this.pollTimer) return; // already polling globally
            this.fetchNotifications();
            this.pollTimer = setInterval(() => {
                this.fetchNotifications({ force: true });
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
