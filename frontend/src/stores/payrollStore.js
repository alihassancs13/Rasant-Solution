import { defineStore } from 'pinia';
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../services/baseUrl.js';

const getAuthToken = () => localStorage.getItem('accessToken');

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const usePayrollSettingsStore = defineStore('payrollSettings', {
    state: () => ({
        settings: {
            grace_minutes: 10,
            allowed_leaves_per_month: 2,
            allowed_absents_per_month: 0,
            overtime_rate_per_hour: 0,
            late_count_threshold: 3,
        },
        isLoading: false,
        isSaving: false,
        error: null,
    }),

    actions: {
        async fetchSettings() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await apiClient.get(API_ENDPOINTS.PAYROLL_SETTINGS);
                this.settings = response.data;
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch payroll settings';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async saveSettings(payload) {
            this.isSaving = true;
            this.error = null;
            try {
                const response = await apiClient.put(API_ENDPOINTS.PAYROLL_SETTINGS, payload);
                this.settings = response.data;
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.response?.data || error.response?.data?.message || 'Failed to save payroll settings';
                return { success: false, error: this.error };
            } finally {
                this.isSaving = false;
            }
        },
    },
});