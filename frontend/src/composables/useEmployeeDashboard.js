// composables/useEmployeeDashboard.js
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useEmployeeStore } from '@/stores/employeeStore.js';
import { useToast } from '@/composables/useToast.js';
import { useValidation } from '@/composables/useValidation.js';
export function useEmployeeDashboard() {
    const employeeStore = useEmployeeStore();
    const { showToast } = useToast();
    const {
        getUsernameError,
        getEmailError,
        getPhoneError,
        getAmountError,
        getNumericRangeError,
        getAddressLengthError,
        getAccountNumberError,
    } = useValidation();
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
    const showOnlyActive = ref(false);
    // ==================== CREATE FORM ====================
    const createFormData = reactive({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        phone_number: '',
        position: '',
        salary: '',
        department: '',
        insurance_amount: '',
        tax: ''
    });

    const createTouched = reactive({
        first_name: false,
        last_name: false,
        username: false,
        email: false,
        phone_number: false,
        position: false,
        salary: false,
        department: false,
        insurance_amount: false,
        tax: false,
    });
    const createErrors = reactive({
        first_name: null,
        last_name: null,
        username: null,
        email: null,
        phone_number: null,
        position: null,
        salary: null,
        department: null,
        insurance_amount: null,
        tax: null,
    });

    const CREATE_REQUIRED_FIELDS = ['first_name', 'last_name','username','email', 'phone_number', 'salary', 'department', 'position',];

    const isCreateFormValid = computed(() => {
        for (const field of CREATE_REQUIRED_FIELDS) {
            if (!createFormData[field] || !String(createFormData[field]).trim()) {
                return false;
            }
        }
        for (const field of Object.keys(createErrors)) {
            if (createErrors[field]) {
                return false;
            }
        }
        return true;
    });

    const validateCreateField = (field) => {
        const value = createFormData[field];
        const isOptionalAndEmpty = !CREATE_REQUIRED_FIELDS.includes(field) && !String(value ?? '').trim();
        if (isOptionalAndEmpty) {
            createErrors[field] = null;
            return null;
        }

        let error = null;
        switch (field) {
            case 'first_name':
                error = getUsernameError(value, 32, 'First Name');
                break;
            case 'last_name':
                error = getUsernameError(value, 32, 'Last Name');
                break;
            case 'username':
                error = getUsernameError(value, 32, 'Username');
                break;
            case 'email':
                error = (!value || !value.trim()) ? 'Email is required.' : getEmailError(value);
                break;
            case 'phone_number':
                error = getPhoneError(value);
                break;
            case 'position':
                error = getUsernameError(value, 32, 'Designation');
                break;
            case 'salary':
                error = getAmountError(value, 8, 'Monthly Salary');
                break;
            case 'department':
                error = getUsernameError(value, 32, 'Department');
                break;
            case 'insurance_amount':
                error = getAmountError(value, 8, 'Insurance Amount');
                break;
            case 'tax':
                error = getNumericRangeError(value, { min: 0, max: 100, fieldName: 'Tax' });
                break;
            default:
                break;
        }
        createErrors[field] = error;
        return error;
    };

    const markCreateTouched = (field) => {
        createTouched[field] = true;
        validateCreateField(field);
    };

    // Create form watches (live validation only — no character stripping/restriction)
    watch(() => createFormData.first_name, () => { createTouched.first_name = true; validateCreateField('first_name'); });
    watch(() => createFormData.last_name, () => { createTouched.last_name = true; validateCreateField('last_name'); });
    watch(() => createFormData.username, () => { createTouched.username = true; validateCreateField('username'); });
    watch(() => createFormData.email, () => { createTouched.email = true; validateCreateField('email'); });
    watch(() => createFormData.phone_number, () => { createTouched.phone_number = true; validateCreateField('phone_number'); });
    watch(() => createFormData.position, () => { createTouched.position = true; validateCreateField('position'); });
    watch(() => createFormData.salary, () => { createTouched.salary = true; validateCreateField('salary'); });
    watch(() => createFormData.department, () => { createTouched.department = true; validateCreateField('department'); });
    watch(() => createFormData.insurance_amount, () => { createTouched.insurance_amount = true; validateCreateField('insurance_amount'); });
    watch(() => createFormData.tax, () => { createTouched.tax = true; validateCreateField('tax'); });

    // ==================== EDIT FORM ====================
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
    const editTouched = reactive({
        name: false,
        email: false,
        phone_number: false,
        department: false,
        designation: false,
        salary: false,
        joined_date: false,
        cnic: false,
        gender: false,
        present_address: false,
        permanent_address: false,
        emergency_name: false,
        emergency_relation: false,
        emergency_cnic: false,
        emergency_phone: false,
        emergency_address: false,
        bank_name: false,
        branch_name: false,
        account_number: false,
        tax: false,
        insurance_amount: false,
    });
    const editErrors = reactive({
        name: null,
        email: null,
        phone_number: null,
        department: null,
        designation: null,
        salary: null,
        joined_date: null,
        cnic: null,
        gender: null,
        present_address: null,
        permanent_address: null,
        emergency_name: null,
        emergency_relation: null,
        emergency_cnic: null,
        emergency_phone: null,
        emergency_address: null,
        bank_name: null,
        branch_name: null,
        account_number: null,
        tax: null,
        insurance_amount: null,
    });
    const EDIT_REQUIRED_FIELDS = ['name', 'email', 'phone_number', 'department', 'designation', 'salary', 'joined_date'];
    const isEditFormValid = computed(() => {
        for (const field of EDIT_REQUIRED_FIELDS) {
            if (!editFormData[field] || !String(editFormData[field]).trim()) {
                return false;
            }
        }
        for (const field of Object.keys(editErrors)) {
            if (editErrors[field]) {
                return false;
            }
        }
        return true;
    });
    const isValidCnic = (cnic) => !!cnic && /^\d{13}$/.test(cnic.replace(/[-\s]/g, ''));

    const getCnicError = (cnic) => {
        if (!cnic) return null;
        return /^\d{13}$/.test(cnic.replace(/[-\s]/g, '')) ? null : 'CNIC must be exactly 13 digits (e.g., 12345-1234567-8)';
    };

    const validateEditField = (field) => {
        const value = editFormData[field];
        const isOptionalAndEmpty = !EDIT_REQUIRED_FIELDS.includes(field) && !String(value ?? '').trim();
        if (isOptionalAndEmpty) {
            editErrors[field] = null;
            return null;
        }

        let error = null;
        switch (field) {
            case 'name':
                error = getUsernameError(value, 32, 'Full Name');
                break;
            case 'email':
                error = (!value || !value.trim()) ? 'Email is required.' : getEmailError(value);
                break;
            case 'phone_number':
                error = getPhoneError(value);
                break;
            case 'department':
                error = getUsernameError(value, 32, 'Department');
                break;
            case 'designation':
                error = getUsernameError(value, 32, 'Designation');
                break;
            case 'salary':
                error = getAmountError(value, 8, 'Monthly Salary');
                break;
            case 'joined_date':
                error = !value ? 'Joined date is required.' : null;
                break;
            case 'cnic':
                error = value ? (getCnicError(value) || null) : null;
                break;
            case 'gender':
                error = null;
                break;
            case 'present_address':
                error = value ? getAddressLengthError(value, 250, 'Present address') : null;
                break;
            case 'permanent_address':
                error = value ? getAddressLengthError(value, 250, 'Permanent address') : null;
                break;
            case 'emergency_name':
                error = value ? getUsernameError(value, 32, 'Emergency contact name') : null;
                break;
            case 'emergency_relation':
                error = value ? getUsernameError(value, 32, 'Relation') : null;
                break;
            case 'emergency_cnic':
                error = value ? (getCnicError(value) || null) : null;
                break;
            case 'emergency_phone':
                error = value ? getPhoneError(value, 15, 'Emergency phone number') : null;
                break;
            case 'emergency_address':
                error = value ? getAddressLengthError(value, 250, 'Emergency contact address') : null;
                break;
            case 'bank_name':
                error = value ? getUsernameError(value, 32, 'Bank name') : null;
                break;
            case 'branch_name':
                error = value ? getUsernameError(value, 32, 'Branch name') : null;
                break;
            case 'account_number':
                error = value ? getAccountNumberError(value, 24, 'Account no / IBAN number') : null;
                break;
            case 'tax':
                error = value ? getNumericRangeError(value, { min: 0, max: 100, fieldName: 'Tax' }) : null;
                break;
            case 'insurance_amount':
                error = value ? getAmountError(value, 8, 'Insurance Amount') : null;
                break;
            default:
                break;
        }
        editErrors[field] = error;
        return error;
    };

    const markEditTouched = (field) => {
        editTouched[field] = true;
        validateEditField(field);
    };

    // Edit form watches for live validation (no restriction, no stripping)
    watch(() => editFormData.name, () => { editTouched.name = true; validateEditField('name'); });
    watch(() => editFormData.email, () => { editTouched.email = true; validateEditField('email'); });
    watch(() => editFormData.phone_number, () => { editTouched.phone_number = true; validateEditField('phone_number'); });
    watch(() => editFormData.department, () => { editTouched.department = true; validateEditField('department'); });
    watch(() => editFormData.designation, () => { editTouched.designation = true; validateEditField('designation'); });
    watch(() => editFormData.salary, () => { editTouched.salary = true; validateEditField('salary'); });
    watch(() => editFormData.joined_date, () => { editTouched.joined_date = true; validateEditField('joined_date'); });
    watch(() => editFormData.cnic, () => { editTouched.cnic = true; validateEditField('cnic'); });
    watch(() => editFormData.gender, () => { editTouched.gender = true; validateEditField('gender'); });
    watch(() => editFormData.present_address, () => { editTouched.present_address = true; validateEditField('present_address'); });
    watch(() => editFormData.permanent_address, () => { editTouched.permanent_address = true; validateEditField('permanent_address'); });
    watch(() => editFormData.emergency_name, () => { editTouched.emergency_name = true; validateEditField('emergency_name'); });
    watch(() => editFormData.emergency_relation, () => { editTouched.emergency_relation = true; validateEditField('emergency_relation'); });
    watch(() => editFormData.emergency_cnic, () => { editTouched.emergency_cnic = true; validateEditField('emergency_cnic'); });
    watch(() => editFormData.emergency_phone, () => { editTouched.emergency_phone = true; validateEditField('emergency_phone'); });
    watch(() => editFormData.emergency_address, () => { editTouched.emergency_address = true; validateEditField('emergency_address'); });
    watch(() => editFormData.bank_name, () => { editTouched.bank_name = true; validateEditField('bank_name'); });
    watch(() => editFormData.branch_name, () => { editTouched.branch_name = true; validateEditField('branch_name'); });
    watch(() => editFormData.account_number, () => { editTouched.account_number = true; validateEditField('account_number'); });
    watch(() => editFormData.tax, () => { editTouched.tax = true; validateEditField('tax'); });
    watch(() => editFormData.insurance_amount, () => { editTouched.insurance_amount = true; validateEditField('insurance_amount'); });

    // ==================== REST OF THE CODE ====================

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

    const filteredEmployees = computed(() => {
        let employees = allEmployees.value;

        // Filter by search query
        if (searchQuery.value.trim()) {
            const query = searchQuery.value.toLowerCase().trim();
            employees = employees.filter(emp =>
                emp.name?.toLowerCase().includes(query) ||
                emp.employee_number?.toLowerCase().includes(query) ||
                emp.email?.toLowerCase().includes(query)
            );
        }
        if (showOnlyActive.value) {
            employees = employees.filter(emp => emp.is_active === true);
        }

        return employees;
    });

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

    const totalFiltered = computed(() => sortedEmployees.value.length);
    const totalPages = computed(() => Math.ceil(totalFiltered.value / pageSize.value));

    const paginatedEmployees = computed(() => {
        const start = (currentPage.value - 1) * pageSize.value;
        const end = start + pageSize.value;
        return sortedEmployees.value.slice(start, end);
    });

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

    const toggleSort = (field) => {
        if (sortBy.value === field) {
            sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
        } else {
            sortBy.value = field;
            sortDirection.value = 'asc';
        }
    };

    const validatePasswordStrength = (password) => {
        const errors = [];
        if (password.length < 8) errors.push('Password must be at least 8 characters long');
        if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
        if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
        if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
        return errors;
    };

    const getPasswordRules = (password) => ([
        { text: 'At least 8 characters', passed: password.length >= 8 },
        { text: 'Contains lowercase letter', passed: /[a-z]/.test(password) },
        { text: 'Contains uppercase letter', passed: /[A-Z]/.test(password) },
        { text: 'Contains a number', passed: /[0-9]/.test(password) },
        { text: 'Contains special character (!@#$%^&*)', passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ]);

    const getStatusColor = (statusId) => {
        const status = employmentStatuses.value.find(s => s.id === statusId);
        if (!status) return '#1e293b';
        const colors = { 'Intern': '#7c3aed', 'Probation': '#d97706', 'Contract': '#4f46e5', 'Permanent': '#059669', 'Resign': '#dc2626' };
        return colors[status.name] || '#1e293b';
    };

    const getStatusBgColor = (statusId) => {
        const status = employmentStatuses.value.find(s => s.id === statusId);
        if (!status) return '#f1f5f9';
        const bgColors = { 'Intern': '#ede9fe', 'Probation': '#fef3c7', 'Contract': '#e0e7ff', 'Permanent': '#d1fae5', 'Resign': '#fee2e2' };
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
            const statusObj = employmentStatuses.value.find(s => s.name.toLowerCase() === employee.status.toLowerCase());
            return statusObj ? statusObj.id : null;
        }
        if (employee.status_id) return employee.status_id;
        return null;
    };

    // ==================== MODAL HANDLERS ====================

    const openCreateModal = () => {
        Object.assign(createFormData, {
            first_name: '',
            last_name: '',username: '', email: '', phone_number: '', position: '',
            salary: '', department: '', insurance_amount: '', tax: ''
        });
        Object.keys(createTouched).forEach((k) => { createTouched[k] = false; });
        Object.keys(createErrors).forEach((k) => { createErrors[k] = null; });
        isCreateModalOpen.value = true;
    };

    const closeCreateModal = () => {
        isCreateModalOpen.value = false;
        Object.assign(createFormData, {
            first_name: '',
            last_name: '',
            username: '',
            email: '',
            phone_number: '',
            position: '',
            salary: '',
            department: '',
            insurance_amount: '',
            tax: ''
        });
        Object.keys(createTouched).forEach((k) => { createTouched[k] = false; });
        Object.keys(createErrors).forEach((k) => { createErrors[k] = null; });
    };

    const handleCreateEmployee = async () => {
        Object.keys(createTouched).forEach((field) => {
            createTouched[field] = true;
            validateCreateField(field);
        });

        let isValid = true;
        for (const field of Object.keys(createErrors)) {
            if (createErrors[field]) {
                isValid = false;
                break;
            }
        }

        for (const field of CREATE_REQUIRED_FIELDS) {
            if (!createFormData[field] || !String(createFormData[field]).trim()) {
                isValid = false;
                break;
            }
        }

        if (!isValid) {
            showToast('Please fill all highlighted fields correctly.', 'error');
            return;
        }

        isCreating.value = true;
        try {
            const formDataPayload = new FormData();

            formDataPayload.append('source', 'admin_quick');
            formDataPayload.append('first_name', createFormData.first_name.trim());
            formDataPayload.append('last_name', createFormData.last_name.trim());
            formDataPayload.append('username', createFormData.username.trim());
            formDataPayload.append('email', createFormData.email.trim());
            formDataPayload.append('phone_number', createFormData.phone_number.trim());
            formDataPayload.append('designation', (createFormData.position || '').trim() || 'Employee');
            formDataPayload.append('department', createFormData.department.trim());
            formDataPayload.append('status', 'Intern');
            formDataPayload.append('is_active', 'true');
            formDataPayload.append('joined_date', new Date().toISOString().split('T')[0]);
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
                    ? ' Onboarding form link cannot be sent — check Email settings.'
                    : ' Onboarding link sent to employee ';
                showToast(`${emailNote}`, 'success', 5000);
                closeCreateModal();
                try {
                    await loadEmployees();
                } catch (refreshErr) {
                    console.error('Employee created but list refresh failed:', refreshErr);
                }
            } else {
                let errorMsg = result.error || 'Failed to create employee';

                // Check for duplicate username error
                if (result.error && typeof result.error === 'string' && result.error.includes('Duplicate entry') && result.error.includes('username')) {
                    errorMsg = 'Username already exists. Please choose a different username.';
                }

                if (result.errors) {
                    const firstField = Object.keys(result.errors)[0];
                    if (firstField) {
                        const firstError = result.errors[firstField];
                        errorMsg = Array.isArray(firstError) ? firstError[0] : String(firstError);
                    }
                }

                showToast(errorMsg, 'error', 6000);
            }
        } catch (error) {
            console.error('Failed to create employee:', error);
            let errorMsg = error?.message || 'Failed to create employee. Please try again.';

            // Check for duplicate username error in catch block
            if (errorMsg && typeof errorMsg === 'string' && errorMsg.includes('Duplicate entry') && errorMsg.includes('username')) {
                errorMsg = 'Username already exists. Please choose a different username.';
            }

            showToast(errorMsg, 'error', 6000);
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

        Object.keys(editTouched).forEach((k) => { editTouched[k] = false; });
        Object.keys(editErrors).forEach((k) => { editErrors[k] = null; });

        Object.assign(editFormData, {
            name: employee.name || employee.full_name || '',
            email: employee.email || '',
            phone_number: employee.phone_number || '',
            department: employee.department || '',
            designation: employee.designation || '',
            status: employee.status || employee.employment_status || 'Permanent',
            is_active: employee.is_active === true || employee.is_active === 'true' || employee.account_status === 'Active',
            work_from_home: employee.work_from_home === true || employee.work_from_home === 'true',
            salary: employee.salary ? String(Math.trunc(Number(employee.salary))) : '',
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
            insurance_amount: employee.insurance_amount ? String(Math.trunc(Number(employee.insurance_amount))) : '',
        });

        EDIT_REQUIRED_FIELDS.forEach(field => {
            editTouched[field] = true;
            validateEditField(field);
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
        Object.keys(editTouched).forEach((field) => {
            editTouched[field] = true;
            validateEditField(field);
        });

        let isValid = true;
        for (const field of Object.keys(editErrors)) {
            if (editErrors[field]) {
                isValid = false;
                break;
            }
        }

        for (const field of EDIT_REQUIRED_FIELDS) {
            if (!editFormData[field] || !String(editFormData[field]).trim()) {
                isValid = false;
                break;
            }
        }

        if (!isValid) {
            showToast('Please fill all highlighted fields correctly.', 'error');
            return;
        }

        if (!selectedEmployee.value) return;

        const password = editFormData.password;
        const confirmPassword = editFormData.confirmPassword;

        if ((password && !confirmPassword) || (!password && confirmPassword)) {
            passwordError.value = 'Both password fields must be filled or both empty.';
            return;
        }

        if (password && confirmPassword && password !== confirmPassword) {
            passwordError.value = 'Passwords do not match.';
            showToast('Passwords do not match.', 'error');
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
                let value = editFormData[key];
                if (value === undefined || value === null || value === '') {
                    payload[key] = null;
                } else {
                    if (key === 'gender') {
                        const genderStr = String(value).trim();
                        const genderMap = {
                            'male': 'Male',
                            'female': 'Female',
                            'other': 'Other',
                            'M': 'Male',
                            'F': 'Female',
                            'O': 'Other',
                        };
                        payload[key] = genderMap[genderStr.toLowerCase()] || genderStr;
                    } else {
                        payload[key] = typeof value === 'string' ? value.trim() : value;
                    }
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
        const statusObj = employmentStatuses.value.find(s => s.id === newStatusId);
        if (!statusObj) {
            console.error('Status not found:', newStatusId);
            return;
        }

        const currentStatusId = getEmployeeStatusId(employee);
        if (currentStatusId === newStatusId) return;

        tempStatusId.value = newStatusId;
        statusChangeEmployee.value = employee;
        selectedNewStatus.value = statusObj;
        statusFeedback.value = '';
        statusChangeError.value = '';
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
            const payload = { status: selectedNewStatus.value.id };
            if (statusFeedback.value.trim()) {
                payload.feedback = statusFeedback.value.trim();
            }

            const result = await updateEmployeeStatus(statusChangeEmployee.value.id, payload);

            if (result.success) {
                statusChangeEmployee.value.status_id = selectedNewStatus.value.id;
                statusChangeEmployee.value.status = selectedNewStatus.value.name;

                const emailKind = result.data?.email_kind;
                const emailSent = result.data?.email_sent;
                let emailNote = '';
                if (emailKind === 'password_setup') {
                    emailNote = emailSent === false
                        ? ' Password-setup email could not be sent — check Email settings.'
                        : ' Password-setup email sent to the employee.';
                } else if (emailKind === 'status_changed') {
                    emailNote = emailSent === false
                        ? ' Employee could not be notified by email — check Email settings.'
                        : ' Employee notified by email.';
                }

                showToast(`Status changed to ${selectedNewStatus.value.name} successfully.${emailNote}`, 'success', 5000);
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
                    tempStatusId.value = getEmployeeStatusId(statusChangeEmployee.value);
                }
            }
        } catch (error) {
            console.error('Status change error:', error);
            statusChangeError.value = error.message || 'An error occurred';
            showToast(statusChangeError.value, 'error');
            if (statusChangeEmployee.value) {
                tempStatusId.value = getEmployeeStatusId(statusChangeEmployee.value);
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
        const link = `${window.location.origin}/onboarding`;
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
            strongMessageTimeout = setTimeout(() => { showStrongMessage.value = false; }, 2000);
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
    watch(pageSize, () => {
        currentPage.value = 1;
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
        createTouched,
        createErrors,
        markCreateTouched,
        validateCreateField,
        isCreateFormValid,
        editTouched,
        editErrors,
        markEditTouched,
        validateEditField,
        isEditFormValid,
        isValidCnic,
        getCnicError,
        showOnlyActive,
      
    };
}