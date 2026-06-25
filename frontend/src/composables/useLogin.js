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

    const togglePasswordVisibility = () => {
        isPasswordVisible.value = !isPasswordVisible.value;
    };

    // Email validation function
    const isValidEmail = (email) => {
        // Check if it has @ and . with proper positions
        const atIndex = email.indexOf('@');
        const dotIndex = email.lastIndexOf('.');

        // Must have @ and .
        if (atIndex === -1 || dotIndex === -1) return false;

        // @ must not be first or last
        if (atIndex === 0 || atIndex === email.length - 1) return false;

        // . must be after @ and not immediately after @
        if (dotIndex <= atIndex + 1) return false;

        // . must not be at the end
        if (dotIndex === email.length - 1) return false;

        // TLD must have at least 2 characters
        if (email.length - dotIndex - 1 < 2) return false;

        // No spaces allowed
        if (email.includes(' ')) return false;

        return true;
    };

    const handleLoginSubmit = async () => {
        // Clear previous messages
        errorMessage.value = '';
        successMessage.value = '';

        // Trim inputs
        const trimmedInput = emailOrUsername.value.trim();
        const trimmedPassword = password.value.trim();

        // Validate both fields are filled
        if (!trimmedInput || !trimmedPassword) {
            errorMessage.value = '⚠️ Please fill in both fields.';
            return;
        }

        // ✅ Check if it's a valid email format
        const isEmail = isValidEmail(trimmedInput);

        // If input contains @ but is not a valid email, show error and stop
        if (trimmedInput.includes('@') && !isEmail) {
            errorMessage.value = '⚠️ Please enter a valid email address (e.g., user@example.com).';
            return;  // ← Stop here, don't call API
        }

        console.log('🔄 Submitting login form...');
        console.log('📝 Input:', trimmedInput);

        isLoading.value = true;

        try {
            // Prepare credentials
            const credentials = {
                password: trimmedPassword,
            };

            if (isEmail) {
                credentials.email = trimmedInput;
                console.log('📧 Logging in with email:', trimmedInput);
            } else {
                credentials.username = trimmedInput;
                console.log('👤 Logging in with username:', trimmedInput);
            }

            console.log('📤 Sending credentials:', {
                ...credentials,
                password: '***hidden***'
            });

            // Call login API
            const result = await loginStore.login(credentials);

            console.log('📊 Login result:', result);

            if (result.success) {
                successMessage.value = '✅ Login successful! Redirecting...';
                console.log('✅ Login successful!');
                console.log('🎉 Welcome back,', loginStore.user?.username || loginStore.user?.email || 'User');

                // Handle remember me
                if (rememberMe.value) {
                    sessionStorage.setItem('rememberMe', 'true');
                    console.log('💾 Remember me enabled');
                } else {
                    sessionStorage.removeItem('rememberMe');
                    console.log('💾 Remember me disabled');
                }

                // Redirect after delay
                setTimeout(() => {
                    const redirectPath = loginStore.redirectBasedOnRole();
                    console.log(`🔀 Redirecting to: ${redirectPath}`);
                    router.replace(redirectPath);
                }, 1000);
            } else {
                errorMessage.value = result.error || '❌ Login failed. Please try again.';
                console.error('❌ Login failed:', result.error);
            }
        } catch (error) {
            console.error('❌ Unexpected error:', error);
            errorMessage.value = '❌ An unexpected error occurred. Please try again.';
        } finally {
            isLoading.value = false;
            console.log('🔄 Login process completed');
        }
    };

    const logout = async () => {
        console.log('🔄 Logging out...');
        await loginStore.logout();
        console.log('✅ Logout complete, redirecting to login');
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
        togglePasswordVisibility,
        handleLoginSubmit,
        logout,
        isAuthenticated,
        user,
        getUser: loginStore.getUser,
        getUserRole: loginStore.getUserRole,
    };
}