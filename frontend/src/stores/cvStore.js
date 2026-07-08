import { defineStore } from 'pinia';
import { cvAPI } from '../services/cvApi.js';

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
            this.error = null;
            try {
                const response = await cvAPI.submitCV(formData);
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.response?.data?.message || 'CV submission failed';
                return { success: false, error: this.error };
            } finally {
                this.isSubmitting = false;
            }
        },

        async fetchCVs() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await cvAPI.getAll();
                this.cvList = response.data;
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
                await cvAPI.delete(id);
                this.cvList = this.cvList.filter((cv) => cv.id !== id);
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to delete CV';
                return { success: false, error: this.error };
            }
        },

        async downloadCV(id, filename = 'cv.pdf') {
            try {
                const response = await cvAPI.download(id);
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
                const response = await cvAPI.updateStatus(id, data);
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