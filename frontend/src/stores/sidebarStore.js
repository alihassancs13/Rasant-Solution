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

export const useSidebarStore = defineStore('sidebar', {
    state: () => ({
        modules: JSON.parse(localStorage.getItem('user_modules')) || [],
        isLoading: false,
        error: null,
    }),

    getters: {
        getModules: (state) => state.modules,
        hasModules: (state) => state.modules.length > 0,
    },

    actions: {
        async fetchModules() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await apiClient.get(API_ENDPOINTS.USER_MODULES);
                this.modules = response.data;
                localStorage.setItem('user_modules', JSON.stringify(response.data));
                return { success: true, data: response.data };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch modules';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        loadFromStorage() {
            const modules = JSON.parse(localStorage.getItem('user_modules'));
            if (modules) this.modules = modules;
            return modules;
        },

        clearModules() {
            this.modules = [];
            localStorage.removeItem('user_modules');
        },
    },
});