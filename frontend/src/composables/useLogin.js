// composables/useLogin.js
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useLoginStore } from '../stores/loginStore';
import { useToast } from '@/composables/useToast.js';
import { useValidation } from '@/composables/useValidation.js';

export function useLogin() {
    const router = useRouter();
    const loginStore = useLoginStore();
    const { showToast } = useToast(); // Initialize toast
    const {
        LENGTH_LIMITS,
        getLengthError,
        isValidEmail,
        getEmailError,
        getPasswordStrengthError,
    } = useValidation(); // Initialize validation

    const emailOrUsername = ref('');
    const password = ref('');
    const rememberMe = ref(false);
    const isPasswordVisible = ref(false);
    const isLoading = ref(false);

    // For field-specific error highlighting
    const fieldErrors = ref({
        emailOrUsername: false,
        password: false
    });

    // Real-time length validation (updates as user types)
    const emailLengthError = computed(() => {
        return getLengthError(emailOrUsername.value, 'Email/Username', LENGTH_LIMITS.emailOrUsername.max);
    });

    const passwordLengthError = computed(() => {
        return getLengthError(password.value, 'Password', LENGTH_LIMITS.password.max);
    });

    // Full email format validation (only applies once input looks like an email,
    // i.e. contains '@' — so usernames don't get flagged with email-format errors)
    const emailFormatError = computed(() => {
        const val = emailOrUsername.value;
        if (!val?.includes('@')) return null;
        return getEmailError(val, LENGTH_LIMITS.emailOrUsername.max);
    });

    // Combined live error for the email/username field
    const emailLiveError = computed(() => emailLengthError.value || emailFormatError.value);

    // Live password strength validation (min/max length + capital + special char)
    const passwordStrengthError = computed(() => {
        return getPasswordStrengthError(password.value, LENGTH_LIMITS.password);
    });

    // True the moment either field exceeds its max length
    const hasLengthError = computed(() => {
        return !!emailLengthError.value || !!passwordLengthError.value;
    });

    // Re-sync fieldErrors on every keystroke — so a stale error (e.g. left over
    // from a failed submit) clears the instant the value becomes valid again,
    // and no error shows while the value is still within the allowed limits.
    watch(emailOrUsername, () => {
        fieldErrors.value.emailOrUsername = !!emailLiveError.value;
    });

    watch(password, () => {
        fieldErrors.value.password = !!passwordLengthError.value;
    });

    const togglePasswordVisibility = () => {
        isPasswordVisible.value = !isPasswordVisible.value;
    };

    const handleLoginSubmit = async () => {
        // Block submit entirely if a length error is currently active
        if (hasLengthError.value) {
            showToast(emailLengthError.value || passwordLengthError.value, 'error');
            return;
        }

        // Clear previous field errors
        fieldErrors.value = { emailOrUsername: false, password: false };

        // Trim inputs
        const trimmedInput = emailOrUsername.value.trim();
        const trimmedPassword = password.value.trim();

        // Check 1: Both fields are filled
        if (!trimmedInput && !trimmedPassword) {
            showToast('Please fill in both fields.', 'error');
            fieldErrors.value.emailOrUsername = true;
            fieldErrors.value.password = true;
            return;
        }

        // Check 2: Email/Username field is empty
        if (!trimmedInput) {
            showToast('Please enter your email or username.', 'error');
            fieldErrors.value.emailOrUsername = true;
            return;
        }

        // Check 3: Password field is empty
        if (!trimmedPassword) {
            showToast('Please enter your password.', 'error');
            fieldErrors.value.password = true;
            return;
        }

        // Check 4: Full email format validation (only when input looks like an email)
        if (trimmedInput.includes('@')) {
            const emailErr = getEmailError(trimmedInput, LENGTH_LIMITS.emailOrUsername.max);
            if (emailErr) {
                showToast(emailErr, 'error');
                fieldErrors.value.emailOrUsername = true;
                return;
            }
        }

        // Check 5: Confirm valid email format flag (for choosing email vs username field on submit)
        const isEmail = isValidEmail(trimmedInput);

        console.log('Submitting login form...');
        console.log('Input:', trimmedInput);

        isLoading.value = true;

        try {
            // Prepare credentials
            const credentials = {
                password: trimmedPassword,
            };

            if (isEmail) {
                credentials.email = trimmedInput;
                console.log('Logging in with email:', trimmedInput);
            } else {
                credentials.username = trimmedInput;
                console.log('Logging in with username:', trimmedInput);
            }

            // Call login API
            const result = await loginStore.login(credentials);

            if (result.success) {
                showToast('Login successful! Redirecting...', 'success');
                console.log('Login successful!');

                // Handle remember me
                if (rememberMe.value) {
                    sessionStorage.setItem('rememberMe', 'true');
                } else {
                    sessionStorage.removeItem('rememberMe');
                }

                // Redirect after delay
                setTimeout(() => {
                    const queryRedirect = router.currentRoute.value.query?.redirect;
                    const rolePath = loginStore.redirectBasedOnRole();
                    const redirectPath =
                        typeof queryRedirect === 'string' && queryRedirect.startsWith('/')
                            ? queryRedirect
                            : rolePath;
                    router.replace(redirectPath);
                }, 1000);
            } else {
                // Display the specific error message from backend as toast
                let errorMsg = result.error || 'Login failed. Please try again.';

                // Customize error messages
                const errorType = result.errorType || loginStore.errorType;

                // Override specific error messages
                if (errorType === 'email_not_found') {
                    errorMsg = 'Invalid email address.';
                } else if (errorType === 'username_not_found') {
                    errorMsg = 'Invalid username.';
                } else if (errorType === 'incorrect_password') {
                    errorMsg = 'Invalid password. Please try again.';
                } else {
                    // Check error message content and customize
                    const errorLower = errorMsg.toLowerCase();
                    if (errorLower.includes('email not found') || errorLower.includes('email_not_found')) {
                        errorMsg = 'Invalid email address.';
                    } else if (errorLower.includes('username not found') || errorLower.includes('username_not_found')) {
                        errorMsg = 'Invalid username.';
                    } else if (errorLower.includes('invalid email')) {
                        errorMsg = 'Invalid email address.';
                    } else if (errorLower.includes('invalid username')) {
                        errorMsg = 'Invalid username.';
                    } else if (errorLower.includes('password') || errorLower.includes('incorrect')) {
                        errorMsg = 'Invalid password. Please try again.';
                    }
                }

                showToast(errorMsg, 'error');

                // Highlight the specific field based on error type
                if (errorType === 'email_not_found') {
                    fieldErrors.value.emailOrUsername = true;
                } else if (errorType === 'username_not_found') {
                    fieldErrors.value.emailOrUsername = true;
                } else if (errorType === 'incorrect_password') {
                    fieldErrors.value.password = true;
                } else {
                    // Check error message content to determine which field to highlight
                    const errorLower = errorMsg.toLowerCase();
                    if (errorLower.includes('email') || errorLower.includes('username') ||
                        errorLower.includes('invalid email') || errorLower.includes('invalid username')) {
                        fieldErrors.value.emailOrUsername = true;
                    } else if (errorLower.includes('password') || errorLower.includes('incorrect')) {
                        fieldErrors.value.password = true;
                    }
                }

                console.error('Login failed:', result.error);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            showToast('An unexpected error occurred. Please try again.', 'error');
        } finally {
            isLoading.value = false;
        }
    };

    const logout = async () => {
        await loginStore.logout();
        showToast('Logged out successfully', 'info');
        router.push('/login');
    };

    const isAuthenticated = computed(() => loginStore.isAuthenticated);
    const user = computed(() => loginStore.user);

    return {
        emailOrUsername,
        password,
        rememberMe,
        isPasswordVisible,
        isLoading,
        fieldErrors,
        emailLengthError,
        emailLiveError,
        passwordLengthError,
        passwordStrengthError,
        hasLengthError,
        togglePasswordVisibility,
        handleLoginSubmit,
        logout,
        isAuthenticated,
        user,
        getUser: loginStore.getUser,
        getUserRole: loginStore.getUserRole,
    };
}