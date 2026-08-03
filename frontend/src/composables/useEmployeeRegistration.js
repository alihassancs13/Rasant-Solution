// composables/useEmployeeRegistration.js
import { ref, computed } from 'vue';
import { useEmployeeStore } from '../stores/employeeStore.js';
import { useToast } from '@/composables/useToast.js';
import { useValidation } from '@/composables/useValidation.js';
import { onboardingAPI } from '@/services/onboardingAPI.js';
export function useEmployeeRegistration(isDirectAccess) {
    const store = useEmployeeStore();
    const { showToast } = useToast();
    const {
        getUsernameError,
        getEmailError,
        getAmountError,
        getPhoneError,
        getAddressLengthError,
        getAccountNumberError,
        getFileTypeError,
        blockNonDigitKeydown,
        blockNonDigitPaste,
        getNumericRangeError,
        isValidLength,
        getLengthError,
        isValidEmail,
        getCredentialLabelError,
        getLinkError,
        getPasswordStrengthError,
        getPasswordStrengthLabel,
        getGraceMinutesError,
        getAllowedPaidLimitError,
        getUnpaidAbsentsError,
        getOvertimeRateError,
        getFreeLatesError,
        getOfficeRadiusError,
        LENGTH_LIMITS,
    } = useValidation();

    const isPublic = () => !!isDirectAccess?.value;
    const currentStep = ref(1);
    const totalSteps = 4;

    const isSubmitted = ref(false);
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];
    const LOCKED_FIELDS = ['first_name', 'last_name', 'email', 'phone_number', 'designation', 'department', 'salary'];
    const onboardingToken = ref(null);
    const isValidatingToken = ref(false);
    const tokenValid = ref(true);
    const tokenError = ref('');
    const alreadySubmitted = ref(false);
    const lockedFields = ref({});

    const isFieldLocked = (field) => !!lockedFields.value[field];

    const FILE_FIELD_LABELS = {
        cnic_scan: 'CNIC scan copy',
        emergency_cnic_scan: 'Emergency contact CNIC scan copy',
        matric_certificate: 'Matric certificate / marksheet',
        fsc_certificate: 'FSC / Intermediate certificate or marksheet',
        university_degree: 'University degree / graduation certificate',
        other_course: 'Other course / certificate',
    };
    const getFileFieldLabel = (fileKey) =>
        FILE_FIELD_LABELS[fileKey] || fileKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const steps = [
        { id: 1, name: 'Personal' },
        { id: 2, name: 'Emergency' },
        { id: 3, name: 'Educational' },
        { id: 4, name: 'Bank' }
    ];

    const formData = ref({
        name: '', cnic: '', present_address: '', permanent_address: '',
        phone_number: '', gender: '', email: '', department: '', designation: '',
        salary: '', joined_date: '', work_from_home: false,
        emergency_name: '', emergency_relation: '', emergency_cnic: '',
        emergency_phone: '', emergency_address: '',
        bank_name: '', branch_name: '', account_number: ''
    });

    const uploadedFiles = ref({});
    const fileNames = ref({
        cnic_scan: '', emergency_cnic_scan: '', matric_certificate: '',
        fsc_certificate: '', university_degree: '', other_course: ''
    });

    // --- Validation State ---
    const touched = ref({
        first_name: false,
        last_name: false,  email: false, phone_number: false, department: false,
        designation: false, salary: false, present_address: false, gender: false,
        joined_date: false, emergency_name: false, emergency_relation: false,
        emergency_cnic: false, emergency_phone: false, emergency_address: false,
        bank_name: false, branch_name: false, account_number: false
    });

    const errors = ref({
        first_name: null,
        last_name: null, email: null, phone_number: null, department: null,
        designation: null, salary: null, present_address: null, gender: null,
        joined_date: null, emergency_name: null, emergency_relation: null,
        emergency_cnic: null, emergency_phone: null, emergency_address: null,
        bank_name: null, branch_name: null, account_number: null
    });

    const fileErrors = ref({
        cnic_scan: '', emergency_cnic_scan: '', matric_certificate: '',
        fsc_certificate: '', university_degree: '', other_course: ''
    });

    const validationError = ref('');

    const ADMIN_REQUIRED_FIELDS = ['first_name', 'last_name', 'email', 'phone_number','gender','department','designation','salary','joined_date'];
    const isFieldRequired = (field) => isPublic() || ADMIN_REQUIRED_FIELDS.includes(field);

    const emergencyCnicError = computed(() => {
        const value = formData.value.emergency_cnic;
        if (!value) return (isPublic() && touched.value.emergency_cnic) ? 'CNIC is required.' : '';
        return isValidCnic(value) ? '' : 'CNIC must be exactly 13 digits (e.g., 12345-1234567-8)';
    });

    async function validateOnboardingToken(token) {
        if (!token) return;
        onboardingToken.value = token;
        isValidatingToken.value = true;
        try {
            const { data } = await onboardingAPI.validate(token);
            if (!data.valid) {
                tokenValid.value = false;
                alreadySubmitted.value = !!data.already_submitted;
                tokenError.value = data.error || (alreadySubmitted.value
                    ? 'This onboarding form has already been submitted.'
                    : 'This onboarding link is invalid or expired.');
                return;
            }
            tokenValid.value = true;
            formData.value.first_name = data.first_name || '';
            formData.value.last_name = data.last_name || '';
            formData.value.email = data.email || '';
            formData.value.phone_number = data.phone_number || '';
            formData.value.designation = data.designation || '';
            formData.value.department = data.department || '';
            formData.value.salary = data.salary || '';

            LOCKED_FIELDS.forEach((f) => { lockedFields.value[f] = true; });
        } catch (err) {
            tokenValid.value = false;
            alreadySubmitted.value = !!err.response?.data?.already_submitted;
            tokenError.value = err.response?.data?.error || 'This onboarding link is invalid or expired.';
        } finally {
            isValidatingToken.value = false;
        }
    }

    const currentProgressPercentage = computed(() => {
        if (isSubmitted.value) return '100%';
        const progressMapping = { 1: '10%', 2: '34%', 3: '60%', 4: '81%' };
        return progressMapping[currentStep.value] || '0%';
    });

    const isValidCnic = (cnic) => !!cnic && /^\d{13}$/.test(cnic.replace(/[-\s]/g, ''));

    const getCnicError = (cnic) => {
        if (!cnic) return 'CNIC is required.';
        return /^\d{13}$/.test(cnic.replace(/[-\s]/g, '')) ? null : 'CNIC must be exactly 13 digits (e.g., 12345-1234567-8)';
    };

    const validateFile = (file, fieldName) => {
        if (!file) return `${fieldName} is required.`;
        const error = getFileTypeError(file, { fieldName });
        if (error) return error;
        if (file.size > MAX_FILE_SIZE_BYTES) return `File size exceeds 10MB limit for ${fieldName}.`;
        return null;
    };

    const validateField = (field) => {
        const value = formData.value[field];

        if (!isFieldRequired(field) && !String(value ?? '').trim()) {
            errors.value[field] = null;
            return null;
        }

        let error = null;
        switch (field) {
            case 'first_name': error = getUsernameError(value, 32, 'First Name'); break;
            case 'last_name': error = getUsernameError(value, 32, 'Last Name'); break;
            case 'email': error = (!value || !value.trim()) ? 'Email is required.' : getEmailError(value); break;
            case 'phone_number': error = getPhoneError(value); break;
            case 'department': error = getUsernameError(value, 32, 'Department'); break;
            case 'designation': error = getUsernameError(value, 32, 'Designation'); break;
            case 'salary': error = getAmountError(value, 10, 'Salary'); break;
            case 'present_address': error = getAddressLengthError(value, 250, 'Present address'); break;
            case 'gender': error = !value ? 'Gender is required.' : null; break;
            case 'joined_date': error = !value ? 'Joined date is required.' : null; break;
            case 'emergency_name': error = getUsernameError(value, 32, 'Emergency contact name'); break;
            case 'emergency_relation': error = getUsernameError(value, 32, 'Relation'); break;
            case 'emergency_cnic': error = getCnicError(value); break;
            case 'emergency_phone': error = getPhoneError(value, 15, 'Emergency phone number'); break;
            case 'emergency_address': error = getAddressLengthError(value, 250, 'Emergency contact address'); break;
            case 'bank_name': error = getUsernameError(value, 32, 'Bank name'); break;
            case 'branch_name': error = value ? getUsernameError(value, 32, 'Branch name') : null; break;
            case 'account_number': error = getAccountNumberError(value, 24, 'Account no / IBAN number'); break;
        }

        errors.value[field] = error;
        return error;
    };

    const markTouched = (field) => {
        touched.value[field] = true;
        validateField(field);
    };

    const clearFieldError = (field) => {
        errors.value[field] = null;
        touched.value[field] = true;
    };

    const validateStepFields = (stepNumber) => {
        let isValid = true;
        getFieldsForStep(stepNumber).forEach(field => {
            touched.value[field] = true;
            if (validateField(field)) isValid = false;
        });
        return isValid;
    };

    const getFieldsForStep = (stepNumber) => {
        if (!isPublic()) {
            return stepNumber === 1 ? [...ADMIN_REQUIRED_FIELDS] : [];
        }
        switch (stepNumber) {
            case 1: return ['first_name', 'last_name','email', 'phone_number', 'department', 'designation', 'salary', 'present_address', 'gender', 'joined_date'];
            case 2: return ['emergency_name', 'emergency_relation', 'emergency_cnic', 'emergency_phone', 'emergency_address'];
            case 4: return ['bank_name', 'branch_name', 'account_number'];
            default: return [];
        }
    };

    const getRequiredFileFields = (stepNumber) => {
        if (!isPublic()) return [];
        switch (stepNumber) {
            case 1: return ['cnic_scan'];
            case 2: return ['emergency_cnic_scan'];
            case 3: return ['matric_certificate', 'fsc_certificate', 'university_degree'];
            default: return [];
        }
    };

    const validateFilesForStep = (stepNumber) => {
        let isValid = true;
        getRequiredFileFields(stepNumber).forEach(fileKey => {
            const fieldName = getFileFieldLabel(fileKey);
            const file = uploadedFiles.value[fileKey];
            const error = file ? validateFile(file, fieldName) : `${fieldName} is required.`;
            fileErrors.value[fileKey] = error || '';
            if (error) isValid = false;
        });
        return isValid;
    };

    // --- File Upload ---
    const handleFileUpload = (event, fieldKey) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const error = validateFile(file, getFileFieldLabel(fieldKey));
        if (error) {
            fileErrors.value[fieldKey] = error;
            showToast(error, 'error');
            event.target.value = '';
            return;
        }

        fileErrors.value[fieldKey] = '';
        fileNames.value[fieldKey] = file.name;
        uploadedFiles.value[fieldKey] = file;
    };

    const removeFile = (fieldKey) => {
        fileNames.value[fieldKey] = '';
        uploadedFiles.value[fieldKey] = null;
        fileErrors.value[fieldKey] = '';
        document.querySelectorAll(`input[data-field="${fieldKey}"]`).forEach(input => { input.value = ''; });
    };

    // --- CNIC Formatting ---
    const formatCnicValue = (raw) => {
        const digits = raw.replace(/[^0-9]/g, '').slice(0, 13);
        if (!digits) return '';
        let out = digits.slice(0, 5);
        if (digits.length > 5) out += '-' + digits.slice(5, 12);
        if (digits.length > 12) out += '-' + digits.slice(12, 13);
        return out;
    };

    const formatCnic = (event) => {
        const formatted = formatCnicValue(event.target.value);
        event.target.value = formatted;
        formData.value.cnic = formatted;
        validationError.value = '';
        validateField('cnic');
    };

    const formatEmergencyCnic = (event) => {
        const formatted = formatCnicValue(event.target.value);
        event.target.value = formatted;
        formData.value.emergency_cnic = formatted;
        touched.value.emergency_cnic = true;
        validateField('emergency_cnic');
    };

    const makeDigitHandlers = (field) => ({
        keydown: (e) => blockNonDigitKeydown(e, { allowDecimal: false, currentValue: formData.value[field] }),
        paste: (e) => blockNonDigitPaste(e, {}),
        input: (event) => {
            const digitsOnly = event.target.value.replace(/\D/g, '');
            event.target.value = digitsOnly;
            formData.value[field] = digitsOnly;
            touched.value[field] = true;
            validateField(field);
        },
    });


    const phoneHandlers = makeDigitHandlers('phone_number');
    const emergencyPhoneHandlers = makeDigitHandlers('emergency_phone');

    const handleSalaryKeydown = (e) => blockNonDigitKeydown(e, { allowDecimal: true, currentValue: formData.value.salary });
    const handleSalaryPaste = (e) => blockNonDigitPaste(e, { allowDecimal: true });
    const handleSalaryInput = (event) => {
        let value = event.target.value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
        event.target.value = value;
        formData.value.salary = value;
        touched.value.salary = true;
        validateField('salary');
    };

    const GENERIC_VALIDATION_MESSAGE = 'Please fill all highlighted fields.';

    const nextStep = (skipValidation = false) => {
        if (!skipValidation) {
            const stepFieldsValid = validateStepFields(currentStep.value);
            const stepFilesValid = validateFilesForStep(currentStep.value);

            let cnicValid = true;
            if (currentStep.value === 1) {
                if (!formData.value.cnic) {
                    // CNIC required sirf public side pr
                    cnicValid = !isPublic();
                    validationError.value = isPublic() ? 'Please enter CNIC number' : '';
                } else if (!isValidCnic(formData.value.cnic)) {
                    validationError.value = 'CNIC must be exactly 13 digits. Please check and try again.';
                    cnicValid = false;
                } else {
                    validationError.value = '';
                }
            }

            if (!stepFieldsValid || !stepFilesValid || !cnicValid) {
                showToast(GENERIC_VALIDATION_MESSAGE, 'error');
                return;
            }
        }

        if (currentStep.value < totalSteps) {
            currentStep.value++;
            scrollToTop();
        }
    };

    const prevStep = () => {
        if (currentStep.value > 1) {
            currentStep.value--;
            scrollToTop();
            validationError.value = '';
        }
    };

    const scrollToTop = () => {
        document.querySelector('.flex-1.overflow-y-auto')?.scrollTo?.(0, 0);
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' });
    };

    const submitForm = async (onSuccess, source = 'user_onboarding', skipValidation = false) => {
        if (isSubmitted.value) return { success: false };

        if (!skipValidation) {
            let allValid = true;
            for (let step = 1; step <= totalSteps; step++) {
                const fieldsValid = validateStepFields(step);
                const filesValid = validateFilesForStep(step);
                if (!fieldsValid || !filesValid) { allValid = false; break; }
            }

            const cnic = formData.value.cnic;
            if ((cnic && !isValidCnic(cnic)) || (isPublic() && !cnic)) {
                validationError.value = 'CNIC must be exactly 13 digits.';
                showToast(GENERIC_VALIDATION_MESSAGE, 'error');
                return { success: false };
            }

            if (!allValid) {
                showToast(GENERIC_VALIDATION_MESSAGE, 'error');
                return { success: false };
            }
        }

        isSubmitted.value = true;
        const payload = new FormData();
        const cleanCnic = (value) => (value || '').replace(/\D/g, '');

        if (onboardingToken.value && tokenValid.value) {
            const editableData = {
                cnic: cleanCnic(formData.value.cnic),
                present_address: (formData.value.present_address || '').trim(),
                permanent_address: (formData.value.permanent_address || '').trim(),
                gender: formData.value.gender || '',
                work_from_home: !!formData.value.work_from_home,
                emergency_name: (formData.value.emergency_name || '').trim(),
                emergency_relation: (formData.value.emergency_relation || '').trim(),
                emergency_cnic: cleanCnic(formData.value.emergency_cnic),
                emergency_phone: (formData.value.emergency_phone || '').trim(),
                emergency_address: (formData.value.emergency_address || '').trim(),
                bank_name: (formData.value.bank_name || '').trim(),
                branch_name: (formData.value.branch_name || '').trim(),
                account_number: (formData.value.account_number || '').trim(),
            };

            Object.entries(editableData).forEach(([key, val]) => {
                if (val !== undefined && val !== null) payload.append(key, val);
            });
            Object.entries(uploadedFiles.value).forEach(([key, file]) => {
                if (file) payload.append(key, file);
            });

            try {
                const { data } = await onboardingAPI.submit(onboardingToken.value, payload);
                showToast(data.message || 'Onboarding submitted successfully.', 'success', 5000);
                onSuccess?.(data);
                return { success: true, data };
            } catch (err) {
                const errData = err.response?.data;
                showToast(errData?.error || 'Submission failed.', 'error', 6000);
                isSubmitted.value = false;
                return { success: false, error: errData?.error, errors: errData?.errors };
            }
        }

        // ---- Existing bare /onboarding (no token) flow — unchanged ----
        payload.append('source', source);

        const cleanedEmergencyCnic = cleanCnic(formData.value.emergency_cnic);

        const cleanedData = {
            first_name: (formData.value.first_name || '').trim(),
            last_name: (formData.value.last_name || '').trim(),
            present_address: (formData.value.present_address || '').trim(),
            permanent_address: (formData.value.permanent_address || '').trim(),
            phone_number: (formData.value.phone_number || '').trim(),
            gender: formData.value.gender || 'Male',
            email: (formData.value.email || '').trim(),
            department: (formData.value.department || '').trim() || 'Unassigned',
            designation: (formData.value.designation || '').trim() || 'Employee',
            salary: parseFloat(formData.value.salary) || 0,
            joined_date: formData.value.joined_date || new Date().toISOString().split('T')[0],
            status: 'Intern',
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

        const cleanedCnic = cleanCnic(formData.value.cnic);
        if (cleanedCnic) cleanedData.cnic = cleanedCnic;
        if (cleanedEmergencyCnic) cleanedData.emergency_cnic = cleanedEmergencyCnic;

        if (!cleanedData.first_name || !cleanedData.last_name || !cleanedData.email || !cleanedData.phone_number) {
            showToast('Name, email, and phone number are required.', 'error');
            isSubmitted.value = false;
            return { success: false };
        }

        Object.entries(cleanedData).forEach(([key, val]) => {
            if (val !== undefined && val !== null) payload.append(key, val);
        });
        Object.entries(uploadedFiles.value).forEach(([key, file]) => {
            if (file) payload.append(key, file);
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
                onSuccess?.(result.data);
                return { success: true, data: result.data };
            }

            let errorMsg = 'Submission failed';
            if (result.errors && typeof result.errors === 'object') {
                Object.entries(result.errors).forEach(([field, msgs]) => {
                    const message = Array.isArray(msgs) ? msgs[0] : String(msgs);
                    if (Object.prototype.hasOwnProperty.call(errors.value, field)) {
                        errors.value[field] = message.charAt(0).toUpperCase() + message.slice(1);
                        touched.value[field] = true;
                    }
                });

                const failingFields = Object.keys(result.errors);
                for (let step = 1; step <= totalSteps; step++) {
                    if (getFieldsForStep(step).some(f => failingFields.includes(f))) {
                        currentStep.value = step;
                        break;
                    }
                }

                const firstField = failingFields[0];
                const firstMsg = Array.isArray(result.errors[firstField]) ? result.errors[firstField][0] : result.errors[firstField];
                errorMsg = firstMsg.charAt(0).toUpperCase() + firstMsg.slice(1);
            } else if (result.error) {
                errorMsg = result.error;
            }
            showToast(errorMsg, 'error', 6000);
            console.error('Submission error:', result.error);
            isSubmitted.value = false;
            return { success: false, error: errorMsg };
        } catch (error) {
            console.error('Unexpected error:', error);
            showToast('An unexpected error occurred. Please try again.', 'error', 5000);
            isSubmitted.value = false;
            return { success: false, error: error.message };
        }
    };

    const resetForm = () => {
        formData.value = {
            first_name: '',
            last_name: '', cnic: '', present_address: '', permanent_address: '',
            phone_number: '', gender: '', email: '', department: '', designation: '',
            salary: '', joined_date: '', work_from_home: false,
            emergency_name: '', emergency_relation: '', emergency_cnic: '',
            emergency_phone: '', emergency_address: '',
            bank_name: '', branch_name: '', account_number: ''
        };
        uploadedFiles.value = {};
        fileNames.value = {
            cnic_scan: '', emergency_cnic_scan: '', matric_certificate: '',
            fsc_certificate: '', university_degree: '', other_course: ''
        };
        Object.keys(touched.value).forEach(key => { touched.value[key] = false; });
        Object.keys(errors.value).forEach(key => { errors.value[key] = null; });
        Object.keys(fileErrors.value).forEach(key => { fileErrors.value[key] = ''; });
        validationError.value = '';
        currentStep.value = 1;
        isSubmitted.value = false;
    };

    return {
        currentStep, totalSteps, steps, formData, fileNames, uploadedFiles,
        currentProgressPercentage, isSubmitted,
        touched, errors, fileErrors, validationError, emergencyCnicError,
        getUsernameError, getEmailError, getAmountError, getPhoneError,
        getAddressLengthError, getAccountNumberError, getFileTypeError,
        getNumericRangeError, getPasswordStrengthError, getPasswordStrengthLabel,
        getGraceMinutesError, getAllowedPaidLimitError, getUnpaidAbsentsError,
        getOvertimeRateError, getFreeLatesError, getOfficeRadiusError, LENGTH_LIMITS,

        validateField, markTouched, clearFieldError, validateStepFields,
        validateFilesForStep, isValidCnic, getCnicError, validateFile,
        isFieldRequired,
        handleFileUpload, removeFile,
        formatCnic, formatEmergencyCnic,
        handlePhoneKeydown: phoneHandlers.keydown,
        handlePhonePaste: phoneHandlers.paste,
        handlePhoneInput: phoneHandlers.input,
        handleEmergencyPhoneKeydown: emergencyPhoneHandlers.keydown,
        handleEmergencyPhonePaste: emergencyPhoneHandlers.paste,
        handleEmergencyPhoneInput: emergencyPhoneHandlers.input,
        handleSalaryKeydown, handleSalaryPaste, handleSalaryInput,
        getFileFieldLabel,
        nextStep, prevStep,
        submitForm, resetForm,
        token: onboardingToken,
        isLoading: computed(() => store.isLoading),
        MAX_FILE_SIZE_BYTES, ALLOWED_FILE_EXTENSIONS, onboardingToken, isValidatingToken, tokenValid, tokenError,
        isFieldLocked, validateOnboardingToken,
        alreadySubmitted,
    };
}