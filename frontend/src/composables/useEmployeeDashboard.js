// composables/useEmployeeDashboard.js
import { computed, reactive, watch, ref } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore.js';

export function useEmployeeDashboard() {
    const employeeStore = useEmployeeStore();

    // Raw data from store (all employees, possibly paginated)
    const allEmployees = computed(() => employeeStore.employees);
    const isLoading = computed(() => employeeStore.isLoading);
    const errorMessage = computed(() => employeeStore.error || '');

    // Search & pagination state
    const searchQuery = ref('');
    const currentPage = ref(1);
    const pageSize = ref(5);

    // Sorting state
    const sortBy = ref('name');
    const sortDirection = ref('asc');

    // ----- 1. Client‑side filtering (case‑insensitive) -----
    const filteredEmployees = computed(() => {
        if (!searchQuery.value.trim()) {
            return allEmployees.value;
        }
        const query = searchQuery.value.toLowerCase().trim();
        return allEmployees.value.filter(emp =>
            emp.name?.toLowerCase().includes(query) ||
            emp.employee_number?.toLowerCase().includes(query) ||
            emp.email?.toLowerCase().includes(query)
        );
    });

    // ----- 2. Sorting the filtered list -----
    const sortedEmployees = computed(() => {
        const list = filteredEmployees.value;
        if (!sortBy.value) return list;

        const field = sortBy.value;
        const dir = sortDirection.value;
        return [...list].sort((a, b) => {
            // Get values, fallback to empty string for null/undefined
            const valA = (a[field] ?? '').toString().toLowerCase();
            const valB = (b[field] ?? '').toString().toLowerCase();

            if (valA < valB) return dir === 'asc' ? -1 : 1;
            if (valA > valB) return dir === 'asc' ? 1 : -1;
            return 0;
        });
    });

    // ----- 3. Pagination on the sorted list -----
    const totalFiltered = computed(() => sortedEmployees.value.length);
    const totalPages = computed(() => Math.ceil(totalFiltered.value / pageSize.value));

    const paginatedEmployees = computed(() => {
        const start = (currentPage.value - 1) * pageSize.value;
        const end = start + pageSize.value;
        return sortedEmployees.value.slice(start, end);
    });

    // ----- 4. Stats summary (overall, not filtered) -----
    const statsSummary = reactive({
        total: 0,
        inOffice: 0,
        internProbation: 0,
        awayToday: 0
    });

    const calculateStats = () => {
        statsSummary.total = allEmployees.value.length;
        statsSummary.inOffice = allEmployees.value.filter(e => e.today_status?.toLowerCase() === 'in office').length;
        statsSummary.internProbation = allEmployees.value.filter(e => {
            const s = e.status?.toLowerCase();
            return s === 'intern' || s === 'probation';
        }).length;
        statsSummary.awayToday = allEmployees.value.filter(e => e.today_status?.toLowerCase() === 'away').length;
    };

    // ----- 5. Load employees (fetch all if searching, else paginated) -----
    const loadEmployees = async () => {
        const params = {
            search: searchQuery.value,
            page: 1,
            page_size: searchQuery.value ? 1000 : pageSize.value
        };
        const result = await employeeStore.fetchEmployees(params);
        if (result.success) {
            calculateStats();
            if (searchQuery.value) currentPage.value = 1;
        }
    };

    // ----- 6. Update employee (re‑calculate stats after update) -----
    const updateEmployee = async (employeeId, payload) => {
        const result = await employeeStore.updateEmployeeDetails(employeeId, payload);
        if (result.success) {
            calculateStats();
        }
        return result;
    };

    // ----- 7. Toggle sorting (called from view) -----
    const toggleSort = (field) => {
        if (sortBy.value === field) {
            sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        } else {

            sortBy.value = field;
            sortDirection.value = 'asc';
        }
    };

    // ----- 8. Watchers -----
    watch(searchQuery, () => {
        loadEmployees();
    });

    watch(pageSize, () => {
        currentPage.value = 1;
        loadEmployees();
    });
    return {
        // Display data
        employees: paginatedEmployees,
        isLoading,
        errorMessage,
        searchQuery,
        currentPage,
        pageSize,
        totalPages,
        totalEmployees: totalFiltered,
        statsSummary,
        sortBy,
        sortDirection,
        toggleSort,
        loadEmployees,
        updateEmployee
    };
}