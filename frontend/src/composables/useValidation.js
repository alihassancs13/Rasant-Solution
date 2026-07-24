// composables/useValidation.js

const LENGTH_LIMITS = {
    emailOrUsername: { max: 50 },
    password: { min: 8, max: 32 },
};

export function useValidation() {
    const isValidLength = (value, max) => {
        const trimmed = value?.trim() || '';
        return trimmed.length <= max;
    };

    const getLengthError = (value, fieldName, max) => {
        const trimmed = value?.trim() || '';
        if (trimmed.length > max) {
            return `${fieldName} must not exceed ${max} characters.`;
        }
        return null; // valid
    };

    // Full email validation with a specific, human-readable error message per rule.
    // Covers: length, spaces, @ count, empty local/domain parts, leading/trailing/
    // consecutive dots, invalid characters, domain format, and TLD length.
    const getEmailError = (value, max = LENGTH_LIMITS.emailOrUsername.max) => {
        const email = (value || '').trim();
        if (!email) return null; // don't show error before user starts typing

        if (email.length > max) {
            return `Email must not exceed ${max} characters.`;
        }
        if (email.includes(' ')) {
            return 'Email must not contain spaces.';
        }

        const atCount = (email.match(/@/g) || []).length;
        if (atCount === 0) {
            return 'Email must contain an @ symbol.';
        }
        if (atCount > 1) {
            return 'Email must not contain multiple @ symbols.';
        }

        const atIndex = email.indexOf('@');
        const localPart = email.slice(0, atIndex);
        const domainPart = email.slice(atIndex + 1);

        if (!localPart) {
            return 'Email is missing the part before @.';
        }
        if (!domainPart) {
            return 'Email is missing the domain part.';
        }
        if (localPart.startsWith('.') || localPart.endsWith('.')) {
            return 'Email must not start or end with a period.';
        }
        if (localPart.includes('..')) {
            return 'Email must not contain consecutive periods.';
        }
        if (!/^[A-Za-z0-9._%+-]+$/.test(localPart)) {
            return 'Email contains invalid characters before @.';
        }
        if (!domainPart.includes('.')) {
            return 'Email domain must contain a period, e.g. gmail.com.';
        }
        if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
            return 'Email domain must not start or end with a period.';
        }
        if (domainPart.includes('..')) {
            return 'Email domain must not contain consecutive periods.';
        }

        const domainSegments = domainPart.split('.');
        const validSegment = /^[A-Za-z0-9-]+$/;
        for (const segment of domainSegments) {
            if (!segment || !validSegment.test(segment) || segment.startsWith('-') || segment.endsWith('-')) {
                return 'Email domain format is invalid.';
            }
        }

        const tld = domainSegments[domainSegments.length - 1];
        if (tld.length < 2) {
            return 'Email domain extension must be at least 2 characters.';
        }

        return null; // valid
    };

    const isValidEmail = (email) => {
        return !getEmailError(email) && !!(email || '').trim();
    };

    // Password strength: min/max length + at least 1 uppercase + 1 special character
    const getPasswordStrengthError = (value, { min, max } = LENGTH_LIMITS.password) => {
        const val = value || '';
        if (val.length < min) {
            return `Password must be at least ${min} characters.`;
        }
        if (val.length > max) {
            return `Password must not exceed ${max} characters.`;
        }
        if (!/[A-Z]/.test(val)) {
            return 'Password must contain at least 1 capital letter.';
        }
        if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/.test(val)) {
            return 'Password must contain at least 1 special character.';
        }
        return null; // valid
    };

    // Returns a simple one-line strength label: Weak / Medium / Strong
    // Only meaningful to show once the hard requirements (length/capital/special) pass.
    const getPasswordStrengthLabel = (value) => {
        const val = value || '';
        if (!val) return null;

        let score = 0;
        if (val.length >= 8) score++;
        if (val.length >= 12) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[a-z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/.test(val)) score++;

        if (score <= 2) return { text: 'Weak password', color: 'text-red-600' };
        if (score <= 4) return { text: 'Medium strength password', color: 'text-amber-600' };
        return { text: 'Strong password', color: 'text-emerald-600' };
    };

    return {
        LENGTH_LIMITS,
        isValidLength,
        getLengthError,
        isValidEmail,
        getEmailError,
        getPasswordStrengthError,
        getPasswordStrengthLabel,
    };
}