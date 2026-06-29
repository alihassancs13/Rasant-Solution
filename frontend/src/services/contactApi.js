import axios from 'axios'
import { BASE_URL, API_ENDPOINTS } from './baseUrl.js'

const contactAxios = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const contactAPI = {
    sendMessage: (data) => contactAxios.post(API_ENDPOINTS.CONTACT, data),
}