// composables/Admin/useAdminSidebar.js
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSidebarStore } from '@/stores/sidebarStore.js';

const COMPANY_MODULES = ['Overview', 'Inbox', 'Employees', 'Inquiries', 'Jira','Documents','Vault'];
const PROJECT_MODULES = ['Sentra AI', 'AI Agent', 'Chatbot', 'Orchestri'];
const EMPLOYEE_CHILDREN = ['Dashboard', 'Attendance', 'Careers', 'Salaries'];
const dropdownStates = ref({});
const isSidebarOpen = ref(false);
const collapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true');
const isDrillDown = ref(localStorage.getItem('sidebarDrillDown') === 'true');
export function useAdminSidebar() {
    const route = useRoute();
    const router = useRouter();
    const store = useSidebarStore();

    const modules = computed(() => {
        return Array.isArray(store.modules) ? store.modules : [];
    });

    const loading = computed(() => store.isLoading);
    const error = computed(() => store.error);

    const employeeChildrenModules = computed(() => {
        const moduleList = modules.value;
        if (!moduleList.length) return [];
        return moduleList.filter(m =>
            m && EMPLOYEE_CHILDREN.includes(m.name?.trim())
        );
    });

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

    // ── Sidebar toggle functions ──
    const toggleSidebar = () => {
        isSidebarOpen.value = !isSidebarOpen.value;
    };

    const openSidebar = () => {
        isSidebarOpen.value = true;
    };

    const closeSidebar = () => {
        isSidebarOpen.value = false;
    };

    const toggleCollapse = () => {
        collapsed.value = !collapsed.value;
        localStorage.setItem('sidebarCollapsed', String(collapsed.value));
    };

    const drillIntoEmployees = () => {
        isDrillDown.value = true;
        localStorage.setItem('sidebarDrillDown', 'true');
        Object.keys(dropdownStates.value).forEach(key => {
            dropdownStates.value[key] = false;
        });
    };

    const goBackFromDrillDown = () => {
        isDrillDown.value = false;
        localStorage.setItem('sidebarDrillDown', 'false');
    };

    const checkDrillDownOnRoute = () => {
        const currentPath = route.path;
        const childPaths = employeeChildrenModules.value.map(m => getModuleRoute(m.name));

        if (childPaths.some(path => currentPath.startsWith(path))) {
            isDrillDown.value = true;
            localStorage.setItem('sidebarDrillDown', 'true');
        }
    };

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
        try {
            // Check if store has modules (using computed property or direct check)
            if (!store.modules || store.modules.length === 0) {
                await store.fetchModules();
            }
            checkDrillDownOnRoute();
        } catch (err) {
            console.error('Failed to load sidebar modules:', err);
        }
    });

    return {
        modules,
        loading,
        error,
        dropdownStates,
        isSidebarOpen,
        collapsed,
        toggleCollapse,
        isDrillDown,
        companyModules,
        projectModules,
        accountModules,
        employeeChildrenModules,
        employeesParent,
        getModuleRoute,
        isActive,
        toggleDropdown,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        drillIntoEmployees,
        goBackFromDrillDown,
        getUserRole,
        refreshModules: store.fetchModules,

    };
}