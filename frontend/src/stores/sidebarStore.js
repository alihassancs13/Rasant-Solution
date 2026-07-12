import { defineStore } from 'pinia';
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../services/baseUrl.js';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const useSidebarStore = defineStore('sidebar', {
    state: () => ({
        modules: [], // Always initialize as array
        isLoading: false,
        error: null,
    }),

    getters: {
        hasModules: (state) => state.modules?.length > 0,
        getModuleByName: (state) => (name) => {
            if (!state.modules || !Array.isArray(state.modules)) return null;
            return state.modules.find(m => m?.name?.trim() === name?.trim());
        },
        getModuleRoute: (state) => (name) => {
            if (!state.modules || !Array.isArray(state.modules)) {
                return `/admin/${name?.toLowerCase().replace(/ /g, '-')}`;
            }
            const module = state.modules.find(m => m?.name?.trim() === name?.trim());
            return module?.link || `/admin/${name?.toLowerCase().replace(/ /g, '-')}`;
        },
    },

    actions: {
        async fetchModules() {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiClient.get(API_ENDPOINTS.USER_MODULES);

                // Handle different response formats
                let modulesData = response.data;

                // If response has a data property with modules
                if (response.data?.data?.modules) {
                    modulesData = response.data.data.modules;
                }
                // If response has modules directly
                else if (response.data?.modules) {
                    modulesData = response.data.modules;
                }
                // If response has data property that is an array
                else if (response.data?.data && Array.isArray(response.data.data)) {
                    modulesData = response.data.data;
                }
                // If response itself is an object with status and data
                else if (response.data?.status && response.data?.data?.modules) {
                    modulesData = response.data.data.modules;
                }

                // Ensure we have an array
                if (Array.isArray(modulesData)) {
                    this.modules = modulesData;
                    return { success: true, data: modulesData };
                } else {
                    console.error('Unexpected modules format:', response.data);
                    this.modules = [];
                    return {
                        success: false,
                        error: 'Invalid modules data format'
                    };
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch modules';
                this.modules = []; // Reset to empty array on error
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        clearModules() {
            this.modules = [];
            this.error = null;
        },
    },
});