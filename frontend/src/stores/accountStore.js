import { defineStore } from 'pinia';
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../services/baseUrl.js';
import { useLoginStore } from './loginStore.js';

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

export const useAccountStore = defineStore('account', {
    state: () => ({
        profile: null,
        emailSettings: null,
        isLoadingProfile: false,
        isLoadingEmail: false,
        isSavingProfile: false,
        isSavingPassword: false,
        isSavingEmail: false,
        isTestingEmail: false,
        error: null,
    }),

    getters: {
        isAdmin: (state) => {
            const role = (state.profile?.role_name || '').toLowerCase();
            return role === 'admin' || role === 'administrator';
        },
    },

    actions: {
        async fetchProfile() {
            this.isLoadingProfile = true;
            this.error = null;
            try {
                const { data } = await apiClient.get(API_ENDPOINTS.PROFILE);
                this.profile = data.data;
                return { success: true, data: this.profile };
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to load profile';
                return { success: false, error: this.error };
            } finally {
                this.isLoadingProfile = false;
            }
        },

        async updateProfile(payload) {
            this.isSavingProfile = true;
            this.error = null;
            try {
                const { data } = await apiClient.patch(API_ENDPOINTS.PROFILE, payload);
                this.profile = { ...this.profile, ...data.data };
                const loginStore = useLoginStore();
                if (loginStore.user) {
                    loginStore.setUser({ ...loginStore.user, ...data.data });
                }
                return { success: true, message: data.message || 'Profile updated.' };
            } catch (error) {
                const msg = error.response?.data?.message || 'Failed to update profile';
                const errors = error.response?.data?.errors;
                return { success: false, error: msg, errors };
            } finally {
                this.isSavingProfile = false;
            }
        },

        async changePassword(payload) {
            this.isSavingPassword = true;
            try {
                const { data } = await apiClient.post(API_ENDPOINTS.CHANGE_PASSWORD, payload);
                return { success: true, message: data.message || 'Password updated.' };
            } catch (error) {
                return {
                    success: false,
                    error: error.response?.data?.message || 'Failed to change password',
                    errors: error.response?.data?.errors,
                };
            } finally {
                this.isSavingPassword = false;
            }
        },

        async uploadAvatar(file) {
            try {
                const form = new FormData();
                form.append('avatar', file);
                const token = localStorage.getItem('accessToken');
                await axios.post(`${BASE_URL.replace(/\/$/, '')}${API_ENDPOINTS.ACCOUNTS_UPDATE_MY_AVATAR}`, form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (this.profile) this.profile.has_avatar = true;
                return { success: true };
            } catch (error) {
                return { success: false, error: error.response?.data?.error || 'Avatar upload failed' };
            }
        },

        async fetchEmailSettings() {
            this.isLoadingEmail = true;
            try {
                const { data } = await apiClient.get(API_ENDPOINTS.EMAIL_SETTINGS);
                this.emailSettings = data.data;
                return { success: true, data: this.emailSettings };
            } catch (error) {
                return {
                    success: false,
                    error: error.response?.data?.message || 'Failed to load email settings',
                };
            } finally {
                this.isLoadingEmail = false;
            }
        },

        async saveEmailSettings(payload) {
            this.isSavingEmail = true;
            try {
                const { data } = await apiClient.patch(API_ENDPOINTS.EMAIL_SETTINGS, payload);
                this.emailSettings = data.data;
                return { success: true, message: data.message || 'Email settings saved.' };
            } catch (error) {
                return {
                    success: false,
                    error: error.response?.data?.message || 'Failed to save email settings',
                    errors: error.response?.data?.errors,
                };
            } finally {
                this.isSavingEmail = false;
            }
        },

        async testEmailSettings(toEmail) {
            this.isTestingEmail = true;
            try {
                const { data } = await apiClient.post(API_ENDPOINTS.EMAIL_SETTINGS_TEST, {
                    to_email: toEmail,
                });
                return { success: true, message: data.message || 'Test email sent.' };
            } catch (error) {
                return {
                    success: false,
                    error: error.response?.data?.message || 'Failed to send test email',
                };
            } finally {
                this.isTestingEmail = false;
            }
        },
    },
});
