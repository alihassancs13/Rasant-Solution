// composables/useEmployeeDashboard.js
import { computed, reactive, watch, ref } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore.js';

export function useEmployeeDashboard() {
    const employeeStore = useEmployeeStore();

    const employees = computed(() => employeeStore.employees);
    const isLoading = computed(() => employeeStore.isLoading);
    const errorMessage = computed(() => employeeStore.error || '');
    const totalEmployees = computed(() => employeeStore.totalCount);
    const totalPages = computed(() => employeeStore.totalPages);

    const searchQuery = ref('');
    const currentPage = ref(1);
    const pageSize = ref(5);

    const statsSummary = reactive({
        total: 0,
        inOffice: 0,
        internProbation: 0,
        awayToday: 0
    });

    const loadEmployees = async () => {
        const result = await employeeStore.fetchEmployees({
            search: searchQuery.value,
            page: currentPage.value,
            page_size: pageSize.value
        });

        if (result.success) {
            calculateStats();
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

    watch(searchQuery, () => {
        currentPage.value = 1;
        loadEmployees();
    });

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