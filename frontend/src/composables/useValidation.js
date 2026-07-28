// composables/useValidation.js

const LENGTH_LIMITS = {
    emailOrUsername: { max: 50 },
    password: { min: 8, max: 32 },
    credentialLabel: { max: 50 },
    username: { max: 32 },
    amount: { maxDigits: 7 },
    phone: { maxDigits: 15 },
    address: { max: 250 },
    payroll: {
        graceMinutesMax: 480,
        paidLeavesMax: 31,
        unpaidAbsentsMax: 31,
        overtimeRateMax: 1000,
        freeLatesMax: 31,
        officeRadiusMin: 10,
        officeRadiusMax: 5000,
    },
};

const ALLOWED_SCAN_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg'];
const ALLOWED_SCAN_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

// NEW — letters + spaces only (used for Name, Designation, Department, etc.)
const ALPHA_ONLY_REGEX = /^[A-Za-z\s]+$/;

export function useValidation() {
    const isValidLength = (value, max) => (value?.trim() || '').length <= max;

    const getLengthError = (value, fieldName, max) =>
        (value?.trim() || '').length > max ? `${fieldName} must not exceed ${max} characters.` : null;

    const requiredLengthError = (value, fieldName, max) => {
        const trimmed = (value || '').trim();
        if (!trimmed) return `${fieldName} is required.`;
        if (trimmed.length > max) return `${fieldName} must not exceed ${max} characters.`;
        return null;
    };

    const getEmailError = (value, max = LENGTH_LIMITS.emailOrUsername.max) => {
        const email = (value || '').trim();
        if (!email) return null;
        if (email.length > max) return `Email must not exceed ${max} characters.`;
        if (email.includes(' ')) return 'Email must not contain spaces.';

        const atCount = (email.match(/@/g) || []).length;
        if (atCount === 0) return 'Email must contain an @ symbol.';
        if (atCount > 1) return 'Email must not contain multiple @ symbols.';

        const atIndex = email.indexOf('@');
        const localPart = email.slice(0, atIndex);
        const domainPart = email.slice(atIndex + 1);

        if (!localPart) return 'Email is missing the part before @.';
        if (!domainPart) return 'Email is missing the domain part.';
        if (localPart.startsWith('.') || localPart.endsWith('.')) return 'Email must not start or end with a period.';
        if (localPart.includes('..')) return 'Email must not contain consecutive periods.';
        if (!/^[A-Za-z0-9._%+-]+$/.test(localPart)) return 'Email contains invalid characters before @.';
        if (!domainPart.includes('.')) return 'Email domain must contain a period, e.g. gmail.com.';
        if (domainPart.startsWith('.') || domainPart.endsWith('.')) return 'Email domain must not start or end with a period.';
        if (domainPart.includes('..')) return 'Email domain must not contain consecutive periods.';

        const domainSegments = domainPart.split('.');
        const validSegment = /^[A-Za-z0-9-]+$/;
        for (const segment of domainSegments) {
            if (!segment || !validSegment.test(segment) || segment.startsWith('-') || segment.endsWith('-')) {
                return 'Email domain format is invalid.';
            }
        }

        if (domainSegments[domainSegments.length - 1].length < 2) {
            return 'Email domain extension must be at least 2 characters.';
        }
        return null;
    };

    const isValidEmail = (email) => !getEmailError(email) && !!(email || '').trim();

    const getCredentialLabelError = (value, max = LENGTH_LIMITS.credentialLabel.max) =>
        requiredLengthError(value, 'Credential label', max);

    // UPDATED — now also rejects numbers/special characters (letters + spaces only)
    const getUsernameError = (value, max = LENGTH_LIMITS.username.max, fieldName = 'Username') => {
        const requiredErr = requiredLengthError(value, fieldName, max);
        if (requiredErr) return requiredErr;
        if (!ALPHA_ONLY_REGEX.test(value.trim())) return `${fieldName} must contain only alphabets, no numbers or special characters.`;
        return null;
    };

    const getLinkError = (value) => {
        const trimmed = (value || '').trim();
        if (!trimmed) return 'Login link is required.';
        try {
            new URL(trimmed);
        } catch {
            return 'Enter a valid URL, e.g. https://example.com';
        }
        return null;
    };

    const getPasswordStrengthError = (value, { min, max } = LENGTH_LIMITS.password) => {
        const val = value || '';
        if (val.length < min) return `Password must be at least ${min} characters.`;
        if (val.length > max) return `Password must not exceed ${max} characters.`;
        if (!/[A-Z]/.test(val)) return 'Password must contain at least 1 capital letter.';
        if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/.test(val)) return 'Password must contain at least 1 special character.';
        return null;
    };

    const getPasswordStrengthLabel = (value) => {
        const val = value || '';
        if (!val) return null;

        let score = 0;
        [/.{8,}/, /.{12,}/, /[A-Z]/, /[a-z]/, /[0-9]/, /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/]
            .forEach((re) => { if (re.test(val)) score++; });

        if (score <= 2) return { text: 'Weak password', color: 'text-red-600' };
        if (score <= 4) return { text: 'Medium strength password', color: 'text-amber-600' };
        return { text: 'Strong password', color: 'text-emerald-600' };
    };

    const getNumericRangeError = (value, { min = 0, max = Infinity, fieldName = 'Value', required = true } = {}) => {
        const trimmed = String(value ?? '').trim();
        if (!trimmed) return required ? `${fieldName} is required.` : null;
        if (!/^\d+(\.\d+)?$/.test(trimmed)) return `${fieldName} must contain numbers only.`;
        const num = Number(trimmed);
        if (num < min) return `${fieldName} must be at least ${min}.`;
        if (num > max) return `${fieldName} must not exceed ${max}.`;
        return null;
    };

    const getAmountError = (value, maxDigits = LENGTH_LIMITS.amount.maxDigits, fieldName = 'Amount') => {
        const trimmed = String(value ?? '').trim();
        if (!trimmed) return `${fieldName} is required.`;
        if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return `${fieldName} must contain numbers only.`;
        if (Number(trimmed) <= 0) return `${fieldName} must be greater than 0.`;
        if (trimmed.replace('.', '').length > maxDigits) return `${fieldName} must not exceed ${maxDigits} digits in total.`;
        return null;
    };

    const getPhoneError = (value, maxDigits = LENGTH_LIMITS.phone.maxDigits, fieldName = 'Phone number') => {
        const trimmed = String(value ?? '').trim();
        if (!trimmed) return `${fieldName} is required.`;
        if (!/^\d+$/.test(trimmed)) return `${fieldName} must contain numbers only.`;
        if (trimmed.length > maxDigits) return `${fieldName} must not exceed ${maxDigits} digits.`;
        return null;
    };

    const getAddressLengthError = (value, max = LENGTH_LIMITS.address.max, fieldName = 'Address') =>
        requiredLengthError(value, fieldName, max);

    const getFileTypeError = (
        file,
        { allowedExtensions = ALLOWED_SCAN_EXTENSIONS, allowedMimeTypes = ALLOWED_SCAN_MIME_TYPES, fieldName = 'File' } = {}
    ) => {
        if (!file) return null;
        const ext = (file.name?.split('.').pop() || '').toLowerCase();
        const extOk = allowedExtensions.includes(ext);
        const mimeOk = !file.type || allowedMimeTypes.includes(file.type);
        if (!extOk || !mimeOk) {
            return `${fieldName} must be one of: ${allowedExtensions.map((e) => '.' + e).join(', ')}`;
        }
        return null;
    };

    const rangeError = (fieldName, min, max) => (value, overrideMax) =>
        getNumericRangeError(value, { min, max: overrideMax ?? max, fieldName });

    const {
        graceMinutesMax, paidLeavesMax, unpaidAbsentsMax,
        overtimeRateMax, freeLatesMax, officeRadiusMin, officeRadiusMax,
    } = LENGTH_LIMITS.payroll;

    const getGraceMinutesError = rangeError('Grace minutes', 0, graceMinutesMax);
    const getAllowedPaidLimitError = rangeError('Allowed paid leaves', 0, paidLeavesMax);
    const getUnpaidAbsentsError = rangeError('Allowed unpaid-free absents', 0, unpaidAbsentsMax);
    const getOvertimeRateError = rangeError('Overtime rate', 0, overtimeRateMax);
    const getFreeLatesError = rangeError('Free lates before penalty', 0, freeLatesMax);
    const getOfficeRadiusError = rangeError('Office radius', officeRadiusMin, officeRadiusMax);

    // Shared numeric-input guards (digits only, optional single decimal point)
    const NAV_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];

    const blockNonDigitKeydown = (e, { allowDecimal = false, maxDigits = Infinity, currentValue } = {}) => {
        if (NAV_KEYS.includes(e.key) || e.ctrlKey || e.metaKey) return;
        const current = String(currentValue ?? e.target?.value ?? '');
        if (e.key === '.') {
            if (allowDecimal && !current.includes('.')) return;
            e.preventDefault();
            return;
        }
        if (!/^[0-9]$/.test(e.key)) { e.preventDefault(); return; }
        if (current.replace('.', '').length >= maxDigits) e.preventDefault();
    };

    const blockNonDigitPaste = (e, { allowDecimal = false, maxDigits = Infinity } = {}) => {
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
        if (!pattern.test(pasted) || pasted.replace('.', '').length > maxDigits) e.preventDefault();
    };

    // NEW — shared alphabet-only guards (letters + spaces), used for Name/Designation/Department etc.
    const blockNonAlphaKeydown = (e) => {
        if (NAV_KEYS.includes(e.key) || e.ctrlKey || e.metaKey) return;
        if (!/^[A-Za-z\s]$/.test(e.key)) e.preventDefault();
    };

    const blockNonAlphaPaste = (e) => {
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        if (!ALPHA_ONLY_REGEX.test(pasted) && pasted !== '') e.preventDefault();
    };

    return {
        LENGTH_LIMITS,
        isValidLength,
        getLengthError,
        isValidEmail,
        getEmailError,
        getCredentialLabelError,
        getUsernameError,
        getLinkError,
        getPasswordStrengthError,
        getPasswordStrengthLabel,
        getNumericRangeError,
        getAmountError,
        getPhoneError,
        getAddressLengthError,
        getFileTypeError,
        getGraceMinutesError,
        getAllowedPaidLimitError,
        getUnpaidAbsentsError,
        getOvertimeRateError,
        getFreeLatesError,
        getOfficeRadiusError,
        blockNonDigitKeydown,
        blockNonDigitPaste,
        blockNonAlphaKeydown,   // NEW
        blockNonAlphaPaste,     // NEW
    };
}