// composables/useEmployeeDashboard.js
import { ref, reactive, watch } from 'vue';
import { fetchEmployeesApi } from '../../services/employeesListApi.js';

export function useEmployeeDashboard() {
    const employees = ref([]);
    const isLoading = ref(false);
    const errorMessage = ref('');

    // Search and Pagination Controls
    const searchQuery = ref('');
    const currentPage = ref(1);
    const pageSize = ref(5);
    const totalEmployees = ref(0);
    const totalPages = ref(1);

    // Statistics summaries mapped from UI prototype metrics counters
    const statsSummary = reactive({
        total: 0,
        inOffice: 0,
        internProbation: 0,
        awayToday: 0
    });

    // Main execution worker wrapper for network side-effects
    // composables/useEmployeeDashboard.js

    const loadEmployees = async () => {
        isLoading.value = true;
        errorMessage.value = '';
        try {
            const data = await fetchEmployeesApi({
                search: searchQuery.value,
                page: currentPage.value,
                page_size: pageSize.value
            });

            // Defensive parsing block:
            if (Array.isArray(data)) {
                // If API returns a direct array [ {...} ]
                employees.value = data;
                totalEmployees.value = data.length;
            } else if (data && Array.isArray(data.results)) {
                // If API returns a paginated object { results: [ ... ], count: X }
                employees.value = data.results;
                totalEmployees.value = data.count || data.results.length;
            } else {
                // Fallback if data format is unexpected
                employees.value = [];
                totalEmployees.value = 0;
            }

            totalPages.value = Math.ceil(totalEmployees.value / pageSize.value) || 1;

            // Recalculate dashboard counters dynamically
            calculateStats();
        } catch (err) {
            errorMessage.value = err.message || 'Failed to populate dashboard employee records.';
            employees.value = [];
            totalEmployees.value = 0;
        } finally {
            isLoading.value = false;
        }
    };

    const calculateStats = () => {
        statsSummary.total = totalEmployees.value;
        statsSummary.inOffice = employees.value.filter(e => e.today_status?.toLowerCase() === 'in office').length;
        statsSummary.internProbation = employees.value.filter(e => {
            const s = e.status?.toLowerCase();
            return s === 'intern' || s === 'probation';
        }).length;
        statsSummary.awayToday = employees.value.filter(e => e.today_status?.toLowerCase() === 'away').length;
    };

    // Trigger reactive side-effect reload pipelines when search patterns change
    watch(searchQuery, () => {
        currentPage.value = 1; // Reset to page 1 on active text input search mutations
        loadEmployees();
    });

    // Trigger reactive watch changes for manual pagination pagination
    watch(currentPage, () => {
        loadEmployees();
    });

    return {
        employees,
        isLoading,
        errorMessage,
        searchQuery,
        currentPage,
        totalPages,
        totalEmployees,
        statsSummary,
        loadEmployees
    };
}