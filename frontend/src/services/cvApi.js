import axios from 'axios'
import { BASE_URL, API_ENDPOINTS } from './baseUrl.js'

const apiClient = axios.create({
    baseURL: BASE_URL,
})

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Contact Messages ────────────────────────────────────────
export const contactAPI = {
    getAll: () => apiClient.get(API_ENDPOINTS.CONTACT),
    delete: (id) => apiClient.delete(`${API_ENDPOINTS.CONTACT}${id}/`),
}

// ─── CV Submissions ──────────────────────────────────────────
export const cvAPI = {
    submitCV: (formData) => apiClient.post(API_ENDPOINTS.CV_SUBMIT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getAll: () => apiClient.get(API_ENDPOINTS.CV_LIST),
    delete: (id) => apiClient.delete(`/api/cv_management/cv/${id}/delete/`),
    download: (id) => apiClient.get(`/api/cv_management/cv/${id}/download/`, {
        responseType: 'blob',
    }),
    updateStatus: (id, data) => apiClient.put(`/api/cv_management/cv/${id}/status/`, data),
}

// ─── Job Openings ─────────────────────────────────────────────
export const jobAPI = {
    create: (jobData) => apiClient.post(API_ENDPOINTS.JOB_CREATE, jobData),
    getAdminJobs: () => apiClient.get(API_ENDPOINTS.JOB_ADMIN_LIST),
    getPublicJobs: () => apiClient.get(API_ENDPOINTS.JOB_PUBLIC_LIST),
    getJobTypes: () => apiClient.get(API_ENDPOINTS.JOB_TYPES),
    update: (id, jobData) => apiClient.put(`/api/cv_management/job-openings/${id}/update/`, jobData),
    delete: (id) => apiClient.delete(`/api/cv_management/job-openings/${id}/delete/`),
}

export default apiClient