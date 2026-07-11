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

export const usePolicyStore = defineStore('policy', {
    state: () => ({
        policies: [],
        incrementTypes: [],
        cycleTimings: [],
        applicationModes: [],
        isLoading: false,
        isSubmitting: false,
        error: null,
    }),

    getters: {
        getPolicyById: (state) => (id) => state.policies.find((p) => p.id === id),
        activePolicies: (state) => state.policies.filter((p) => p.is_active),
    },

    actions: {
        async fetchPolicies() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await apiClient.get(API_ENDPOINTS.INCREMENT_POLICIES);
                this.policies = response?.data?.data ?? [];
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch policies';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        async fetchLookups() {
            try {
                const response = await apiClient.get(API_ENDPOINTS.INCREMENT_LOOKUPS);
                const data = response?.data?.data ?? {};
                this.incrementTypes    = data.increment_types ?? [];
                this.cycleTimings      = data.cycle_timings ?? [];
                this.applicationModes  = data.application_modes ?? [];
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch lookup data';
                return { success: false, error: this.error };
            }
        },

        async createPolicy(payload) {
            this.isSubmitting = true;
            try {
                const response = await apiClient.post(API_ENDPOINTS.INCREMENT_POLICIES, payload);
                this.policies.unshift(response.data.data);
                return { success: true, data: response.data.data };
            } catch (error) {
                this.error = error.response?.data?.errors || error.response?.data?.message || 'Failed to create policy';
                return { success: false, error: this.error };
            } finally {
                this.isSubmitting = false;
            }
        },

        async updatePolicy(id, payload) {
            this.isSubmitting = true;
            try {
                const response = await apiClient.put(`${API_ENDPOINTS.INCREMENT_POLICIES}${id}/`, payload);
                const index = this.policies.findIndex((p) => p.id === id);
                if (index !== -1) this.policies[index] = response.data.data;
                return { success: true, data: response.data.data };
            } catch (error) {
                this.error = error.response?.data?.errors || error.response?.data?.message || 'Failed to update policy';
                return { success: false, error: this.error };
            } finally {
                this.isSubmitting = false;
            }
        },

        async deletePolicy(id) {
            try {
                await apiClient.delete(`${API_ENDPOINTS.INCREMENT_POLICIES}${id}/`);
                this.policies = this.policies.filter((p) => p.id !== id);
                return { success: true };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to delete policy';
                return { success: false, error: this.error };
            }
        },
    },
});