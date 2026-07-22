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
    const submitForm = async (onSuccess) => {
        if (isSubmitted.value) return; // Prevent double submission

        // Validate all steps before submitting
        const formElement = document.getElementById('employeeForm');
        if (!formElement.checkValidity()) {
            formElement.reportValidity();
            // Find which step has errors and navigate to it
            const invalidFields = formElement.querySelectorAll(':invalid');
            if (invalidFields.length > 0) {
                // Try to find which step contains the invalid field
                // You can implement step mapping here
            }
            return;
        }
        isSubmitted.value = true;
        const payload = new FormData();
        const cleanCnic = (value) => (value || '').replace(/\D/g, '');
        const cleanedData = {
            name: (formData.value.name || '').trim(),
            cnic: cleanCnic(formData.value.cnic),
            present_address: (formData.value.present_address || '').trim(),
            permanent_address: (formData.value.permanent_address || '').trim(),
            phone_number: (formData.value.phone_number || '').trim(),
            gender: formData.value.gender || 'Male',
            email: (formData.value.email || '').trim(),
            department: (formData.value.department || '').trim(),
            designation: (formData.value.designation || '').trim() || 'Employee',
            salary: parseFloat(formData.value.salary) || 0,
            joined_date: formData.value.joined_date || new Date().toISOString().split('T')[0],
            status: formData.value.status || 'Intern',
            is_active: true,
            emergency_name: (formData.value.emergency_name || '').trim(),
            emergency_relation: (formData.value.emergency_relation || '').trim(),
            emergency_cnic: cleanCnic(formData.value.emergency_cnic),
            emergency_phone: (formData.value.emergency_phone || '').trim(),
            emergency_address: (formData.value.emergency_address || '').trim(),
            bank_name: (formData.value.bank_name || '').trim(),
            branch_name: (formData.value.branch_name || '').trim(),
            account_number: (formData.value.account_number || '').trim(),
        };
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
                showToast(
                    `Employee ${result.data?.name || ''} added successfully! `,
                    'success',
                    5000
                );
                console.log('Employee added:', result.data);
                isSubmitted.value = false;
                resetForm();
                if (onSuccess) onSuccess(result.data);
                return result;
            } else {
                let errorMsg = 'Submission failed:\n';
                if (result.error) {
                    errorMsg += result.error;
                } else if (result.errors) {
                    if (typeof result.errors === 'object') {
                        for (const [field, msgs] of Object.entries(result.errors)) {
                            if (Array.isArray(msgs)) {
                                errorMsg += `\n${field}: ${msgs.join(', ')}`;
                            } else {
                                errorMsg += `\n${field}: ${msgs}`;
                            }
                        }
                    } else {
                        errorMsg += result.errors;
                    }
                } else {
                    errorMsg += 'Unknown error occurred';
                }

                showToast(errorMsg, 'error', 7000);
                console.error('Submission error:', result.error);
                return result;
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            showToast('An unexpected error occurred. Please try again.', 'error', 5000);
            return { success: false, error: error.message };
        } finally {
            isSubmitted.value = false;
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