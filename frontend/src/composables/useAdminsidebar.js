// composables/Admin/useAdminSidebar.js
import { ref, computed, onMounted } from 'vue';
import { useSidebarStore } from '@/stores/sidebarStore.js';

const isSidebarOpen = ref(false);
const collapsed = ref(false);

export function useAdminSidebar() {
    const sidebarStore = useSidebarStore();
    const dropdownStates = ref({});

    const modules = computed(() => sidebarStore.modules);
    const loading = computed(() => sidebarStore.isLoading);
    const error = computed(() => sidebarStore.error);

    const loadModules = async () => {
        if (sidebarStore.hasModules) return;
        await sidebarStore.fetchModules();
    };

        const companyModules = computed(() => {
        const companyNames = ['Overview', 'Inbox', 'Employees', 'Inquiries', 'Jira'];
        const allModules = modules.value.filter(m => companyNames.includes(m.name.trim()));

        const employees = allModules.find(m => m.name.trim() === 'Employees');

        if (employees) {
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

    const toggleDropdown = (moduleName) => {
        dropdownStates.value[moduleName] = !dropdownStates.value[moduleName];
    };

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

    const isActive = (moduleName, currentPath) => {
        const path = currentPath.toLowerCase();
        const trimmedName = moduleName.trim();

        const modulePath = getModuleRoute(trimmedName).toLowerCase();

        if (path === modulePath || path.startsWith(modulePath + '/')) {
            return true;
        }

        if (trimmedName === 'Employees' && path === '/admin/employees/dashboard') {
            return true;
        }
        if (trimmedName === 'Dashboard' && path === '/admin/employees/dashboard') {
            return true;
        }
        if (trimmedName === 'Employees' && path === '/admin/employees/attendance') {
            return true;
        }
        if (trimmedName === 'Attendance' && path === '/admin/employees/attendance') {
            return true;
        }
        if (trimmedName === 'Employees' && path === '/admin/employees/salaries') {
            return true;
        }
        if (trimmedName === 'Salaries' && path === '/admin/employees/salaries') {
            return true;
        }
        if (trimmedName === 'Employees' && path === '/admin/career') {
            return true;
        }
        if (trimmedName === 'Careers' && path === '/admin/career') {
            return true;
        }

        return false;
    };

    const getUserRole = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.role?.name || 'Administrator';
        } catch {
            return 'Administrator';
        }
    };

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
        getUserRole,
        isSidebarOpen,
        collapsed
    };
}