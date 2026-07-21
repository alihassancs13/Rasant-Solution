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

export const useAttendanceStore = defineStore('attendance', {
    state: () => ({
        employees: [],
        currentHistory: null,
        isLoading: false,
        isLoadingHistory: false,
        isSubmitting: false,
        isUpdating: false,
        error: null,
    }),

    getters: {
        getEmployees: (state) => state.employees,
        totalEmployees: (state) => state.employees.length,
        getHistory: (state) => state.currentHistory?.history ?? [],
        getHistoryStats: (state) => state.currentHistory?.historyStats ?? {
            present: 0, late: 0, absent: 0, on_leave: 0,
        },
    },

    actions: {
        async fetchAttendanceList(params = {}) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.LIST, { params });
                this.employees = response.data;
                return { success: true };
            } finally {
                this.isLoading = false;
            }
        },

        async fetchAttendanceHistory(employeeId, params = {}) {
            this.isLoadingHistory = true;
            this.error = null;
            try {
                const response = await apiClient.get(
                    API_ENDPOINTS.ATTENDANCE.HISTORY(employeeId),
                    { params },
                );
                this.currentHistory = response.data;
                return { success: true };
            } finally {
                this.isLoadingHistory = false;
            }
        },

        async bulkUploadAttendance(rows) {
            this.isSubmitting = true;
            this.error = null;
            try {
                const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.BULK_UPLOAD, { rows });
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.response?.data?.error || 'Upload failed.';
                return { success: false, error: this.error };
            } finally {
                this.isSubmitting = false;
            }
        },

        async updateAttendanceRecord(recordId, payload) {
            this.isUpdating = true;
            this.error = null;
            try {
                const response = await apiClient.put(
                    API_ENDPOINTS.ATTENDANCE.RECORD_UPDATE(recordId),
                    payload,
                );
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to update record';
                return { success: false, error: this.error };
            } finally {
                this.isUpdating = false;
            }
        },
    },
});