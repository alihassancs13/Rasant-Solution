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

export const useEmployeeOverviewStore = defineStore('employeeOverview', {
    state: () => ({
        overview: null,
        isLoading: false,
        isPunching: false,
        isSavingWfh: false,
        isSavingWorkUpdate: false,
        error: null,
        punchMessage: null,
    }),

    getters: {
        today: (state) => state.overview?.today || null,
        allowances: (state) => state.overview?.allowances || null,
        month: (state) => state.overview?.month || null,
        recent: (state) => state.overview?.recent || [],
        employee: (state) => state.overview?.employee || null,
        workUpdate: (state) => state.overview?.work_update || null,
        canCheckIn: (state) => Boolean(state.overview?.today?.can_check_in),
        canCheckOut: (state) => Boolean(state.overview?.today?.can_check_out),
    },

    actions: {
        async fetchOverview() {
            this.isLoading = true;
            this.error = null;
            try {
                const { data } = await apiClient.get(API_ENDPOINTS.ATTENDANCE.MY_OVERVIEW);
                this.overview = data;
                return { success: true, data };
            } catch (error) {
                this.error =
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Failed to load overview';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async punch(action, coords) {
            this.isPunching = true;
            this.punchMessage = null;
            this.error = null;
            const endpoint =
                action === 'check_in'
                    ? API_ENDPOINTS.ATTENDANCE.MY_CHECK_IN
                    : API_ENDPOINTS.ATTENDANCE.MY_CHECK_OUT;
            try {
                const { data } = await apiClient.post(endpoint, {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    address: coords.address || '',
                    accuracy: coords.accuracy ?? null,
                });
                if (data.today && this.overview) {
                    this.overview.today = data.today;
                }
                await this.fetchOverview();
                this.punchMessage = data.message || (action === 'check_in' ? 'Checked in' : 'Checked out');
                return { success: true, data };
            } catch (error) {
                this.error =
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Attendance action failed';
                return { success: false, error: this.error };
            } finally {
                this.isPunching = false;
            }
        },

        async setWorkFromHome(enabled) {
            this.isSavingWfh = true;
            this.error = null;
            try {
                const { data } = await apiClient.patch(API_ENDPOINTS.ATTENDANCE.MY_WORK_FROM_HOME, {
                    work_from_home: Boolean(enabled),
                });
                if (this.overview?.employee) {
                    this.overview.employee.work_from_home = Boolean(data.work_from_home);
                }
                return { success: true, data };
            } catch (error) {
                this.error =
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Failed to update Work from home';
                return { success: false, error: this.error };
            } finally {
                this.isSavingWfh = false;
            }
        },

        async saveWorkUpdate(note) {
            this.isSavingWorkUpdate = true;
            this.error = null;
            try {
                const { data } = await apiClient.put(API_ENDPOINTS.ATTENDANCE.MY_WORK_UPDATE, {
                    note: String(note || '').trim(),
                });
                if (this.overview) {
                    this.overview.work_update = data.work_update || { note: String(note || '').trim() };
                }
                return { success: true, data };
            } catch (error) {
                this.error =
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Failed to save work update';
                return { success: false, error: this.error };
            } finally {
                this.isSavingWorkUpdate = false;
            }
        },
    },
});
