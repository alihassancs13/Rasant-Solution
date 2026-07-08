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
                return response;
            } finally {
                this.isLoading = false;
            }
        },

        async updateJob(id, jobData) {
            this.isLoading = true;
            try {
                const response = await apiClient.put(`/api/cv_management/job-openings/${id}/update/`, jobData);
                return response;
            } finally {
                this.isLoading = false;
            }
        },

        async fetchAdminJobs() {
            this.isLoading = true;
            try {
                const response = await apiClient.get(API_ENDPOINTS.JOB_ADMIN_LIST);
                this.adminJobs = response.data?.data || [];
                return response;
            } finally {
                this.isLoading = false;
            }
        },

        async fetchPublicJobs() {
            this.isLoading = true;
            try {
                const response = await apiClient.get(API_ENDPOINTS.JOB_PUBLIC_LIST);
                this.publicJobs = response.data?.data || [];
                return response;
            } finally {
                this.isLoading = false;
            }
        },

        async fetchJobTypes() {
            const response = await apiClient.get(API_ENDPOINTS.JOB_TYPES);
            this.jobTypes = response.data;
            return response;
        },

        async deleteJob(id) {
            await apiClient.delete(`/api/cv_management/job-openings/${id}/delete/`);
            this.adminJobs = this.adminJobs.filter((j) => j.id !== id);
        },
    },
});