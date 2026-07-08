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

export const useCvStore = defineStore('cv', {
    state: () => ({
        cvList: [],
        isLoading: false,
        isSubmitting: false,
        error: null,
    }),

    getters: {
        getCvList: (state) => state.cvList,
        totalCVs: (state) => state.cvList.length,
        getCvById: (state) => (id) => state.cvList.find((cv) => cv.id === id),
    },

    actions: {
        async submitCV(formData) {
            this.isSubmitting = true;
            try {
                const response = await apiClient.post(API_ENDPOINTS.CV_SUBMIT, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                return response;
            } finally {
                this.isSubmitting = false;
            }
        },

        async fetchCVs() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await apiClient.get(API_ENDPOINTS.CV_LIST);
                const raw = response?.data?.data ?? response?.data ?? [];
                this.cvList = Array.isArray(raw) ? raw : [];
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch CVs';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async deleteCV(id) {
            try {
                await apiClient.delete(`/api/cv_management/cv/${id}/delete/`);
                this.cvList = this.cvList.filter((cv) => cv.id !== id);
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to delete CV';
                return { success: false, error: this.error };
            }
        },

        async downloadCV(id, filename = 'cv.pdf') {
            try {
                const response = await apiClient.get(`/api/cv_management/cv/${id}/download/`, {
                    responseType: 'blob',
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to download CV';
                return { success: false, error: this.error };
            }
        },

        async updateStatus(id, data) {
            try {
                const response = await apiClient.put(`/api/cv_management/cv/${id}/status/`, data);
                const index = this.cvList.findIndex((cv) => cv.id === id);
                if (index !== -1) {
                    this.cvList[index] = { ...this.cvList[index], ...response.data };
                }
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to update status';
                return { success: false, error: this.error };
            }
        },
    },
});