import axios from 'axios'
import { BASE_URL, API_ENDPOINTS } from './baseUrl.js'

const cvAxios = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'multipart/form-data',
    },
})

export const cvAPI = {
    submitCV: (formData) => cvAxios.post(API_ENDPOINTS.CV_SUBMIT, formData),
}