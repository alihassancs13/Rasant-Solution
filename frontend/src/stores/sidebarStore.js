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

/** How long modules are treated as fresh (skip network). */
const MODULES_TTL_MS = 5 * 60 * 1000;

export const useSidebarStore = defineStore('sidebar', {
    state: () => ({
        modules: [],
        accountModules: [],
        projectModules: [],
        isLoading: false,
        error: null,
        lastFetchedAt: 0,
        _inflight: null,
    }),

    getters: {
        hasModules: (state) => state.modules?.length > 0,
        isFresh: (state) =>
            Boolean(state.lastFetchedAt) &&
            Date.now() - state.lastFetchedAt < MODULES_TTL_MS &&
            (state.modules?.length > 0 || state.accountModules?.length > 0),
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
        setModulesFromLogin(data = {}) {
            const modulesData = Array.isArray(data.modules) ? data.modules : [];
            this.modules = modulesData;
            this.accountModules = Array.isArray(data.account_modules) ? data.account_modules : [];
            this.projectModules = Array.isArray(data.project_modules) ? data.project_modules : [];
            this.lastFetchedAt = Date.now();
            this.error = null;
            this.isLoading = false;
        },

        /**
         * @param {{ force?: boolean }} [opts]
         * Skips network when cache is fresh unless force=true.
         * Does not show loading spinner when modules are already on screen.
         */
        async fetchModules(opts = {}) {
            const force = Boolean(opts.force);

            if (!force && this.isFresh) {
                return { success: true, cached: true, data: this.modules };
            }

            if (this._inflight) {
                return this._inflight;
            }

            const showSpinner = !this.hasModules;
            if (showSpinner) {
                this.isLoading = true;
            }
            this.error = null;

            this._inflight = (async () => {
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
                    this.lastFetchedAt = Date.now();

                    return { success: true, data: this.modules };
                } catch (error) {
                    this.error = error.response?.data?.message || 'Failed to fetch modules';
                    if (!this.hasModules) {
                        this.modules = [];
                        this.accountModules = [];
                        this.projectModules = [];
                    }
                    return { success: false, error: this.error };
                } finally {
                    this.isLoading = false;
                    this._inflight = null;
                }
            })();

            return this._inflight;
        },

        clearModules() {
            this.modules = [];
            this.accountModules = [];
            this.projectModules = [];
            this.error = null;
            this.lastFetchedAt = 0;
            this._inflight = null;
            this.isLoading = false;
        },
    },
});
