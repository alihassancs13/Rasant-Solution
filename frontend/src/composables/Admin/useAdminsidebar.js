// composables/useAdminSidebar.js
import { ref, computed, onMounted } from 'vue';
import { fetchUserModules, getStoredModules, storeModules } from '../../services/adminsidebarApi.js';

export function useAdminSidebar() {
    const modules = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const dropdownStates = ref({});

    // Fetch modules from API
    const loadModules = async () => {
        loading.value = true;
        error.value = null;

        try {
            // First, try to get from localStorage
            const storedModules = getStoredModules();
            if (storedModules && storedModules.length > 0) {
                modules.value = storedModules;
                loading.value = false;
                return;
            }

            // If not in localStorage, fetch from API
            const response = await fetchUserModules();
            if (response.status && response.data) {
                modules.value = response.data.modules || [];
                // Store in localStorage for future use
                storeModules(modules.value);
            } else {
                modules.value = [];
            }
        } catch (err) {
            error.value = err.message || 'Failed to load modules';
            console.error('Error in loadModules:', err);
        } finally {
            loading.value = false;
        }
    };

    // Organize modules by section
    const companyModules = computed(() => {
        const companyNames = ['Overview', 'Inbox', 'Employees', 'Inquiries', 'Jira'];
        const allModules = modules.value.filter(m => companyNames.includes(m.name.trim()));

        // Find Employees module
        const employees = allModules.find(m => m.name.trim() === 'Employees');

        if (employees) {
            // Treat these modules as Employees children
            const children = modules.value.filter(m => {
                const name = m.name.trim();
                return ['Dashboard', 'Attendance', 'Careers', 'Salaries'].includes(name);
            });

            if (children.length) {
                return allModules
                    .filter(m => m.name.trim() !== 'Employees')
                    .concat([
                        {
                            ...employees,
                            children
                        }
                    ]);
            }
        }

        return allModules;
    });

    const projectModules = computed(() => {
        const projectNames = ['Sentra AI', 'AI Agent', 'Chatbot', 'Orchestri'];
        return modules.value.filter(m => projectNames.includes(m.name));
    });

    const accountModules = computed(() => {
        return modules.value.filter(m => m.name === 'Manage Profile');
    });

    // Toggle dropdown for nested menus
    const toggleDropdown = (moduleName) => {
        dropdownStates.value[moduleName] = !dropdownStates.value[moduleName];
    };

    // Get route for a module
    const getModuleRoute = (moduleName) => {
        moduleName = moduleName.trim();

        const routeMap = {
            'Overview': '/admin/overview',
            'Inbox': '/admin/inbox',
            'Employees': '/admin/employees',
            'Dashboard': '/admin/employees/dashboard',
            'Attendance': '/admin/employees/attendance',
            'Careers': '/admin/career',
            'Salaries': '/admin/employees/salaries',
            'Inquiries': '/admin/inquiries',
            'Jira': '/admin/jira',
            'Sentra AI': '/admin/projects/sentra-ai',
            'AI Agent': '/admin/projects/ai-agent',
            'Chatbot': '/admin/projects/chatbot',
            'Orchestri': '/admin/projects/orchestri',
            'Manage Profile': '/admin/profile'
        };

        return routeMap[moduleName] || `/admin/${moduleName.toLowerCase().replace(/ /g, '-')}`;
    };

    // Check if a module is active
    const isActive = (moduleName, currentPath) => {
        const path = currentPath.toLowerCase();
        const modulePath = getModuleRoute(moduleName).toLowerCase();
        return path === modulePath || path.startsWith(modulePath + '/');
    };

    // Get user role from localStorage
    const getUserRole = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.role?.name || 'Administrator';
        } catch {
            return 'Administrator';
        }
    };

    // Load modules on mount
    onMounted(() => {
        loadModules();
    });

    return {
        modules,
        loading,
        error,
        dropdownStates,
        loadModules,
        companyModules,
        projectModules,
        accountModules,
        toggleDropdown,
        getModuleRoute,
        isActive,
        getUserRole
    };
}