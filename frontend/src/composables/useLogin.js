// composables/useLogin.js
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useLoginStore } from '../stores/loginStore';

export function useLogin() {
    const router = useRouter();
    const loginStore = useLoginStore();

    const emailOrUsername = ref('');
    const password = ref('');
    const rememberMe = ref(false);
    const isPasswordVisible = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const isLoading = ref(false);

    // For field-specific error highlighting
    const fieldErrors = ref({
        emailOrUsername: false,
        password: false
    });

    const togglePasswordVisibility = () => {
        isPasswordVisible.value = !isPasswordVisible.value;
    };

    // Email validation function
    const isValidEmail = (email) => {
        const atIndex = email.indexOf('@');
        const dotIndex = email.lastIndexOf('.');

        if (atIndex === -1 || dotIndex === -1) return false;
        if (atIndex === 0 || atIndex === email.length - 1) return false;
        if (dotIndex <= atIndex + 1) return false;
        if (dotIndex === email.length - 1) return false;
        if (email.length - dotIndex - 1 < 2) return false;
        if (email.includes(' ')) return false;

        return true;
    };

    const handleLoginSubmit = async () => {
        // Clear previous messages and errors
        errorMessage.value = '';
        successMessage.value = '';
        fieldErrors.value = { emailOrUsername: false, password: false };

        // Trim inputs
        const trimmedInput = emailOrUsername.value.trim();
        const trimmedPassword = password.value.trim();

        // Check 1: Both fields are filled
        if (!trimmedInput && !trimmedPassword) {
            errorMessage.value = 'Please fill in both fields.';
            fieldErrors.value.emailOrUsername = true;
            fieldErrors.value.password = true;
            return;
        }

        // Check 2: Email/Username field is empty
        if (!trimmedInput) {
            errorMessage.value = 'Please enter your email or username.';
            fieldErrors.value.emailOrUsername = true;
            return;
        }

        // Check 3: Password field is empty
        if (!trimmedPassword) {
            errorMessage.value = 'Please enter your password.';
            fieldErrors.value.password = true;
            return;
        }

        // Check 4: Check if it's a valid email format
        const isEmail = isValidEmail(trimmedInput);

        // If input contains @ but is not a valid email, show error and stop
        if (trimmedInput.includes('@') && !isEmail) {
            errorMessage.value = 'Please enter a valid email address (e.g., user@example.com).';
            fieldErrors.value.emailOrUsername = true;
            return;
        }

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
                successMessage.value = 'Login successful! Redirecting...';
                console.log('Login successful!');

                // Handle remember me
                if (rememberMe.value) {
                    sessionStorage.setItem('rememberMe', 'true');
                } else {
                    sessionStorage.removeItem('rememberMe');
                }

                // Redirect after delay
                setTimeout(() => {
                    const redirectPath = loginStore.redirectBasedOnRole();
                    router.replace(redirectPath);
                }, 1000);
            } else {
                // Display the specific error message from backend
                errorMessage.value = result.error || 'Login failed. Please try again.';

                // Highlight the specific field based on error type
                const errorType = result.errorType || loginStore.errorType;
                if (errorType === 'email_not_found') {
                    fieldErrors.value.emailOrUsername = true;
                } else if (errorType === 'username_not_found') {
                    fieldErrors.value.emailOrUsername = true;
                } else if (errorType === 'incorrect_password') {
                    fieldErrors.value.password = true;
                } else {
                    // Check error message content to determine which field to highlight
                    const errorLower = errorMessage.value.toLowerCase();
                    if (errorLower.includes('email') || errorLower.includes('username') ||
                        errorLower.includes('not found') || errorLower.includes('invalid email')) {
                        fieldErrors.value.emailOrUsername = true;
                    } else if (errorLower.includes('password') || errorLower.includes('incorrect')) {
                        fieldErrors.value.password = true;
                    }
                }

                console.error('Login failed:', result.error);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            errorMessage.value = 'An unexpected error occurred. Please try again.';
        } finally {
            isLoading.value = false;
        }
    };

    const logout = async () => {
        await loginStore.logout();
        router.push('/login');
    };

    const isAuthenticated = computed(() => loginStore.isAuthenticated);
    const user = computed(() => loginStore.user);

    return {
        emailOrUsername,
        password,
        rememberMe,
        isPasswordVisible,
        errorMessage,
        successMessage,
        isLoading,
        fieldErrors,
        togglePasswordVisibility,
        handleLoginSubmit,
        logout,
        isAuthenticated,
        user,
        getUser: loginStore.getUser,
        getUserRole: loginStore.getUserRole,
    };
}