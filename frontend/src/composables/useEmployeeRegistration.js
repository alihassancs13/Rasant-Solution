// composables/useEmployeeRegistration.js
import { ref, computed } from 'vue';
import { useEmployeeStore } from '../stores/employeeStore.js';
import { useToast } from '@/composables/useToast.js';
export function useEmployeeRegistration() {
    const store = useEmployeeStore();

    // --- state ---
    const currentStep = ref(1);
    const totalSteps = 4;

    const isSubmitted = ref(false);
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    const { showToast } = useToast();
    const steps = [
        { id: 1, name: 'Personal' },
        { id: 2, name: 'Emergency' },
        { id: 3, name: 'Educational' },
        { id: 4, name: 'Bank' }
    ];
    const formData = ref({
        name: '',
        cnic: '',
        present_address: '',
        permanent_address: '',
        phone_number: '',
        gender: '',
        email: '',
        department: '',
        designation: '',
        salary: '',
        joined_date: '',
        status: 'Intern',
        work_from_home: false,
        emergency_name: '',
        emergency_relation: '',
        emergency_cnic: '',
        emergency_phone: '',
        emergency_address: '',
        bank_name: '',
        branch_name: '',
        account_number: ''
    });

    const uploadedFiles = ref({});
    const fileNames = ref({
        cnic_scan: '',
        emergency_cnic_scan: '',
        matric_certificate: '',
        fsc_certificate: '',
        university_degree: '',
        other_course: ''
    });

    const currentProgressPercentage = computed(() => {
        if (isSubmitted.value) return '100%';
        const progressMapping = { 1: '10%', 2: '34%', 3: '60%', 4: '81%' };
        return progressMapping[currentStep.value];
    });

    // --- file upload ---
    const handleFileUpload = (event, fieldKey) => {
        const files = event.target.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.size > MAX_FILE_SIZE_BYTES) {
                alert(`The file "${file.name}" exceeds the 10MB upload limit.`);
                event.target.value = '';
                fileNames.value[fieldKey] = '';
                delete uploadedFiles.value[fieldKey];
                return;
            }
            fileNames.value[fieldKey] = file.name;
            uploadedFiles.value[fieldKey] = file;
        }
    };

    // --- validation and navigation ---
    const validateCurrentStep = () => {
        const currentFormElement = document.getElementById('employeeForm');
        if (!currentFormElement) return true;
        return currentFormElement.checkValidity();
    };

    const nextStep = () => {
        if (!validateCurrentStep()) {
            document.getElementById('employeeForm').reportValidity();
            return;
        }
        if (currentStep.value < totalSteps) {
            currentStep.value++;
            // Target the scrollable div inside your modal template
            const scrollContainer = document.getElementById('employeeForm')?.parentElement;
            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            submitForm();
        }
    };

    const prevStep = () => {
        if (currentStep.value > 1) {
            currentStep.value--;
            // Target the scrollable div inside your modal template
            const scrollContainer = document.getElementById('employeeForm')?.parentElement;
            if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // --- submission using store ---
    const submitForm = async (onSuccess, source = 'user_onboarding') => {
        if (isSubmitted.value) return;

        const formElement = document.getElementById('employeeForm');
        if (!formElement.checkValidity()) {
            formElement.reportValidity();
            return;
        }
        isSubmitted.value = true;
        const payload = new FormData();

        // ADD THIS - source field
        payload.append('source', source);

        const cleanCnic = (value) => (value || '').replace(/\D/g, '');

        const cleanedCnic = cleanCnic(formData.value.cnic);
        const cleanedEmergencyCnic = cleanCnic(formData.value.emergency_cnic);

        // Prepare cleaned data
        const cleanedData = {
            name: (formData.value.name || '').trim(),
            present_address: (formData.value.present_address || '').trim(),
            permanent_address: (formData.value.permanent_address || '').trim(),
            phone_number: (formData.value.phone_number || '').trim(),
            gender: formData.value.gender || 'Male',
            email: (formData.value.email || '').trim(),
            department: (formData.value.department || '').trim() || 'Unassigned',
            designation: (formData.value.designation || '').trim() || 'Employee',
            salary: parseFloat(formData.value.salary) || 0,
            joined_date: formData.value.joined_date || new Date().toISOString().split('T')[0],
            status: formData.value.status || 'Intern',
            is_active: true,
            work_from_home: !!formData.value.work_from_home,
            emergency_name: (formData.value.emergency_name || '').trim(),
            emergency_relation: (formData.value.emergency_relation || '').trim(),
            emergency_phone: (formData.value.emergency_phone || '').trim(),
            emergency_address: (formData.value.emergency_address || '').trim(),
            bank_name: (formData.value.bank_name || '').trim(),
            branch_name: (formData.value.branch_name || '').trim(),
            account_number: (formData.value.account_number || '').trim(),
        };

        if (cleanedCnic) cleanedData.cnic = cleanedCnic;
        if (cleanedEmergencyCnic) cleanedData.emergency_cnic = cleanedEmergencyCnic;

        if (!cleanedData.name || !cleanedData.email || !cleanedData.phone_number) {
            showToast('Name, email, and phone number are required.', 'error');
            isSubmitted.value = false;
            return { success: false };
        }

        Object.keys(cleanedData).forEach(key => {
            if (cleanedData[key] !== undefined && cleanedData[key] !== null) {
                payload.append(key, cleanedData[key]);
            }
        });

        Object.keys(uploadedFiles.value).forEach(key => {
            if (uploadedFiles.value[key]) {
                payload.append(key, uploadedFiles.value[key]);
            }
        });

        try {
            const result = await store.addEmployee(payload);

            if (result.success) {
                const emailNote = result.data?.email_sent === false
                    ? ' (create-password email could not be sent — check Email settings)'
                    : ' Create-password link emailed to the employee.';
                showToast(`Employee added successfully.${emailNote}`, 'success', 5000);
                isSubmitted.value = false;
                resetForm();
                if (onSuccess) onSuccess(result.data);
                return { success: true, data: result.data };
            } else {
                let errorMsg = 'Submission failed';
                if (result.errors && typeof result.errors === 'object') {
                    const parts = Object.entries(result.errors).map(([field, msgs]) => {
                        const text = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
                        return `${field}: ${text}`;
                    });
                    if (parts.length) errorMsg = parts.join(' | ');
                } else if (result.error) {
                    errorMsg = result.error;
                }
                showToast(errorMsg, 'error', 6000);
                isSubmitted.value = false;
                return { success: false, error: errorMsg };
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            showToast('An unexpected error occurred. Please try again.', 'error', 5000);
            isSubmitted.value = false;
            return { success: false, error: error.message };
        }
    };
    const resetForm = () => {
        formData.value = {
            name: '',
            cnic: '',
            present_address: '',
            permanent_address: '',
            phone_number: '',
            gender: '',
            email: '',
            department: '',
            designation: '',
            salary: '',
            joined_date: '',
            status: 'Intern',
            work_from_home: false,
            emergency_name: '',
            emergency_relation: '',
            emergency_cnic: '',
            emergency_phone: '',
            emergency_address: '',
            bank_name: '',
            branch_name: '',
            account_number: ''
        };

        uploadedFiles.value = {};
        fileNames.value = {
            cnic_scan: '',
            emergency_cnic_scan: '',
            matric_certificate: '',
            fsc_certificate: '',
            university_degree: '',
            other_course: ''
        };
        currentStep.value = 1;
    };

    return {
        currentStep,
        totalSteps,
        steps,
        formData,
        fileNames,
        currentProgressPercentage,
        handleFileUpload,
        nextStep,
        prevStep,
        submitForm,
        isLoading: computed(() => store.isLoading),
    };
}