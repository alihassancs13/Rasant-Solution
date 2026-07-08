// composables/useEmployeeRegistration.js
import { ref, computed } from 'vue';
import { useEmployeeStore } from '../stores/employeeStore.js';

export function useEmployeeRegistration() {
    const store = useEmployeeStore();

    // --- state ---
    const currentStep = ref(1);
    const totalSteps = 4;
    const isSubmitted = ref(false);
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    const steps = [
        { id: 1, name: 'Personal' },
        { id: 2, name: 'Emergency' },
        { id: 3, name: 'Educational' },
        { id: 4, name: 'Bank' }
    ];
    const formData = ref({
        // Personal
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

        // Emergency
        emergency_name: '',
        emergency_relation: '',
        emergency_cnic: '',
        emergency_phone: '',
        emergency_address: '',

        // Bank
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            submitForm(); // fallback
        }
    };

    const prevStep = () => {
        if (currentStep.value > 1) {
            currentStep.value--;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // --- submission using store ---
    const submitForm = async (onSuccess) => {
        isSubmitted.value = true;
        const payload = new FormData();

        // Helper: remove all non‑digits from CNIC
        const cleanCnic = (value) => (value || '').replace(/\D/g, '');

        // Prepare cleaned data with all fields and defaults
        const cleanedData = {
            // Personal
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

            // Emergency
            emergency_name: (formData.value.emergency_name || '').trim(),
            emergency_relation: (formData.value.emergency_relation || '').trim(),
            emergency_cnic: cleanCnic(formData.value.emergency_cnic),
            emergency_phone: (formData.value.emergency_phone || '').trim(),
            emergency_address: (formData.value.emergency_address || '').trim(),

            // Bank
            bank_name: (formData.value.bank_name || '').trim(),
            branch_name: (formData.value.branch_name || '').trim(),
            account_number: (formData.value.account_number || '').trim(),
        };
        Object.keys(cleanedData).forEach(key => {
            payload.append(key, cleanedData[key]);
        });
        Object.keys(uploadedFiles.value).forEach(key => {
            payload.append(key, uploadedFiles.value[key]);
        });

        const result = await store.addEmployee(payload);

        if (result.success) {
            alert('Employee registration data processed successfully!');
            console.log(result.data);
            isSubmitted.value = false;
            if (onSuccess) onSuccess(result.data);
        } else {
            // Show field‑specific errors
            let errorMsg = 'Submission failed:\n';
            if (result.errors && typeof result.errors === 'object') {
                for (const [field, msgs] of Object.entries(result.errors)) {
                    errorMsg += `\n${field}: ${msgs.join(', ')}`;
                }
            } else {
                errorMsg += result.error || 'Unknown error';
            }
            alert(errorMsg);
            console.error(result.error);
            isSubmitted.value = false;
        }
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