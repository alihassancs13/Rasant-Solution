// services/sidebarApi.js
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from '../services/baseUrl.js';

// CHANGE THIS: Use sessionStorage instead of localStorage
const getAuthToken = () => {
    return sessionStorage.getItem('accessToken');  // Changed from localStorage
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
        console.log('🔍 Token being sent:', token ? ' Present' : ' Missing'); // Debug
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

// ✅ Also update storage functions to use sessionStorage
export const getStoredModules = () => {
    try {
        const modules = sessionStorage.getItem('user_modules');  // Changed from localStorage
        return modules ? JSON.parse(modules) : null;
    } catch (error) {
        console.error('Error reading stored modules:', error);
        return null;
    }
};

export const storeModules = (modules) => {
    try {
        sessionStorage.setItem('user_modules', JSON.stringify(modules));  // Changed from localStorage
    } catch (error) {
        console.error('Error storing modules:', error);
    }
};

export const clearStoredModules = () => {
    try {
        sessionStorage.removeItem('user_modules');  // Changed from localStorage
    } catch (error) {
        console.error('Error clearing modules:', error);
    }
};