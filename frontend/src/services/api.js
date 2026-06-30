// services/api.js
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from './baseUrl.js';
import { useLoginStore } from '../stores/loginStore.js';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        // Get token from sessionStorage
        const token = sessionStorage.getItem('accessToken');  // Changed
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const loginStore = useLoginStore();

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = sessionStorage.getItem('refreshToken');  // Changed

            if (refreshToken) {
                try {
                    const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, {
                        refresh: refreshToken,
                    });

                    const newAccessToken = response.data.access;
                    sessionStorage.setItem('accessToken', newAccessToken);  // Changed

                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed - logout
                    sessionStorage.removeItem('accessToken');  // Changed
                    sessionStorage.removeItem('refreshToken');  // Changed
                    sessionStorage.removeItem('user');  // Changed
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
    login: (credentials) => api.post(API_ENDPOINTS.LOGIN, credentials),
    refreshToken: (refreshToken) => api.post(API_ENDPOINTS.REFRESH_TOKEN, { refresh: refreshToken }),
    logout: (refreshToken) => api.post(API_ENDPOINTS.LOGOUT, { refresh: refreshToken }),
    getProfile: () => api.get(API_ENDPOINTS.USER_PROFILE),
    changePassword: (data) => api.post(API_ENDPOINTS.CHANGE_PASSWORD, data),
};

export default api;