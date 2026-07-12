// composables/Admin/useAdminSidebar.js
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSidebarStore } from '@/stores/sidebarStore.js';

const COMPANY_MODULES = ['Overview', 'Inbox', 'Employees', 'Inquiries', 'Jira'];
const PROJECT_MODULES = ['Sentra AI', 'AI Agent', 'Chatbot', 'Orchestri'];
const EMPLOYEE_CHILDREN = ['Dashboard', 'Attendance', 'Careers', 'Salaries'];

export function useAdminSidebar() {
    const route = useRoute();
    const router = useRouter();
    const store = useSidebarStore();

    const dropdownStates = ref({});
    const isSidebarOpen = ref(false);
    const collapsed = ref(false);

    // 🔥 FIX: Persist drill-down state in localStorage
    const isDrillDown = ref(localStorage.getItem('sidebarDrillDown') === 'true');

    const modules = computed(() => {
        return Array.isArray(store.modules) ? store.modules : [];
    });

    const loading = computed(() => store.isLoading);
    const error = computed(() => store.error);

    // Get employee children modules
    const employeeChildrenModules = computed(() => {
        const moduleList = modules.value;
        if (!moduleList.length) return [];

        return moduleList.filter(m =>
            m && EMPLOYEE_CHILDREN.includes(m.name?.trim())
        );
    });

    // Get the Employees parent module
    const employeesParent = computed(() => {
        if (isDrillDown.value) return null;
        return modules.value.find(m => m?.name?.trim() === 'Employees');
    });

    const companyModules = computed(() => {
        const moduleList = modules.value;
        if (!moduleList.length) return [];

        const all = moduleList.filter(m =>
            m && COMPANY_MODULES.includes(m.name?.trim())
        );

        const employees = all.find(m => m?.name?.trim() === 'Employees');

        if (employees) {
            const children = moduleList.filter(m =>
                m && EMPLOYEE_CHILDREN.includes(m.name?.trim())
            );
            if (children.length) {
                return all
                    .filter(m => m?.name?.trim() !== 'Employees')
                    .concat([{ ...employees, children }]);
            }
        }
        return all;
    });

    const projectModules = computed(() => {
        const moduleList = modules.value;
        if (!moduleList.length) return [];
        return moduleList.filter(m =>
            m && PROJECT_MODULES.includes(m.name?.trim())
        );
    });

    const accountModules = computed(() => {
        const moduleList = modules.value;
        if (!moduleList.length) return [];
        return moduleList.filter(m =>
            m && m.name?.trim() === 'Manage Profile'
        );
    });

    const getModuleRoute = (name) => {
        if (!name) return '/admin';
        return store.getModuleRoute(name);
    };

    const isActive = (moduleName) => {
        if (!moduleName) return false;

        const path = route.path.toLowerCase();
        const modulePath = getModuleRoute(moduleName).toLowerCase();

        if (path === modulePath || path.startsWith(modulePath + '/')) return true;

        const module = store.getModuleByName(moduleName);
        if (module?.children) {
            return module.children.some(child => {
                const childPath = getModuleRoute(child.name).toLowerCase();
                return path === childPath || path.startsWith(childPath + '/');
            });
        }
        return false;
    };

    const toggleDropdown = (name) => {
        if (name) {
            dropdownStates.value[name] = !dropdownStates.value[name];
        }
    };

    // Handle click on Employees to drill down
    const drillIntoEmployees = () => {
        isDrillDown.value = true;
        localStorage.setItem('sidebarDrillDown', 'true');
        // Close any open dropdowns
        Object.keys(dropdownStates.value).forEach(key => {
            dropdownStates.value[key] = false;
        });
    };

    // Go back from drill-down
    const goBackFromDrillDown = () => {
        isDrillDown.value = false;
        localStorage.setItem('sidebarDrillDown', 'false');
    };

    // 🔥 NEW: Check if we should be in drill-down mode based on current route
    const checkDrillDownOnRoute = () => {
        const currentPath = route.path;
        const childPaths = employeeChildrenModules.value.map(m => getModuleRoute(m.name));

        // If current path is one of the child paths, stay in drill-down
        if (childPaths.some(path => currentPath.startsWith(path))) {
            isDrillDown.value = true;
            localStorage.setItem('sidebarDrillDown', 'true');
        }
    };

    // Watch route changes to maintain drill-down state
    watch(() => route.path, () => {
        checkDrillDownOnRoute();
    });

    const getUserRole = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.role?.name || user.role_name || 'Administrator';
        } catch {
            return 'Administrator';
        }
    };

    onMounted(async () => {
        if (!store.hasModules) {
            await store.fetchModules();
        }
        // Check if we should be in drill-down mode
        checkDrillDownOnRoute();
    });

    return {
        modules,
        loading,
        error,
        dropdownStates,
        isSidebarOpen,
        collapsed,
        isDrillDown,
        companyModules,
        projectModules,
        accountModules,
        employeeChildrenModules,
        employeesParent,
        getModuleRoute,
        isActive,
        toggleDropdown,
        drillIntoEmployees,
        goBackFromDrillDown,
        getUserRole,
        refreshModules: store.fetchModules,
    };
}