import { ref } from 'vue';
import { employeeDashboardApi } from '../../services/employee_dashboardApi.js'; // Verify relative path to services folder

export function useEmployeeDashboard() {
    const activeTab = ref('list');

    const initialFormState = {
        fullName: '',
        email: '',
        phone: '',
        department: '',
        designation: '',
        employmentStatus: 'Intern',
        monthlySalary: '',
        joinDate: ''
    };

    const formData = ref({ ...initialFormState });
    const errors = ref({});
    const isParsingCv = ref(false);

    const statusOptions = ['Intern', 'Probation', 'Contract', 'Permanent'];

    const validateForm = () => {
        errors.value = {};
        if (!formData.value.fullName.trim()) errors.value.fullName = 'Full name is required';
        if (!formData.value.email.trim()) {
            errors.value.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.value.email)) {
            errors.value.email = 'Please enter a valid email address';
        }
        if (!formData.value.phone.trim()) errors.value.phone = 'Phone number is required';
        if (!formData.value.department.trim()) errors.value.department = 'Department is required';
        if (!formData.value.designation.trim()) errors.value.designation = 'Designation is required';
        if (!statusOptions.includes(formData.value.employmentStatus)) {
            errors.value.employmentStatus = 'Invalid employment status selected';
        }
        if (!formData.value.monthlySalary || formData.value.monthlySalary <= 0) {
            errors.value.monthlySalary = 'Please enter a valid monthly salary';
        }
        if (!formData.value.joinDate) errors.value.joinDate = 'Join date is required';

        return Object.keys(errors.value).length === 0;
    };

    const clearForm = () => {
        formData.value = { ...initialFormState };
        errors.value = {};
    };

    const handleAddEmployee = () => {
        if (validateForm()) {
            alert('Employee validation passed! Ready to submit to database.');
        }
    };

    // 🔥 REPLACED MOCK WITH DYNAMIC API INTEGRATION
    const handleCvUpload = async (event) => {
        const file = event.target.files?.[0] || event.dataTransfer?.files?.[0];
        if (!file) return;

        isParsingCv.value = true;
        errors.value = {};

        try {
            // Hit our centralized API service layer
            const parsedData = await employeeDashboardApi.parseCvDocument(file);

            // Dynamically bind returned text segments directly to reactive views
            formData.value = {
                fullName: parsedData.full_name || '',
                email: parsedData.email || '',
                phone: parsedData.phone || '',
                department: parsedData.department || 'Engineering',
                designation: parsedData.designation || 'Software Engineer',
                employmentStatus: statusOptions.includes(parsedData.employment_status) ? parsedData.employment_status : 'Intern',
                monthlySalary: parsedData.monthly_salary || '',
                joinDate: parsedData.join_date || new Date().toISOString().split('T')[0]
            };
        } catch (err) {
            console.error('CV Parsing Error:', err);
            alert('Unable to extract data from this file automatically. Please fill fields manually.');
        } finally {
            isParsingCv.value = false;
        }
    };

    return {
        activeTab,
        formData,
        errors,
        isParsingCv,
        statusOptions,
        clearForm,
        handleAddEmployee,
        handleCvUpload
    };
}