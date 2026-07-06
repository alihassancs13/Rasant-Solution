// services/sidebarApi.js
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../services/baseUrl.js';

//  Use localStorage (same as loginStore and loginApi)
const getAuthToken = () => {
    return localStorage.getItem('accessToken');
};

// Create axios instance with auth header
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to add token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        console.log('🔍 Token being sent:', token ? ' Present' : ' Missing');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Fetch user modules from API
export const fetchUserModules = async () => {
    try {
        console.log('📡 Fetching modules from:', API_ENDPOINTS.USER_MODULES);
        const response = await apiClient.get(API_ENDPOINTS.USER_MODULES);
        console.log(' Modules fetched:', response.data);
        return response.data;
    } catch (error) {
        console.error(' Error fetching modules:', error);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        throw error;
    }
};

//  All storage helpers use localStorage
export const getStoredModules = () => {
    try {
        const modules = localStorage.getItem('user_modules');
        return modules ? JSON.parse(modules) : null;
    } catch (error) {
        console.error('Error reading stored modules:', error);
        return null;
    }
};

export const storeModules = (modules) => {
    try {
        localStorage.setItem('user_modules', JSON.stringify(modules));
    } catch (error) {
        console.error('Error storing modules:', error);
    }
};

export const clearStoredModules = () => {
    try {
        localStorage.removeItem('user_modules');
    } catch (error) {
        console.error('Error clearing modules:', error);
    }
};