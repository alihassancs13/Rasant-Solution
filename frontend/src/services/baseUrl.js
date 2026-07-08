// services/baseUrl.js
export const BASE_URL = 'http://localhost:8000/';

export const API_ENDPOINTS = {
    LOGIN: '/api/accounts/login/',
    REFRESH_TOKEN: '/api/accounts/token/refresh/',
    LOGOUT: '/api/accounts/logout/',
    USER_MODULES: '/api/accounts/get_user_modules/',
    CONTACT: '/api/contact/',
    PARSE_CV: '/api/employee_dashboard/parse_cv/',
    CV_SUBMIT: '/api/employeeDashboard/submit-cv/',
    JOB_OPENINGS: '/api/employeeDashboard/job-openings/',
    GET_EMPLOYEES: 'api/employeeDashboard/get_employees/',
    CV_SUBMIT: '/api/cv_management/submit-cv/',
    CV_LIST: '/api/cv_management/cv-list/',
    JOB_OPENINGS: '/api/cv_management/job-openings/',
    GET_EMPLOYEES: 'api/employee_dashboard/get_employees/',
    JOB_CREATE: '/api/cv_management/job-openings/create/',
    JOB_ADMIN_LIST: '/api/cv_management/job-openings/',
    JOB_PUBLIC_LIST: '/api/cv_management/job-openings/public/',
    JOB_TYPES: '/api/cv_management/job-types/',
};