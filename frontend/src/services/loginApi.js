// services/loginApi.js
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from './baseUrl.js';
import { useLoginStore } from '../stores/loginStore.js';

const loginApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
loginApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');   // ← changed
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for token refresh
loginApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const loginStore = useLoginStore();

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = sessionStorage.getItem('refreshToken');  // Changed

            if (refreshToken) {
                try {
                    const response = await loginApi.post(API_ENDPOINTS.REFRESH_TOKEN, {
                        refresh: refreshToken,
                    });

                    const newAccessToken = response.data.access;
                    localStorage.setItem('accessToken', newAccessToken);    // Changed

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return loginApi(originalRequest);
                } catch (refreshError) {
                    // Refresh failed - logout
                    localStorage.removeItem('accessToken');   // ← changed
                    localStorage.removeItem('refreshToken');  // ← changed
                    localStorage.removeItem('user');    // Changed
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    login: (credentials) => loginApi.post(API_ENDPOINTS.LOGIN, credentials),
    refreshToken: (refreshToken) => loginApi.post(API_ENDPOINTS.REFRESH_TOKEN, { refresh: refreshToken }),
    logout: (refreshToken) => loginApi.post(API_ENDPOINTS.LOGOUT, { refresh: refreshToken }),
    forgotPassword: (email) => loginApi.post(API_ENDPOINTS.PASSWORD_FORGOT, { email }),
    verifyResetOtp: (email, code) => loginApi.post(API_ENDPOINTS.PASSWORD_VERIFY_OTP, { email, code }),
    resetPassword: (payload) => loginApi.post(API_ENDPOINTS.PASSWORD_RESET, payload),
    validateSetupToken: (token) => loginApi.get(API_ENDPOINTS.PASSWORD_SETUP(token)),
    confirmSetupPassword: (token, payload) => loginApi.post(API_ENDPOINTS.PASSWORD_SETUP_CONFIRM(token), payload),
};

export default loginApi;