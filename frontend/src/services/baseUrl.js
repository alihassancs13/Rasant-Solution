// services/baseUrl.js
export const BASE_URL = 'http://localhost:8000/';

export const API_ENDPOINTS = {
    LOGIN: '/api/accounts/login/',
    REFRESH_TOKEN: '/api/accounts/token/refresh/',
    LOGOUT: '/api/accounts/logout/',
    USER_MODULES: '/api/accounts/get_user_modules/',
    CONTACT: '/api/accounts/contact/',
    PARSE_CV: '/api/employee_dashboard/parse_cv/',
    CV_SUBMIT: '/api/employeeDashboard/submit-cv/',
    JOB_OPENINGS: '/api/employeeDashboard/job-openings/',
    GET_EMPLOYEES: 'api/employeeDashboard/get_employees/',
    CV_LIST: '/api/employeeDashboard/submit-cv/',
    JOB_CREATE: '/api/employeeDashboard/job-openings/create/',
    JOB_ADMIN_LIST: '/api/employeeDashboard/job-openings/',
    JOB_PUBLIC_LIST: '/api/employeeDashboard/job-openings/public/',
    JOB_TYPES: '/api/employeeDashboard/job-types/',
    UPDATE_EMPLOYEE: '/api/employeeDashboard/update_employee/',
    ADD_EMPLOYEE: '/api/employeeDashboard/add_employee/',
};