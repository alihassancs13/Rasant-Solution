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
    JOB_PUBLIC_LIST: '/api/employeeDashboard/job-openings/',
    JOB_TYPES: '/api/employeeDashboard/job-types/',
    UPDATE_EMPLOYEE: '/api/employeeDashboard/update_employee/',
    ADD_EMPLOYEE: '/api/employeeDashboard/add_employee/',
    JOB_STATUS: '/api/employeeDashboard/job-status/',
    INCREMENT_POLICIES: '/api/employeeDashboard/salaries/policies/',
    INCREMENT_LOOKUPS:  '/api/employeeDashboard/salaries/lookups/',
    POLICY_ASSIGNMENTS: '/api/employeeDashboard/salaries/assignments/',
    POLICY_ASSIGN: (policyId) => `/api/employeeDashboard/salaries/policies/${policyId}/assign/`,
    FORCE_INCREMENT: '/api/employeeDashboard/salaries/force-increment/',
    INCREMENTS_DUE_TODAY: '/api/employeeDashboard/salaries/increment-due-today/',
    DOCUMENTS: {
        FOLDERS: {
            CREATE: '/api/documents/folders/create/',
            ROOT: '/api/documents/folders/root/',
            CONTENTS: (id) => `/api/documents/folders/${id}/contents/`,
            UPDATE: (id) => `/api/documents/folders/${id}/update/`,
            DELETE: (id) => `/api/documents/folders/${id}/delete/`,
            ALL: '/api/documents/folders/all/',
        },
        FILES: {
            UPLOAD: '/api/documents/files/upload/',
            DOWNLOAD: (id) => `/api/documents/files/${id}/download/`,
            PREVIEW: (id) => `/api/documents/files/${id}/preview/`,
            DELETE: (id) => `/api/documents/files/${id}/delete/`,
            BY_EXTENSION: (ext) => `/api/documents/files/extension/${ext}/`,
            ALL: '/api/documents/files/all/',
        },
        ALL: '/api/documents/all/',
    }
};