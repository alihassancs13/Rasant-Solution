import { defineStore } from 'pinia';
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../services/baseUrl.js';

const apiClient = axios.create({ baseURL: BASE_URL });
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

function pad(n) {
    return String(n).padStart(2, '0');
}

/** Local calendar YYYY-MM-DD (avoids UTC shift from toISOString). */
function localYmd(d) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function monthBounds(date = new Date()) {
    const y = date.getFullYear();
    const m = date.getMonth();
    const from = new Date(y, m, 1);
    const to = new Date(y, m + 1, 0);
    return { from: localYmd(from), to: localYmd(to) };
}

export const useWorklogAnalyticsStore = defineStore('worklogAnalytics', {
    state: () => ({
        loading: false,
        detailLoading: false,
        exportLoading: false,
        settingsLoading: false,
        error: null,
        range: monthBounds(),
        summary: null,
        byEmployee: [],
        dailyTrend: [],
        topIssues: [],
        selectedEmployee: null,
        employeeDetail: null,
        exportSettings: {
            project_name: '',
            project_number: '',
            updated_at: null,
        },
    }),

    actions: {
        setRange(from, to) {
            this.range = { from, to };
        },

        async fetchOverview() {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await apiClient.get(API_ENDPOINTS.WORKLOG_ANALYTICS, {
                    params: { from: this.range.from, to: this.range.to },
                });
                const payload = data.data || {};
                if (payload.range?.from && payload.range?.to) {
                    this.range = { from: payload.range.from, to: payload.range.to };
                }
                this.summary = payload.summary || null;
                this.byEmployee = payload.by_employee || [];
                this.dailyTrend = payload.daily_trend || [];
                this.topIssues = payload.top_issues || [];
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to load worklog analytics';
                return { success: false, error: this.error };
            } finally {
                this.loading = false;
            }
        },

        async fetchEmployeeDetail(userId) {
            this.detailLoading = true;
            this.error = null;
            try {
                const { data } = await apiClient.get(
                    API_ENDPOINTS.WORKLOG_ANALYTICS_EMPLOYEE(userId),
                    { params: { from: this.range.from, to: this.range.to } },
                );
                const payload = data.data || null;
                if (payload?.range?.from && payload?.range?.to) {
                    this.range = { from: payload.range.from, to: payload.range.to };
                }
                this.employeeDetail = payload;
                this.selectedEmployee = userId;
                return { success: true, data: this.employeeDetail };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to load employee worklogs';
                return { success: false, error: this.error };
            } finally {
                this.detailLoading = false;
            }
        },

        clearEmployeeDetail() {
            this.selectedEmployee = null;
            this.employeeDetail = null;
        },

        async fetchExportSettings() {
            this.settingsLoading = true;
            this.error = null;
            try {
                const { data } = await apiClient.get(API_ENDPOINTS.WORKLOG_EXPORT_SETTINGS);
                this.exportSettings = { ...this.exportSettings, ...(data.data || {}) };
                return { success: true, data: this.exportSettings };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to load export settings';
                return { success: false, error: this.error };
            } finally {
                this.settingsLoading = false;
            }
        },

        async saveExportSettings(payload) {
            this.settingsLoading = true;
            this.error = null;
            try {
                const { data } = await apiClient.put(API_ENDPOINTS.WORKLOG_EXPORT_SETTINGS, payload);
                this.exportSettings = { ...this.exportSettings, ...(data.data || {}) };
                return { success: true, data: this.exportSettings, message: data.message };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to save export settings';
                return { success: false, error: this.error };
            } finally {
                this.settingsLoading = false;
            }
        },

        async exportMonthlyWorkbook() {
            this.exportLoading = true;
            this.error = null;
            try {
                const { data } = await apiClient.get(API_ENDPOINTS.WORKLOG_ANALYTICS_EXPORT, {
                    params: { from: this.range.from },
                    responseType: 'blob',
                });
                const month = (this.range.from || '').slice(0, 7) || 'timesheet';
                const blob = new Blob(
                    [data],
                    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
                );
                const url = window.URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = url;
                anchor.download = `timesheet_${month}.xlsx`;
                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();
                window.URL.revokeObjectURL(url);
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to export workbook';
                return { success: false, error: this.error };
            } finally {
                this.exportLoading = false;
            }
        },
    },
});

export const useOverviewStore = defineStore('adminOverview', {
    state: () => ({
        loading: false,
        error: null,
        stats: null,
    }),
    actions: {
        async fetchStats() {
            this.loading = true;
            this.error = null;
            try {
                const { data } = await apiClient.get(API_ENDPOINTS.OVERVIEW_STATS);
                this.stats = data.data || null;
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to load overview';
                return { success: false, error: this.error };
            } finally {
                this.loading = false;
            }
        },
    },
});
