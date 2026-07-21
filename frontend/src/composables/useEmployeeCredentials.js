
import { ref, computed, watch, onMounted } from 'vue';
import { useCredentialsVaultStore } from '@/stores/credentialsVaultStore.js'

export default function useEmployeeCredentials() {
    const store = useCredentialsVaultStore();

    const searchQuery = ref('');
    const currentPage = ref(1);
    const pageSize = ref(5);

    // Get user data from localStorage
    const getUserData = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    };

    // FIXED: Get employee ID from multiple possible locations
    const employeeId = computed(() => {
        const user = getUserData();
        console.log('Full user data:', user);

        // Try multiple possible locations for employee ID
        const id = user?.employee_id ||
            user?.id ||
            user?.user_id ||
            user?.employeeId ||
            user?.employee?.id ||
            null;

        console.log('Employee ID found:', id);
        return id;
    });

    const loading = computed(() => store.loading);
    const error = computed(() => store.error);
    const credentials = computed(() => store.credentials);

    // Filter credentials based on search query
    const filteredCredentials = computed(() => {
        if (!credentials.value || !credentials.value.length) return [];
        if (!searchQuery.value.trim()) return credentials.value;

        const query = searchQuery.value.toLowerCase().trim();
        return credentials.value.filter(cred =>
            cred.name?.toLowerCase().includes(query) ||
            cred.username?.toLowerCase().includes(query) ||
            cred.email?.toLowerCase().includes(query) ||
            cred.link?.toLowerCase().includes(query)
        );
    });

    // Pagination
    const totalPages = computed(() => {
        const filtered = filteredCredentials.value;
        if (!filtered || !filtered.length) return 1;
        return Math.ceil(filtered.length / pageSize.value) || 1;
    });

    const paginatedCredentials = computed(() => {
        const filtered = filteredCredentials.value;
        if (!filtered || !filtered.length) return [];
        const start = (currentPage.value - 1) * pageSize.value;
        const end = start + pageSize.value;
        return filtered.slice(start, end);
    });

    const startIndex = computed(() => {
        return (currentPage.value - 1) * pageSize.value;
    });

    const endIndex = computed(() => {
        const filtered = filteredCredentials.value;
        if (!filtered || !filtered.length) return 0;
        return Math.min(currentPage.value * pageSize.value, filtered.length);
    });

    const displayedPages = computed(() => {
        const total = totalPages.value;
        const current = currentPage.value;
        const pages = [];

        if (total <= 7) {
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (current > 3) pages.push('...');
            const start = Math.max(2, current - 1);
            const end = Math.min(total - 1, current + 1);
            for (let i = start; i <= end; i++) {
                if (i > 1 && i < total) pages.push(i);
            }
            if (current < total - 2) pages.push('...');
            pages.push(total);
        }
        return pages;
    });

    // Methods
    const fetchCredentials = async () => {
        const id = employeeId.value;
        console.log('Fetching credentials for employee ID:', id);
        if (!id) {
            console.error('No employee ID found');
            return { success: false, error: 'No employee ID found' };
        }
        const result = await store.fetchEmployeeCredentials(id);
        console.log('Fetch result:', result);
        return result;
    };

    const togglePassword = (credentialId) => {
        store.togglePassword(credentialId);
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const words = name.split(' ');
        if (words.length === 1) return words[0].charAt(0).toUpperCase();
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
        }
    };

    const prevPage = () => {
        if (currentPage.value > 1) {
            currentPage.value--;
        }
    };

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value++;
        }
    };

    // Reset to page 1 when search or page size changes
    watch([searchQuery, pageSize], () => {
        currentPage.value = 1;
    });

    // Load credentials on mount
    const loadCredentials = async () => {
        console.log('Loading credentials...');
        if (employeeId.value) {
            await fetchCredentials();
        } else {
            console.warn('No employee ID available to load credentials');
        }
    };

    // Auto-load on mount
    onMounted(() => {
        loadCredentials();
    });

    return {

        credentials,
        loading,
        error,
        searchQuery,
        currentPage,
        pageSize,
        employeeId,
        filteredCredentials,
        paginatedCredentials,
        totalPages,
        startIndex,
        endIndex,
        displayedPages,
        fetchCredentials,
        togglePassword,
        getInitials,
        goToPage,
        prevPage,
        nextPage,
        loadCredentials,
    };
}