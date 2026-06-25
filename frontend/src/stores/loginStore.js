// stores/loginStore.js
import { defineStore } from 'pinia';
import { authAPI } from '../services/api';

export const useLoginStore = defineStore('login', {
    state: () => ({
        accessToken: sessionStorage.getItem('accessToken') || null,
        refreshToken: sessionStorage.getItem('refreshToken') || null,
        user: JSON.parse(sessionStorage.getItem('user')) || null,
        isAuthenticated: !!sessionStorage.getItem('accessToken'),
        isLoading: false,
        error: null,
    }),

    getters: {
        getUser: (state) => state.user,
        getUserRole: (state) => state.user?.role_name || state.user?.role || 'client',
        getUserName: (state) => state.user?.username || state.user?.email || '',
        getUserEmail: (state) => state.user?.email || '',
    },

    actions: {
        setTokens(accessToken, refreshToken) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.isAuthenticated = true;
            sessionStorage.setItem('accessToken', accessToken);
            sessionStorage.setItem('refreshToken', refreshToken);
            console.log(' Tokens stored');
        },

        setUser(user) {
            this.user = user;
            sessionStorage.setItem('user', JSON.stringify(user));
            console.log('👤 User stored:', user?.username || user?.email);
        },

        clearTokens() {
            this.accessToken = null;
            this.refreshToken = null;
            this.user = null;
            this.isAuthenticated = false;
            this.error = null;
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
            console.log('🗑 Tokens cleared');
        },

        async login(credentials) {
            this.isLoading = true;
            this.error = null;

            try {
                const response = await authAPI.login(credentials);
                const { status, data, message } = response.data;

                if (status) {
                    const { access_token, refresh_token, user } = data;
                    this.setTokens(access_token, refresh_token);
                    this.setUser(user);
                    return { success: true, user, message: message || 'Login successful' };
                } else {
                    this.error = message || 'Login failed';
                    return { success: false, error: this.error };
                }
            } catch (error) {
                let errorMessage = 'An unexpected error occurred';
                if (error.response) {
                    const status = error.response.status;
                    if (status === 401) errorMessage = 'Invalid credentials. Please check your email or  username and password.';
                    else if (status === 404) errorMessage = 'User not found. Please check your email or username.';
                    else if (status === 400) errorMessage = error.response.data?.message || 'Invalid request.';
                    else if (status === 500) errorMessage = 'Server error. Please try again later.';
                    else errorMessage = error.response.data?.message || `Error ${status}: Please try again.`;
                } else if (error.request) {
                    errorMessage = 'Network error. Please check your connection.';
                }
                this.error = errorMessage;
                return { success: false, error: errorMessage };
            } finally {
                this.isLoading = false;
            }
        },

        async logout() {
            try {
                if (this.refreshToken) await authAPI.logout(this.refreshToken);
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                this.clearTokens();
            }
        },

        async refreshToken() {
            if (!this.refreshToken) {
                this.clearTokens();
                return false;
            }
            try {
                const response = await authAPI.refreshToken(this.refreshToken);
                if (response.data?.access) {
                    this.setTokens(response.data.access, this.refreshToken);
                    return true;
                }
                this.clearTokens();
                return false;
            } catch (error) {
                this.clearTokens();
                return false;
            }
        },

        redirectBasedOnRole() {
            const role = this.getUserRole?.toLowerCase() || 'client';
            const roleMap = {
                'admin': '/home',
                'superuser': '/home',
                'employee': '/home',
                'staff': '/home',
                'client': '/home',
                'user': '/home',
            };
            return roleMap[role] || '/home';
        },

        // Helper methods
        hasRole(role) {
            return this.getUserRole?.toLowerCase() === role.toLowerCase();
        },

        isTokenExpired() {
            if (!this.accessToken) return true;
            try {
                const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
                return Date.now() >= payload.exp * 1000;
            } catch {
                return true;
            }
        },

        initialize() {
            const token = sessionStorage.getItem('accessToken');
            this.accessToken = token || null;
            this.refreshToken = sessionStorage.getItem('refreshToken') || null;
            this.user = JSON.parse(sessionStorage.getItem('user')) || null;
            this.isAuthenticated = !!token;
            return this.isAuthenticated;
        }
    },

    persist: {
        enabled: true,
        strategies: [
            {
                key: 'loginStore',
                storage: sessionStorage,
                paths: ['accessToken', 'refreshToken', 'user', 'isAuthenticated'],
            },
        ],
    },
});