import { ref, computed } from 'vue';

export function useEmployeeRegistration() {
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
        name: '',
        cnic: '',
        present_address: '',
        permanent_address: '',
        phone_number: '',
        gender: '',
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
            // Final step – but we will handle submission via custom method in component
            // to pass the callback, so we leave this as a fallback (no callback)
            submitForm();
        }
    };

    const prevStep = () => {
        if (currentStep.value > 1) {
            currentStep.value--;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Accept an optional onSuccess callback
    const submitForm = (onSuccess) => {
        isSubmitted.value = true;
        const payload = new FormData();

        Object.keys(formData.value).forEach(key => {
            payload.append(key, formData.value[key]);
        });
        Object.keys(uploadedFiles.value).forEach(key => {
            payload.append(key, uploadedFiles.value[key]);
        });

        fetch('http://127.0.0.1:8000/api/add-employee/', {
            method: 'POST',
            body: payload
        })
            .then(res => {
                if (!res.ok) throw new Error('API transmission error occurred.');
                return res.json();
            })
            .then(data => {
                alert("Employee registration data processed successfully!");
                console.log(data);
                if (onSuccess) onSuccess();
            })
            .catch(err => {
                alert("Submission failed. Ensure backend API server is online.");
                console.error(err);
                isSubmitted.value = false;
            });
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
    };
}