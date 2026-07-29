import { defineStore } from 'pinia';
import { BASE_URL, API_ENDPOINTS } from '../services/baseUrl.js';

const getAuthToken = () => localStorage.getItem('accessToken');

export const useEmployeeStore = defineStore('employee', {
    state: () => ({
        employees: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 5,
        searchQuery: '',
        isLoading: false,
        error: null,
        employmentStatuses: [],
    }),

    getters: {
        getEmployees: (state) => state.employees,
        totalPages: (state) => Math.ceil(state.totalCount / state.pageSize) || 1,
    },

    actions: {
        async fetchEmployees({ search = this.searchQuery, page = this.currentPage, page_size = this.pageSize } = {}) {
            this.isLoading = true;
            this.error = null;
            try {
                const queryParams = new URLSearchParams({
                    search,
                    page: page.toString(),
                    page_size: page_size.toString(),
                });

                const cleanedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
                const cleanedEndpoint = API_ENDPOINTS.GET_EMPLOYEES.startsWith('/')
                    ? API_ENDPOINTS.GET_EMPLOYEES
                    : `/${API_ENDPOINTS.GET_EMPLOYEES}`;
                const fullUrl = `${cleanedBaseUrl}${cleanedEndpoint}?${queryParams.toString()}`;

                const token = getAuthToken();
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(fullUrl, { method: 'GET', headers });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP Error: ${response.status}`);
                }

                const data = await response.json();

                if (Array.isArray(data)) {
                    this.employees = data;
                    this.totalCount = data.length;
                } else if (data && Array.isArray(data.results)) {
                    this.employees = data.results;
                    this.totalCount = data.count ?? data.results.length;
                } else {
                    this.employees = [];
                    this.totalCount = 0;
                }

                this.currentPage = page;
                this.pageSize = page_size;
                this.searchQuery = search;

                return { success: true, data };
            } catch (error) {
                this.error = error.message || 'Failed to fetch employees';
                this.employees = [];
                this.totalCount = 0;
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },
        async updateEmployeeDetails(employeeId, updatedData) {
            this.isLoading = true;
            this.error = null;
            try {
                const cleanedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
                let endpoint = API_ENDPOINTS.UPDATE_EMPLOYEE;

                if (!endpoint.startsWith('/')) endpoint = `/${endpoint}`;
                if (!endpoint.endsWith('/')) endpoint = `${endpoint}/`;

                const fullUrl = `${cleanedBaseUrl}${endpoint}${employeeId}/`;

                const token = getAuthToken();
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json' // Important: Tell server we want JSON
                };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(fullUrl, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(updatedData)
                });
                const contentType = response.headers.get('content-type');
                let responseData;
                const text = await response.text();
                if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                    console.error('Received HTML error page:', text.substring(0, 500));
                    throw new Error('Server error occurred. Please try again later.');
                }

                try {
                    responseData = JSON.parse(text);
                } catch (parseError) {
                    console.error('Failed to parse JSON:', text);
                    throw new Error('Invalid response from server');
                }

                if (!response.ok) {
                    let errorMsg = `HTTP Error: ${response.status}`;
                    let fieldErrors = null;

                    if (responseData && responseData.errors && typeof responseData.errors === 'object') {
                        fieldErrors = responseData.errors;
                        const firstKey = Object.keys(fieldErrors)[0];
                        const firstVal = fieldErrors[firstKey];
                        errorMsg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
                    } else if (responseData && responseData.error) {
                        errorMsg = responseData.error;
                    } else if (responseData && responseData.message) {
                        errorMsg = responseData.message;
                    } else if (responseData && typeof responseData === 'object') {
                        // Handle Django field errors (flat object of field: messages)
                        fieldErrors = responseData;
                        const firstKey = Object.keys(responseData)[0];
                        const firstVal = responseData[firstKey];
                        if (firstKey !== undefined) {
                            errorMsg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
                        }
                    }

                    return {
                        success: false,
                        error: errorMsg,
                        errors: fieldErrors,
                        data: null
                    };
                }
                // Success - update local state
                if (responseData && responseData.success !== false) {
                    const index = this.employees.findIndex(emp => emp.id === employeeId);
                    if (index !== -1) {
                        // Merge updated data with existing employee data
                        this.employees[index] = {
                            ...this.employees[index],
                            ...updatedData,
                            ...responseData
                        };
                    }
                }

                return { success: true, data: responseData };

            } catch (error) {
                console.error('Update employee error:', error);
                this.error = error.message || 'Failed to update employee details';
                return {
                    success: false,
                    error: this.error,
                    errors: null,
                    data: null
                };
            } finally {
                this.isLoading = false;
            }
        },
        async addEmployee(formDataPayload) {
            this.isLoading = true;
            this.error = null;
            try {
                const cleanedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
                let endpoint = API_ENDPOINTS.ADD_EMPLOYEE;
                if (!endpoint.startsWith('/')) endpoint = `/${endpoint}`;
                const fullUrl = `${cleanedBaseUrl}${endpoint}`;

                const token = getAuthToken();
                const headers = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(fullUrl, {
                    method: 'POST',
                    headers,
                    body: formDataPayload
                });

                let responseData;
                const contentType = response.headers.get('content-type');

                try {
                    if (contentType && contentType.includes('application/json')) {
                        responseData = await response.json();
                    } else {
                        responseData = await response.text();

                        try {
                            responseData = JSON.parse(responseData);
                        } catch {

                        }
                    }
                } catch (parseError) {
                    responseData = { error: 'Failed to parse response' };
                }

                if (!response.ok) {
                    let errorMsg = 'Failed to add employee';
                    let fieldErrors = null;

                    if (responseData && typeof responseData === 'object') {
                        if (responseData.errors && typeof responseData.errors === 'object') {
                            // Backend already sends a nested "errors" object — use it directly
                            fieldErrors = responseData.errors;
                            const firstKey = Object.keys(fieldErrors)[0];
                            const firstVal = fieldErrors[firstKey];
                            errorMsg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
                        } else if (responseData.error) {
                            errorMsg = responseData.error;
                        } else if (responseData.message) {
                            errorMsg = responseData.message;
                        } else {
                            // Flat field:messages object (e.g. { email: [...] })
                            fieldErrors = responseData;
                            const firstKey = Object.keys(responseData)[0];
                            if (firstKey !== undefined) {
                                const firstVal = responseData[firstKey];
                                errorMsg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
                            }
                        }
                    } else if (typeof responseData === 'string') {
                        errorMsg = responseData;
                    }

                    return {
                        success: false,
                        error: errorMsg,
                        errors: fieldErrors,
                        data: null
                    };
                }

                // Success case
                if (responseData && (responseData.success || responseData.message)) {
                    if (responseData.deduction_warning) {
                        console.warn('Deduction warning:', responseData.deduction_warning);
                    }
                    return {
                        success: true,
                        data: responseData,
                        warning: responseData.deduction_warning || null
                    };
                }
                return {
                    success: true,
                    data: responseData || { message: 'Employee added successfully' }
                };

            } catch (error) {
                console.error('Add employee error:', error);
                this.error = error.message || 'Failed to add employee';
                return {
                    success: false,
                    error: this.error,
                    errors: null,
                    data: null
                };
            } finally {
                this.isLoading = false;
            }
        },
        async fetchEmploymentStatuses() {
            try {
                const cleanedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
                const token = getAuthToken();
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;
                const response = await fetch(`${cleanedBaseUrl}${API_ENDPOINTS.EMPLOYMENT_STATUSES}`, {
                    method: 'GET',
                    headers,
                });
                if (!response.ok) throw new Error('Failed to load employment statuses');
                const data = await response.json();
                this.employmentStatuses = Array.isArray(data) ? data : [];
                return { success: true, data: this.employmentStatuses };
            } catch (error) {
                this.employmentStatuses = [
                    { id: null, name: 'Intern', code: 'intern', apply_payroll_deductions: false },
                    { id: null, name: 'Probation', code: 'probation', apply_payroll_deductions: false },
                    { id: null, name: 'Contract', code: 'contract', apply_payroll_deductions: true },
                    { id: null, name: 'Permanent', code: 'permanent', apply_payroll_deductions: true },
                ];
                return { success: false, error: error.message };
            }
        },

        async updateEmployeeStatus(employeeId, statusData) {
            this.isLoading = true;
            this.error = null;
            try {
                const cleanedBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
                const endpoint = API_ENDPOINTS.CHANGE_EMPLOYMENT_STATUS(employeeId);
                const fullUrl = `${cleanedBaseUrl}${endpoint}`;

                const token = getAuthToken();
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(fullUrl, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(statusData)
                });

                let responseData;
                const text = await response.text();

                try {
                    responseData = JSON.parse(text);
                } catch (parseError) {
                    console.error('Failed to parse response:', text);
                    throw new Error('Invalid response from server');
                }

                if (!response.ok) {
                    let errorMsg = `HTTP Error: ${response.status}`;
                    let fieldErrors = null;

                    if (responseData && responseData.errors && typeof responseData.errors === 'object') {
                        fieldErrors = responseData.errors;
                        const firstKey = Object.keys(fieldErrors)[0];
                        const firstVal = fieldErrors[firstKey];
                        errorMsg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
                    } else if (responseData && responseData.error) {
                        errorMsg = responseData.error;
                    } else if (responseData && responseData.message) {
                        errorMsg = responseData.message;
                    } else if (responseData && typeof responseData === 'object') {
                        fieldErrors = responseData;
                        const firstKey = Object.keys(responseData)[0];
                        if (firstKey !== undefined) {
                            const firstVal = responseData[firstKey];
                            errorMsg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
                        }
                    }

                    return {
                        success: false,
                        error: errorMsg,
                        errors: fieldErrors,
                        data: null
                    };
                }

                // Update local employee data
                if (responseData && responseData.id) {
                    const index = this.employees.findIndex(emp => emp.id === employeeId);
                    if (index !== -1) {
                        this.employees[index] = {
                            ...this.employees[index],
                            status: responseData.status,
                            feedback: responseData.feedback || this.employees[index].feedback
                        };
                    }
                }

                return { success: true, data: responseData };

            } catch (error) {
                console.error('Update employee status error:', error);
                this.error = error.message || 'Failed to update employee status';
                return {
                    success: false,
                    error: this.error,
                    errors: null,
                    data: null
                };
            } finally {
                this.isLoading = false;
            }
        }

    },
});