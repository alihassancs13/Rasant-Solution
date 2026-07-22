// composables/Admin/useAdminSidebar.js
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSidebarStore } from '@/stores/sidebarStore.js';
import { useInboxStore } from '@/stores/inboxStore.js';
const COMPANY_MODULES = ['Overview', 'Inbox', 'Employees', 'Inquiries', 'Jira', 'Documents', 'Vault','Worklogs'];
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
    const inboxStore = useInboxStore();

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

    // Get user role and map to role_id
    const userRoleId = computed(() => {
        const user = getUserData();
        if (!user) return null;

        // Check if user has role property
        const userRole = user.role || user.role_name || user.role_id || null;

        console.log('User data:', user);
        console.log('User role value:', userRole);

        // Map role name to role_id
        if (userRole === 'admin' || userRole === 'Administrator' || userRole === 1 || userRole === '1') {
            return 1; // Admin role_id
        } else if (userRole === 'employee' || userRole === 'Employee' || userRole === 2 || userRole === '2') {
            return 2; // Employee role_id
        }

        // If it's a number already
        if (typeof userRole === 'number') {
            return userRole;
        }

        // If it's a string number
        if (typeof userRole === 'string' && !isNaN(userRole)) {
            return parseInt(userRole);
        }

        // Default to null if unknown
        return null;
    });

    // Get current user role as string for display
    const currentUserRole = computed(() => {
        const roleId = userRoleId.value;
        if (roleId === 1) return 'admin';
        if (roleId === 2) return 'employee';
        return 'admin'; // Default
    });

    const modules = computed(() => {
        return Array.isArray(store.modules) ? store.modules : [];
    });

    // FIXED: Filter modules based on user's role_id
    const filteredModules = computed(() => {
        const allModules = modules.value;
        if (!allModules.length) {
            console.log('No modules found in store');
            return [];
        }

        const roleId = userRoleId.value;
        const user = getUserData();

        console.log('User data from localStorage:', user);
        console.log('User Role ID extracted:', roleId);
        console.log('All modules from database:', allModules);

        // If no role_id found, log warning and show nothing
        if (!roleId) {
            console.warn('No role_id found for user. User data:', user);
            return [];
        }

        // Filter modules by role_id
        const filtered = allModules.filter(module => {
            // Get the role_id from the module
            const moduleRoleId = module.role_id || module.roleId || module.role?.id;

            // Log for debugging
            console.log(`Module: ${module.name}, Module Role ID: ${moduleRoleId}, User Role ID: ${roleId}, Match: ${moduleRoleId === roleId}`);

            return moduleRoleId === roleId;
        });

        console.log(`Filtered modules for role_id ${roleId}:`, filtered);
        return filtered;
    });

    const unreadConversationsCount = computed(() => inboxStore.unreadConversationsCount);
    const loading = computed(() => store.isLoading);
    const error = computed(() => store.error);

    const employeeChildrenModules = computed(() => {
        const moduleList = filteredModules.value;
        if (!moduleList.length) return [];
        return moduleList.filter(m =>
            m && EMPLOYEE_CHILDREN.includes(m.name?.trim())
        );
    });

    const employeesParent = computed(() => {
        if (isDrillDown.value) return null;
        return filteredModules.value.find(m => m?.name?.trim() === 'Employees');
    });

    const companyModules = computed(() => {
        const moduleList = filteredModules.value;
        if (!moduleList.length) return [];

        // Only show modules that are in COMPANY_MODULES
        const all = moduleList.filter(m =>
            m && COMPANY_MODULES.includes(m.name?.trim())
        );

        // For admin, check if Employees module exists and add children
        const employees = all.find(m => m?.name?.trim() === 'Employees');

        if (employees && currentUserRole.value === 'admin') {
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
        const moduleList = filteredModules.value;
        if (!moduleList.length) return [];
        return moduleList.filter(m =>
            m && PROJECT_MODULES.includes(m.name?.trim())
        );
    });

    const accountModules = computed(() => {
        const moduleList = filteredModules.value;
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
            return user.role?.name || user.role_name || user.role || 'Administrator';
        } catch {
            return 'Administrator';
        }
    };

    const loadModules = async () => {
        try {
            if (!store.modules || store.modules.length === 0) {
                await store.fetchModules();
            }
            checkDrillDownOnRoute();
        } catch (err) {
            console.error('Failed to load sidebar modules:', err);
        }

        try {
            await inboxStore.fetchConversations();
        } catch (err) {
            console.error('Failed to load conversations for sidebar badge:', err);
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
        unreadConversationsCount,
        refreshModules: store.fetchModules,
        currentUserRole,
        loadModules,
        userRoleId,
    };
}