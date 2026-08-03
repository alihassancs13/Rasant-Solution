// services/onboardingApi.js
import axios from 'axios';
import { BASE_URL, API_ENDPOINTS } from './baseUrl.js';

const onboardingApi = axios.create({
    baseURL: BASE_URL,
});

export const onboardingAPI = {
    validate: (token) => onboardingApi.get(API_ENDPOINTS.ONBOARDING_VALIDATE(token)),
    submit: (token, formData) =>
        onboardingApi.post(API_ENDPOINTS.ONBOARDING_SUBMIT(token), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};

export default onboardingApi;