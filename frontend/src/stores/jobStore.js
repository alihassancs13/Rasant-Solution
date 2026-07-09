import { defineStore } from 'pinia';
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../services/baseUrl.js';

const getAuthToken = () => localStorage.getItem('accessToken');

const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const useJobStore = defineStore('job', {
    state: () => ({
        adminJobs: [],
        publicJobs: [],
        jobTypes: [],
        jobStatus: [],
        isLoading: false,
        error: null,
    }),

    getters: {
        getAdminJobs: (state) => state.adminJobs,
        getPublicJobs: (state) => state.publicJobs,
        getJobTypes: (state) => state.jobTypes,
    },

    actions: {
        async createJob(jobData) {
            this.isLoading = true;
            try {
                const response = await apiClient.post(API_ENDPOINTS.JOB_CREATE, jobData);
                return { success: true, data: response.data };
            } catch (err) {
                return {
                    success: false,
                    error: err.response?.data?.message || err.response?.data?.error || 'Failed to create job.'
                };
            } finally {
                this.isLoading = false;
            }
        },

        async updateJob(id, jobData) {
            this.isLoading = true;
            try {
                const response = await apiClient.put(`/api/employeeDashboard/job-openings/${id}/update/`, jobData);
                return { success: true, data: response.data };
            } catch (err) {
                return {
                    success: false,
                    error: err.response?.data?.message || err.response?.data?.error || 'Failed to update job.'
                };
            } finally {
                this.isLoading = false;
            }
        },

        async fetchAdminJobs() {
            this.isLoading = true;
            try {
                const response = await apiClient.get(API_ENDPOINTS.JOB_ADMIN_LIST);
                this.adminJobs = response.data?.data || [];
                return { success: true, data: this.adminJobs };
            } catch (err) {
                return { success: false, error: 'Failed to load jobs.' };
            } finally {
                this.isLoading = false;
            }
        },

        async fetchPublicJobs() {
            this.isLoading = true;
            try {
                const response = await axios.get(`${BASE_URL}${API_ENDPOINTS.JOB_PUBLIC_LIST}`);
                this.publicJobs = response.data?.data || [];
                return { success: true, data: this.publicJobs };
            } catch (err) {
                return { success: false, error: 'Failed to load public jobs.' };
            } finally {
                this.isLoading = false;
            }
        },
        async fetchJobTypes() {
            try {
                const response = await apiClient.get(API_ENDPOINTS.JOB_TYPES);
                this.jobTypes = response.data?.data || response.data || [];
                return { success: true, data: this.jobTypes };
            } catch (err) {
                return { success: false, error: 'Failed to load job types.' };
            }
        },

        async fetchjobStatus() {
            try {
                const response = await apiClient.get(API_ENDPOINTS.JOB_STATUS);
                this.jobStatus = response.data?.data || response.data || [];
                return { success: true, data: this.jobStatus };
            } catch (err) {
                return { success: false, error: 'Failed to load job statuses.' };
            }
        },

    },
});