import { defineStore } from 'pinia';
import { fetchUserModules, getStoredModules, storeModules, clearStoredModules } from '../services/adminsidebarApi.js';

export const useSidebarStore = defineStore('sidebar', {
    state: () => ({
        modules: getStoredModules() || [],
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
                const data = await fetchUserModules();
                this.modules = data;
                storeModules(data);
                return { success: true, data };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch modules';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },

        loadFromStorage() {
            const modules = getStoredModules();
            if (modules) this.modules = modules;
            return modules;
        },

        clearModules() {
            this.modules = [];
            clearStoredModules();
        },
    },
});