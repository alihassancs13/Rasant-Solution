import { defineStore } from 'pinia';
import { fetchEmployeesApi } from '../services/employeesListApi.js';

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
        totalPages: (state) => Math.ceil(state.totalCount / state.pageSize),
    },

    actions: {
        async fetchEmployees({ search = this.searchQuery, page = this.currentPage, page_size = this.pageSize } = {}) {
            this.isLoading = true;
            this.error = null;
            try {
                const data = await fetchEmployeesApi({ search, page, page_size });
                this.employees = data.results || data;
                this.totalCount = data.count ?? this.employees.length;
                this.currentPage = page;
                this.pageSize = page_size;
                this.searchQuery = search;
                return { success: true, data };
            } catch (error) {
                this.error = error.message || 'Failed to fetch employees';
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