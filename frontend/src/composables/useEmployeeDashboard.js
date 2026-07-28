// composables/useEmployeeDashboard.js
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore.js';
import { useToast } from '@/composables/useToast.js';

export function useEmployeeDashboard() {
    const employeeStore = useEmployeeStore();
    const { showToast } = useToast();
    const tempStatusId = ref(null);
    const allEmployees = computed(() => employeeStore.employees);
    const isLoading = computed(() => employeeStore.isLoading);
    const errorMessage = computed(() => employeeStore.error || '');
    const searchQuery = ref('');
    const currentPage = ref(1);
    const pageSize = ref(5);
    const sortBy = ref('name');
    const sortDirection = ref('asc');
    const showModal = ref(false);
    const isViewModalOpen = ref(false);
    const showMore = ref(false);
    const viewEmployee = ref(null);
    const isEditModalOpen = ref(false);
    const isUpdating = ref(false);
    const selectedEmployee = ref(null);
    const isCreateModalOpen = ref(false);
    const isCreating = ref(false);
    const showMoreEdit = ref(false);
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const passwordError = ref('');
    const passwordStrength = ref('');
    const passwordStrengthColor = ref('');
    const passwordStrengthClass = ref('');
    const showStrongMessage = ref(false);
    let strongMessageTimeout = null;
    const statusChangeEmployee = ref(null);
    const showStatusConfirmModal = ref(false);
    const selectedNewStatus = ref(null);
    const statusFeedback = ref('');
    const isChangingStatus = ref(false);
    const statusChangeError = ref('');
    const employmentStatuses = computed(() => employeeStore.employmentStatuses || []);
    const createFormData = reactive({
        name: '',
        email: '',
        phone_number: '',
        position: '',
        salary: '',
        department: '',
        insurance_amount: '',
        tax: ''
    });

    const editFormData = reactive({
        name: '',
        email: '',
        phone_number: '',
        department: '',
        designation: '',
        status: 'Permanent',
        is_active: true,
        work_from_home: false,
        salary: '',
        joined_date: '',
        employee_number: '',
        cnic: '',
        gender: '',
        present_address: '',
        permanent_address: '',
        emergency_name: '',
        emergency_relation: '',
        emergency_cnic: '',
        emergency_phone: '',
        emergency_address: '',
        bank_name: '',
        branch_name: '',
        account_number: '',
        password: '',
        confirmPassword: '',
        tax: '',
        insurance_amount: '',
    });

    // Computed for pagination
    const pageNumbers = computed(() => {
        const total = totalPages.value;
        const current = currentPage.value;
        if (total <= 1) return [];
        const pages = [];
        const maxVisible = 5;
        if (total <= maxVisible) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            const left = Math.max(1, current - 1);
            const right = Math.min(total, current + 1);
            if (left > 1) {
                pages.push(1);
                if (left > 2) pages.push('...');
            }
            for (let i = left; i <= right; i++) {
                pages.push(i);
            }
            if (right < total) {
                if (right < total - 1) pages.push('...');
                pages.push(total);
            }
        }
        return pages;
    });

    // Client‑side filtering (case‑insensitive)
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

    // Sorting the filtered list
    const sortedEmployees = computed(() => {
        const list = filteredEmployees.value;
        if (!sortBy.value) return list;

        const field = sortBy.value;
        const dir = sortDirection.value;
        return [...list].sort((a, b) => {
            const valA = (a[field] ?? '').toString().toLowerCase();
            const valB = (b[field] ?? '').toString().toLowerCase();

            if (valA < valB) return dir === 'asc' ? -1 : 1;
            if (valA > valB) return dir === 'asc' ? 1 : -1;
            return 0;
        });
    });

    // Pagination on the sorted list
    const totalFiltered = computed(() => sortedEmployees.value.length);
    const totalPages = computed(() => Math.ceil(totalFiltered.value / pageSize.value));

    const paginatedEmployees = computed(() => {
        const start = (currentPage.value - 1) * pageSize.value;
        const end = start + pageSize.value;
        return sortedEmployees.value.slice(start, end);
    });

    // Stats summary (overall, not filtered)
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
    const updateEmployee = async (employeeId, payload) => {
        const result = await employeeStore.updateEmployeeDetails(employeeId, payload);
        if (result.success) {
            calculateStats();
        }
        return result;
    };

    const updateEmployeeStatus = async (employeeId, statusData) => {
        const result = await employeeStore.updateEmployeeStatus(employeeId, statusData);
        if (result.success) {
            calculateStats();
        }
        return result;
    };

    // Toggle sorting
    const toggleSort = (field) => {
        if (sortBy.value === field) {
            sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        } else {
            sortBy.value = field;
            sortDirection.value = 'asc';
        }
    };

    // Password validation functions
    const validatePasswordStrength = (password) => {
        const errors = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
        }

        return errors;
    };

    const getPasswordRules = (password) => {
        const rules = [
            { text: 'At least 8 characters', passed: password.length >= 8 },
            { text: 'Contains lowercase letter', passed: /[a-z]/.test(password) },
            { text: 'Contains uppercase letter', passed: /[A-Z]/.test(password) },
            { text: 'Contains a number', passed: /[0-9]/.test(password) },
            { text: 'Contains special character (!@#$%^&*)', passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
        ];
        return rules;
    };

    const getStatusColor = (statusId) => {
        const status = employmentStatuses.value.find(s => s.id === statusId);
        if (!status) return '#1e293b';

        const colors = {
            'Intern': '#7c3aed',
            'Probation': '#d97706',
            'Contract': '#4f46e5',
            'Permanent': '#059669',
            'Resign': '#dc2626'
        };
        return colors[status.name] || '#1e293b';
    };

    const getStatusBgColor = (statusId) => {
        const status = employmentStatuses.value.find(s => s.id === statusId);
        if (!status) return '#f1f5f9';

        const bgColors = {
            'Intern': '#ede9fe',
            'Probation': '#fef3c7',
            'Contract': '#e0e7ff',
            'Permanent': '#d1fae5',
            'Resign': '#fee2e2'
        };
        return bgColors[status.name] || '#f1f5f9';
    };

    const getStatusName = (statusId) => {
        const status = employmentStatuses.value.find(s => s.id === statusId);
        return status ? status.name : 'Unknown';
    };

    const getEmployeeStatusId = (employee) => {
        if (!employee) return null;
        if (employee.status && typeof employee.status === 'object' && employee.status.id) {
            return employee.status.id;
        }
        if (typeof employee.status === 'string') {
            const statusObj = employmentStatuses.value.find(s =>
                s.name.toLowerCase() === employee.status.toLowerCase()
            );
            return statusObj ? statusObj.id : null;
        }
        if (employee.status_id) {
            return employee.status_id;
        }
        return null;
    };

    // Modal handlers
    const openCreateModal = () => {
        Object.assign(createFormData, {
            name: '',
            email: '',
            phone_number: '',
            position: '',
            salary: '',
            department: '',
            insurance_amount: '',
            tax: ''
        });
        isCreateModalOpen.value = true;
    };

    const closeCreateModal = () => {
        isCreateModalOpen.value = false;
    };

    const handleCreateEmployee = async () => {
        if (!createFormData.name.trim() || !createFormData.email.trim()) {
            showToast('Name and Email are required.', 'error');
            return;
        }
        if (!createFormData.phone_number.trim()) {
            showToast('Phone number is required.', 'error');
            return;
        }
        if (!createFormData.department.trim()) {
            showToast('Department is required.', 'error');
            return;
        }

        isCreating.value = true;
        try {
            const formDataPayload = new FormData();

            // ADD THIS LINE:
            formDataPayload.append('source', 'admin_quick');

            formDataPayload.append('name', createFormData.name.trim());
            formDataPayload.append('email', createFormData.email.trim());
            formDataPayload.append('phone_number', createFormData.phone_number.trim());
            formDataPayload.append(
                'designation',
                (createFormData.position || '').trim() || 'Employee'
            );
            formDataPayload.append('department', createFormData.department.trim());
            formDataPayload.append('status', 'Intern');
            formDataPayload.append('is_active', 'true');
            formDataPayload.append(
                'joined_date',
                new Date().toISOString().split('T')[0]
            );
            if (createFormData.salary) {
                formDataPayload.append('salary', parseFloat(createFormData.salary));
            }
            if (createFormData.insurance_amount) {
                formDataPayload.append('insurance_amount', parseFloat(createFormData.insurance_amount));
            }
            if (createFormData.tax) {
                formDataPayload.append('tax', parseFloat(createFormData.tax));
            }

            const result = await employeeStore.addEmployee(formDataPayload);

            if (result.success) {
                const emailNote = result.data?.email_sent === false
                    ? ' Create-password email could not be sent — check Email settings.'
                    : ' A create-password link was emailed to the employee.';
                showToast(`Employee created successfully.${emailNote}`, 'success', 5000);
                closeCreateModal();
                try {
                    await loadEmployees();
                } catch (refreshErr) {
                    console.error('Employee created but list refresh failed:', refreshErr);
                }
            } else {
                showToast(result.error || 'Failed to create employee', 'error', 6000);
            }
        } catch (error) {
            console.error('Failed to create employee:', error);
            showToast(error?.message || 'Failed to create employee. Please try again.', 'error');
        } finally {
            isCreating.value = false;
        }
    };

    const openEditModal = (employee) => {
        selectedEmployee.value = employee;
        passwordError.value = '';
        passwordStrength.value = '';
        passwordStrengthColor.value = '';
        passwordStrengthClass.value = '';
        showStrongMessage.value = false;
        if (strongMessageTimeout) clearTimeout(strongMessageTimeout);

        Object.assign(editFormData, {
            name: employee.name || employee.full_name || '',
            email: employee.email || '',
            phone_number: employee.phone_number || '',
            department: employee.department || '',
            designation: employee.designation || '',
            status: employee.status || employee.employment_status || 'Permanent',
            is_active: employee.is_active === true || employee.is_active === 'true' || employee.account_status === 'Active',
            work_from_home: employee.work_from_home === true || employee.work_from_home === 'true',
            salary: employee.salary || '',
            joined_date: employee.joined_date || '',
            employee_number: employee.employee_number || '',
            cnic: employee.cnic || '',
            gender: employee.gender || '',
            present_address: employee.present_address || '',
            permanent_address: employee.permanent_address || '',
            emergency_name: employee.emergency_name || '',
            emergency_relation: employee.emergency_relation || '',
            emergency_cnic: employee.emergency_cnic || '',
            emergency_phone: employee.emergency_phone || '',
            emergency_address: employee.emergency_address || '',
            bank_name: employee.bank_name || '',
            branch_name: employee.branch_name || '',
            account_number: employee.account_number || '',
            password: '',
            confirmPassword: '',
            tax: employee.tax || '',
            insurance_amount: employee.insurance_amount || '',
        });
        isEditModalOpen.value = true;
    };

    const closeEditModal = () => {
        isEditModalOpen.value = false;
        selectedEmployee.value = null;
        showMoreEdit.value = false;
        showStrongMessage.value = false;
        if (strongMessageTimeout) clearTimeout(strongMessageTimeout);
    };

    const handleUpdateEmployee = async () => {
        if (!selectedEmployee.value) return;

        const password = editFormData.password;
        const confirmPassword = editFormData.confirmPassword;

        if ((password && !confirmPassword) || (!password && confirmPassword)) {
            passwordError.value = 'Both password fields must be filled or both empty.';
            return;
        }

        if (password && confirmPassword && password !== confirmPassword) {
            passwordError.value = 'Passwords do not match.';
            return;
        }

        if (password) {
            const strengthErrors = validatePasswordStrength(password);
            if (strengthErrors.length > 0) {
                passwordError.value = 'Password is too weak: ' + strengthErrors.join(', ');
                return;
            }
        }

        passwordError.value = '';

        isUpdating.value = true;
        try {
            const payload = {};
            const textFields = [
                'name', 'email', 'phone_number', 'department', 'designation', 'status',
                'present_address', 'permanent_address', 'emergency_name', 'emergency_relation',
                'emergency_phone', 'emergency_address', 'bank_name', 'branch_name', 'account_number',
            ];
            const nullableTextFields = ['cnic', 'gender', 'emergency_cnic'];
            const numberFields = ['salary', 'tax', 'insurance_amount'];

            textFields.forEach((key) => {
                const value = editFormData[key];
                if (value !== undefined && value !== null) {
                    payload[key] = typeof value === 'string' ? value.trim() : value;
                }
            });

            nullableTextFields.forEach((key) => {
                const value = editFormData[key];
                if (value === undefined || value === null || value === '') {
                    payload[key] = null;
                } else {
                    payload[key] = typeof value === 'string' ? value.trim() : value;
                }
            });

            if (editFormData.joined_date) {
                payload.joined_date = editFormData.joined_date;
            }

            numberFields.forEach((key) => {
                const value = editFormData[key];
                if (value === '' || value === null || value === undefined) return;
                const num = Number(value);
                if (!Number.isNaN(num)) payload[key] = num;
            });

            payload.is_active = !!editFormData.is_active;
            payload.work_from_home = !!editFormData.work_from_home;

            if (password) {
                payload.password = password;
            }

            const result = await updateEmployee(selectedEmployee.value.id, payload);
            if (result.success) {
                showToast(
                    password ? 'Employee and login password updated successfully!' : 'Employee updated successfully!',
                    'success'
                );
                closeEditModal();
                try {
                    await loadEmployees();
                } catch (refreshErr) {
                    console.error('Updated but list refresh failed:', refreshErr);
                }
            } else {
                showToast(result.error || 'Update failed', 'error', 6000);
            }
        } catch (error) {
            console.error('Update error:', error);
            showToast(error?.message || 'An error occurred while updating.', 'error');
        } finally {
            isUpdating.value = false;
        }
    };

    const openViewModal = (employee) => {
        viewEmployee.value = employee;
        isViewModalOpen.value = true;
    };

    const closeViewModal = () => {
        isViewModalOpen.value = false;
        showMore.value = false;
    };

    const toggleActive = async (employee, event) => {
        const newActive = event.target.checked;
        const result = await updateEmployee(employee.id, { is_active: newActive });
        if (!result.success) {
            showToast(`Error: ${result.error || 'Update failed'}`, 'error');
            event.target.checked = !newActive;
        } else {
            showToast('Account status updated successfully!', 'success');
        }
    };

    const handleStatusChange = (employee, newStatusId) => {
        console.log('Status change triggered:', { employee, newStatusId });

        const statusObj = employmentStatuses.value.find(s => s.id === newStatusId);
        if (!statusObj) {
            console.error('Status not found:', newStatusId);
            return;
        }

        const currentStatusId = getEmployeeStatusId(employee);
        console.log('Current status ID:', currentStatusId, 'New status ID:', newStatusId);

        if (currentStatusId === newStatusId) {
            console.log('Status not changed');
            return;
        }
        tempStatusId.value = newStatusId;

        statusChangeEmployee.value = employee;
        selectedNewStatus.value = statusObj;
        statusFeedback.value = '';
        statusChangeError.value = '';

        console.log('Opening confirmation modal for:', employee.name, 'to', statusObj.name);

        showStatusConfirmModal.value = true;
    };
    const confirmStatusChange = async () => {
        if (!statusChangeEmployee.value || !selectedNewStatus.value) return;

        if (selectedNewStatus.value.name.toLowerCase() === 'resign' && !statusFeedback.value.trim()) {
            statusChangeError.value = 'Please provide a reason for resignation';
            return;
        }

        isChangingStatus.value = true;
        statusChangeError.value = '';

        try {
            const payload = {
                status: selectedNewStatus.value.id
            };

            if (statusFeedback.value.trim()) {
                payload.feedback = statusFeedback.value.trim();
            }

            const result = await updateEmployeeStatus(statusChangeEmployee.value.id, payload);

            if (result.success) {
                statusChangeEmployee.value.status_id = selectedNewStatus.value.id;
                statusChangeEmployee.value.status = selectedNewStatus.value.name;

                showToast(`Status changed to ${selectedNewStatus.value.name} successfully`, 'success');
                showStatusConfirmModal.value = false;
                statusChangeEmployee.value = null;
                selectedNewStatus.value = null;
                statusFeedback.value = '';
                tempStatusId.value = null;
                await loadEmployees();
            } else {
                statusChangeError.value = result.error || 'Failed to update status';
                showToast(statusChangeError.value, 'error');
                if (statusChangeEmployee.value) {
                    const originalStatusId = getEmployeeStatusId(statusChangeEmployee.value);
                    tempStatusId.value = originalStatusId;
                }
            }
        } catch (error) {
            console.error('Status change error:', error);
            statusChangeError.value = error.message || 'An error occurred';
            showToast(statusChangeError.value, 'error');
            if (statusChangeEmployee.value) {
                const originalStatusId = getEmployeeStatusId(statusChangeEmployee.value);
                tempStatusId.value = originalStatusId;
            }
        } finally {
            isChangingStatus.value = false;
        }
    };

    const cancelStatusChange = () => {
        showStatusConfirmModal.value = false;
        statusChangeEmployee.value = null;
        selectedNewStatus.value = null;
        statusFeedback.value = '';
        statusChangeError.value = '';
        tempStatusId.value = null;
    };

    const toggleMoreEdit = () => {
        showMoreEdit.value = !showMoreEdit.value;
    };

    const copyOnboardingLink = async () => {
        const link = `${window.location.origin}/onboarding/new`;
        try {
            await navigator.clipboard.writeText(link);
            showToast('Onboarding link copied to clipboard!', 'success');
        } catch (err) {
            showToast('Failed to copy link', 'error');
            prompt('Copy this link:', link);
        }
    };
    watch(showModal, (isOpen) => {
        const container = document.getElementById('dashboardScrollContainer');
        if (isOpen) {
            document.body.classList.add('overflow-hidden');
            if (container) container.classList.add('!overflow-y-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
            if (container) container.classList.remove('!overflow-y-hidden');
        }
    });
    watch(() => editFormData.password, (newPassword) => {
        if (!newPassword) {
            passwordStrength.value = '';
            passwordStrengthColor.value = '';
            passwordStrengthClass.value = '';
            showStrongMessage.value = false;
            if (strongMessageTimeout) clearTimeout(strongMessageTimeout);
            return;
        }

        const errors = validatePasswordStrength(newPassword);

        if (errors.length === 0) {
            passwordStrength.value = 'Strong';
            passwordStrengthColor.value = 'text-green-600';
            passwordStrengthClass.value = 'bg-green-100 border-green-300';

            showStrongMessage.value = true;
            if (strongMessageTimeout) clearTimeout(strongMessageTimeout);
            strongMessageTimeout = setTimeout(() => {
                showStrongMessage.value = false;
            }, 2000);
        } else if (errors.length <= 2) {
            passwordStrength.value = 'Medium';
            passwordStrengthColor.value = 'text-yellow-600';
            passwordStrengthClass.value = 'bg-yellow-100 border-yellow-300';
            showStrongMessage.value = false;
            if (strongMessageTimeout) clearTimeout(strongMessageTimeout);
        } else {
            passwordStrength.value = 'Weak';
            passwordStrengthColor.value = 'text-red-600';
            passwordStrengthClass.value = 'bg-red-100 border-red-300';
            showStrongMessage.value = false;
            if (strongMessageTimeout) clearTimeout(strongMessageTimeout);
        }
    });
    watch(() => editFormData.confirmPassword, () => {
        if (passwordError.value && passwordError.value.includes('match')) {
            if (editFormData.password === editFormData.confirmPassword) {
                passwordError.value = '';
            }
        }
    });

    const initialize = () => {
        employeeStore.fetchEmploymentStatuses();
        loadEmployees();
        window.addEventListener('employee-created', loadEmployees);
    };

    const cleanup = () => {
        window.removeEventListener('employee-created', loadEmployees);
        if (strongMessageTimeout) {
            clearTimeout(strongMessageTimeout);
        }
    };

    return {
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
        updateEmployee,
        pageNumbers,
        allEmployees,
        calculateStats,
        updateEmployeeStatus,
        showModal,
        isViewModalOpen,
        showMore,
        viewEmployee,
        isEditModalOpen,
        isUpdating,
        selectedEmployee,
        isCreateModalOpen,
        isCreating,
        showMoreEdit,
        showPassword,
        showConfirmPassword,
        passwordError,
        passwordStrength,
        passwordStrengthColor,
        passwordStrengthClass,
        showStrongMessage,
        statusChangeEmployee,
        showStatusConfirmModal,
        selectedNewStatus,
        statusFeedback,
        isChangingStatus,
        statusChangeError,
        employmentStatuses,
        createFormData,
        editFormData,
        getPasswordRules,
        getStatusColor,
        getStatusBgColor,
        getStatusName,
        getEmployeeStatusId,
        openCreateModal,
        closeCreateModal,
        handleCreateEmployee,
        openEditModal,
        closeEditModal,
        handleUpdateEmployee,
        openViewModal,
        closeViewModal,
        toggleActive,
        handleStatusChange,
        confirmStatusChange,
        cancelStatusChange,
        toggleMoreEdit,
        copyOnboardingLink,
        initialize,
        cleanup,
        tempStatusId,
    };
}