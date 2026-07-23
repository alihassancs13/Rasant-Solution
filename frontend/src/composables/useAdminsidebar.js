// composables/Admin/useAdminSidebar.js
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSidebarStore } from '@/stores/sidebarStore.js';
import { useInboxStore } from '@/stores/inboxStore.js';

const dropdownStates = ref({});
const isSidebarOpen = ref(false);
const collapsed = ref(localStorage.getItem('sidebarCollapsed') === 'true');
const isDrillDown = ref(localStorage.getItem('sidebarDrillDown') === 'true');

export function useAdminSidebar() {
    const route = useRoute();
    const router = useRouter();
    const store = useSidebarStore();
    const inboxStore = useInboxStore();

    const getUserData = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    };

    const userRoleId = computed(() => {
        const user = getUserData();
        if (!user) return null;

        const explicitId = user.role_id ?? user.roleId ?? (typeof user.role === 'object' ? user.role?.id : null);
        if (explicitId === 1 || explicitId === '1') return 1;
        if (explicitId === 2 || explicitId === '2') return 2;

        const raw =
            user.role_name ||
            (typeof user.role === 'string' ? user.role : user.role?.name) ||
            '';
        const name = String(raw).toLowerCase().trim();

        if (name.includes('admin') || name === 'administrator') return 1;
        if (name.includes('employee')) return 2;
        return null;
    });

    const currentUserRole = computed(() => {
        const roleId = userRoleId.value;
        if (roleId === 1) return 'admin';
        if (roleId === 2) return 'employee';
        return 'employee';
    });

    /** Flat list of all modules returned by the API (including nested children). */
    const modules = computed(() => {
        const top = Array.isArray(store.modules) ? store.modules : [];
        const flat = [...top];
        top.forEach((m) => {
            if (Array.isArray(m?.children)) flat.push(...m.children);
        });
        return flat;
    });

    const unreadConversationsCount = computed(() => inboxStore.unreadConversationsCount);
    const loading = computed(() => store.isLoading);
    const error = computed(() => store.error);

    /** Main nav items — exactly what backend sent (already role-scoped + nested). */
    const companyModules = computed(() => {
        return Array.isArray(store.modules) ? store.modules : [];
    });

    const projectModules = computed(() => {
        return Array.isArray(store.projectModules) ? store.projectModules : [];
    });

    const accountModules = computed(() => {
        const fromApi = Array.isArray(store.accountModules) ? store.accountModules : [];
        if (fromApi.length) return fromApi;
        // Always keep account reachable even if DB has no account module row
        return [{
            id: 'account-fallback',
            name: 'Manage Account',
            icon: 'fa-solid fa-users-gear',
            link: '/admin/account',
            role_id: userRoleId.value,
            section: 'account',
        }];
    });

    const employeeChildrenModules = computed(() => {
        const employees = companyModules.value.find((m) => Array.isArray(m?.children) && m.children.length);
        return employees?.children || [];
    });

    const employeesParent = computed(() => {
        if (isDrillDown.value) return null;
        return companyModules.value.find((m) => Array.isArray(m?.children) && m.children.length) || null;
    });

    const getModuleRoute = (name) => {
        if (!name) return '/admin';
        const fromStore = store.getModuleRoute(name);
        if (fromStore) return fromStore;
        const account = accountModules.value.find((m) => m?.name?.trim() === name?.trim());
        if (account?.link) return account.link;
        return `/admin/${String(name).toLowerCase().replace(/ /g, '-')}`;
    };

    const isActive = (moduleName) => {
        if (!moduleName) return false;

        const normalize = (p) => (p || '').toLowerCase().replace(/\/+$/, '') || '/';
        const path = normalize(route.path);
        const modulePath = normalize(getModuleRoute(moduleName));

        const allModulePaths = modules.value
            .map((m) => normalize(m?.link || getModuleRoute(m?.name)))
            .filter((p) => p && p !== '/');

        const matches = allModulePaths.filter(
            (p) => path === p || path.startsWith(`${p}/`)
        );
        if (matches.length) {
            matches.sort((a, b) => b.length - a.length);
            const best = matches[0];
            return best === modulePath;
        }

        if (path === modulePath || path.startsWith(`${modulePath}/`)) return true;

        const parent = companyModules.value.find((m) => m?.name?.trim() === moduleName?.trim());
        if (parent?.children?.length) {
            return parent.children.some((child) => {
                const childPath = normalize(child.link || getModuleRoute(child.name));
                return path === childPath || path.startsWith(`${childPath}/`);
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
        Object.keys(dropdownStates.value).forEach((key) => {
            dropdownStates.value[key] = false;
        });
    };

    const goBackFromDrillDown = () => {
        isDrillDown.value = false;
        localStorage.setItem('sidebarDrillDown', 'false');
    };

    const checkDrillDownOnRoute = () => {
        if (currentUserRole.value === 'employee') {
            isDrillDown.value = false;
            localStorage.setItem('sidebarDrillDown', 'false');
            return;
        }

        const currentPath = route.path;
        const childPaths = employeeChildrenModules.value
            .map((m) => m.link || getModuleRoute(m.name))
            .filter(Boolean);

        if (childPaths.some((path) => currentPath === path || currentPath.startsWith(`${path}/`))) {
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
            const name =
                user.role_name ||
                (typeof user.role === 'object' ? user.role?.name : user.role) ||
                '';
            if (name) return String(name);
            if (user.role_id === 2 || user.role_id === '2') return 'employee';
            if (user.role_id === 1 || user.role_id === '1') return 'admin';
            return 'user';
        } catch {
            return 'user';
        }
    };

    const loadModules = async () => {
        try {
            await store.fetchModules();
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
