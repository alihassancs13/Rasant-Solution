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

                // Ensure endpoint structure fits: baseUrl/api/employeeDashboard/update_employee/{id}/
                if (!endpoint.startsWith('/')) endpoint = `/${endpoint}`;
                if (!endpoint.endsWith('/')) endpoint = `${endpoint}/`;

                const fullUrl = `${cleanedBaseUrl}${endpoint}${employeeId}/`;

                const token = getAuthToken();
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const response = await fetch(fullUrl, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(updatedData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || `HTTP Error: ${response.status}`);
                }

                // Update the state locally so UI updates instantaneously without an additional heavy fetch
                const index = this.employees.findIndex(emp => emp.id === employeeId);
                if (index !== -1) {
                    this.employees[index] = { ...this.employees[index], ...updatedData };
                }

                return { success: true, data };
            } catch (error) {
                this.error = error.message || 'Failed to update employee details';
                return { success: false, error: this.error };
            } finally {
                this.isLoading = false;
            }
        },
        setSearch(query) {
            this.searchQuery = query;
        },

        setPage(page) {
            this.currentPage = page;
        },
    },
});