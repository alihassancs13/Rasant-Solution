import axios from 'axios'
import { BASE_URL, API_ENDPOINTS } from './baseUrl.js'

const apiClient = axios.create({
    baseURL: BASE_URL,
})

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
    getAll: () => apiClient.get(API_ENDPOINTS.CV_SUBMIT),
    delete: (id) => apiClient.delete(`/api/cv_management/cv/${id}/`),
    download: (id) => apiClient.get(`/api/cv_management/cv/${id}/download/`, {
        responseType: 'blob',
    }),
    getPublishedJobs: () => apiClient.get(API_ENDPOINTS.JOB_OPENINGS),
}

export default apiClient