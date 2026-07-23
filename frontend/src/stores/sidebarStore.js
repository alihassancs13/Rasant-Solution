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

function flattenModules(modules = []) {
    const flat = [];
    modules.forEach((m) => {
        flat.push(m);
        if (Array.isArray(m?.children)) {
            m.children.forEach((c) => flat.push(c));
        }
    });
    return flat;
}

export const useSidebarStore = defineStore('sidebar', {
    state: () => ({
        modules: [],
        accountModules: [],
        projectModules: [],
        isLoading: false,
        error: null,
    }),

    getters: {
        hasModules: (state) => state.modules?.length > 0,
        getModuleByName: (state) => (name) => {
            const all = [
                ...flattenModules(state.modules),
                ...(state.accountModules || []),
                ...(state.projectModules || []),
            ];
            return all.find((m) => m?.name?.trim() === name?.trim()) || null;
        },
        getModuleRoute: (state) => (name) => {
            const all = [
                ...flattenModules(state.modules),
                ...(state.accountModules || []),
                ...(state.projectModules || []),
            ];
            const module = all.find((m) => m?.name?.trim() === name?.trim());
            if (module?.link) return module.link;
            return `/admin/${name?.toLowerCase().replace(/ /g, '-')}`;
        },
    },

    actions: {
        async fetchModules() {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await apiClient.get(API_ENDPOINTS.USER_MODULES);
                const data = response.data?.data || response.data || {};

                let modulesData = data.modules;
                if (!Array.isArray(modulesData) && Array.isArray(response.data?.modules)) {
                    modulesData = response.data.modules;
                }
                if (!Array.isArray(modulesData) && Array.isArray(data)) {
                    modulesData = data;
                }

                this.modules = Array.isArray(modulesData) ? modulesData : [];
                this.accountModules = Array.isArray(data.account_modules) ? data.account_modules : [];
                this.projectModules = Array.isArray(data.project_modules) ? data.project_modules : [];

                return { success: true, data: this.modules };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch modules';
                this.modules = [];
                this.accountModules = [];
                this.projectModules = [];
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        clearModules() {
            this.modules = [];
            this.accountModules = [];
            this.projectModules = [];
            this.error = null;
        },
    },
});
