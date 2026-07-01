// services/baseUrl.js
export const BASE_URL = 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
    LOGIN: '/api/accounts/login/',
    REFRESH_TOKEN: '/api/accounts/token/refresh/',
    LOGOUT: '/api/accounts/logout/',
    REGISTER: '/api/accounts/register/',
    USER_PROFILE: '/api/accounts/profile/',
    CHANGE_PASSWORD: '/api/accounts/change-password/',
    USER_MODULES: '/api/accounts/get_user_modules/',
    CONTACT: '/api/contact/',
    PARSE_CV: '/api/employee_dashboard/parse_cv/',
    CV_SUBMIT: '/api/cv_management/submit-cv/',
};