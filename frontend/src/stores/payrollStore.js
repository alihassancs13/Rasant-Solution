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
            default_timetable: '10 - 7',
            office_latitude: null,
            office_longitude: null,
            office_radius_meters: 150,
            office_address: '',
            office_configured: false,
            office_set_at: null,
        },
        holidays: [],
        holidaysLoading: false,
        holidaySaving: false,
        isLoading: false,
        isSaving: false,
        isSettingOffice: false,
        error: null,
    }),

    actions: {
        async fetchSettings() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await apiClient.get(API_ENDPOINTS.PAYROLL_SETTINGS);
                this.settings = { ...this.settings, ...response.data };
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
                this.settings = { ...this.settings, ...response.data };
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.response?.data || error.response?.data?.message || 'Failed to save payroll settings';
                return { success: false, error: this.error };
            } finally {
                this.isSaving = false;
            }
        },

        async setOfficeFromDevice(coords) {
            this.isSettingOffice = true;
            this.error = null;
            try {
                const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.OFFICE_LOCATION, {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    office_address: coords.address || '',
                    office_radius_meters: this.settings.office_radius_meters,
                    default_timetable: this.settings.default_timetable,
                });
                this.settings = { ...this.settings, ...(response.data?.data || {}) };
                return { success: true, data: response.data };
            } catch (error) {
                this.error =
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Failed to set office location';
                return { success: false, error: this.error };
            } finally {
                this.isSettingOffice = false;
            }
        },

        async fetchHolidays(year) {
            this.holidaysLoading = true;
            this.error = null;
            try {
                const params = year ? { year } : {};
                const response = await apiClient.get(API_ENDPOINTS.HOLIDAYS, { params });
                this.holidays = Array.isArray(response.data?.holidays) ? response.data.holidays : [];
                return { success: true, data: this.holidays };
            } catch (error) {
                this.error =
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Failed to load holidays';
                return { success: false, error: this.error };
            } finally {
                this.holidaysLoading = false;
            }
        },

        async createHoliday(payload) {
            this.holidaySaving = true;
            this.error = null;
            try {
                const response = await apiClient.post(API_ENDPOINTS.HOLIDAYS, payload);
                const row = response.data?.holiday;
                if (row) {
                    this.holidays = [row, ...this.holidays.filter((h) => h.id !== row.id)];
                }
                return {
                    success: true,
                    data: response.data,
                    message: response.data?.message || 'Holiday saved.',
                };
            } catch (error) {
                this.error =
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Failed to create holiday';
                return { success: false, error: this.error };
            } finally {
                this.holidaySaving = false;
            }
        },

        async deleteHoliday(id) {
            this.holidaySaving = true;
            this.error = null;
            try {
                const response = await apiClient.delete(API_ENDPOINTS.HOLIDAY_DETAIL(id));
                this.holidays = this.holidays.filter((h) => h.id !== id);
                return {
                    success: true,
                    message: response.data?.message || 'Holiday removed.',
                };
            } catch (error) {
                this.error =
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    'Failed to delete holiday';
                return { success: false, error: this.error };
            } finally {
                this.holidaySaving = false;
            }
        },
    },
});
