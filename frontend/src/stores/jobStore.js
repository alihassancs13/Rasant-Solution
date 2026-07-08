import { defineStore } from 'pinia';
import { jobAPI } from '../services/cvApi.js';

export const useJobStore = defineStore('job', {
    state: () => ({
        adminJobs: [],
        publicJobs: [],
        jobTypes: [],
        isLoading: false,
        error: null,
    }),

    getters: {
        getJobTypes: (state) => state.jobTypes,
    },

    actions: {
        async createJob(jobData) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await jobAPI.create(jobData);
                this.adminJobs.unshift(response.data);
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to create job';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async fetchAdminJobs() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await jobAPI.getAdminJobs();
                this.adminJobs = response.data;
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch jobs';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async fetchPublicJobs() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await jobAPI.getPublicJobs();
                this.publicJobs = response.data;
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch public jobs';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async fetchJobTypes() {
            try {
                const response = await jobAPI.getJobTypes();
                this.jobTypes = response.data;
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch job types';
                return { success: false, error: this.error };
            }
        },

        async updateJob(id, jobData) {
            try {
                const response = await jobAPI.update(id, jobData);
                const index = this.adminJobs.findIndex((j) => j.id === id);
                if (index !== -1) {
                    this.adminJobs[index] = { ...this.adminJobs[index], ...response.data };
                }
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to update job';
                return { success: false, error: this.error };
            }
        },


    },
});