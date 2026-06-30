// stores/loginStore.js
import { defineStore } from 'pinia';
import { authAPI } from '../services/loginApi.js';

export const useLoginStore = defineStore('login', {
    state: () => ({
        accessToken: sessionStorage.getItem('accessToken') || null,
        refreshToken: sessionStorage.getItem('refreshToken') || null,
        user: JSON.parse(sessionStorage.getItem('user')) || null,
        isAuthenticated: !!sessionStorage.getItem('accessToken'),
        isLoading: false,
        error: null,
        errorType: null,
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
        },

        setUser(user) {
            this.user = user;
            sessionStorage.setItem('user', JSON.stringify(user));
        },

        clearTokens() {
            this.accessToken = null;
            this.refreshToken = null;
            this.user = null;
            this.isAuthenticated = false;
            this.error = null;
            this.errorType = null;
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
        },

        async login(credentials) {
            this.isLoading = true;
            this.error = null;
            this.errorType = null;

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
                let errorType = null;

                if (error.response) {
                    // Get the error type from backend if available
                    errorType = error.response.data?.error_type;

                    // Get the specific error message from backend
                    const backendMessage = error.response.data?.message;

                    if (backendMessage) {
                        // Use the specific backend error message
                        errorMessage = backendMessage;
                    } else {
                        // Fallback messages
                        const status = error.response.status;
                        if (status === 401) {
                            errorMessage = 'Incorrect password. Please try again.';
                            errorType = 'incorrect_password';
                        } else if (status === 404) {
                            // Determine if it's email or username from the request
                            const hasEmail = credentials.email !== undefined;
                            const hasUsername = credentials.username !== undefined;

                            if (hasEmail) {
                                errorMessage = `Email '${credentials.email}' not found`;
                                errorType = 'email_not_found';
                            } else if (hasUsername) {
                                errorMessage = `Invalid Username '${credentials.username}' `;
                                errorType = 'username_not_found';
                            } else {
                                errorMessage = 'User not found. Please check your credentials.';
                            }
                        } else if (status === 400) {
                            errorMessage = error.response.data?.message || 'Invalid request. Please check your input.';
                        } else if (status === 500) {
                            errorMessage = 'Server error. Please try again later.';
                        } else {
                            errorMessage = error.response.data?.message || `Error ${status}: Please try again.`;
                        }
                    }
                } else if (error.request) {
                    errorMessage = 'Network error. Please check your connection.';
                }

                this.error = errorMessage;
                this.errorType = errorType;
                return { success: false, error: errorMessage, errorType };
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
                'admin': '/admin/overview',
                'superuser': '/',
                'employee': '/',
                'staff': '/',
                'client': '/',
                'user': '/',
            };
            return roleMap[role] || '/';
        },

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