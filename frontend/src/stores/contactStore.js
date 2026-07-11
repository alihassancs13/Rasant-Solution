import { defineStore } from 'pinia';
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../services/baseUrl.js';

const getAuthToken = () => localStorage.getItem('accessToken');

// Admin calls need auth
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Public contact form submit — no auth needed
const publicClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const useContactStore = defineStore('contact', {
    state: () => ({
        messages: [],
        isLoading: false,
        isSubmitting: false,
        error: null,
    }),

    getters: {
        getMessages: (state) => state.messages,
        totalMessages: (state) => state.messages.length,
    },

    actions: {
        async fetchMessages() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await apiClient.get(API_ENDPOINTS.CONTACT);
                this.messages = response.data;
                return { success: true };

            } finally {
                this.isLoading = false;
            }
        },

        // ── Admin: delete a message ─────────────────────────
        async deleteMessage(id) {
            try {
                await apiClient.delete(`${API_ENDPOINTS.CONTACT}${id}/`);
                this.messages = this.messages.filter((m) => m.id !== id);
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to delete message';
                return { success: false, error: this.error };
            }
        },
        async submitContactForm(data) {
            this.isSubmitting = true;
            try {
                const response = await publicClient.post(API_ENDPOINTS.CONTACT, data);
                return response;
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});