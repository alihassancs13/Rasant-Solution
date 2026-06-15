import { ref } from 'vue';

export function useLogin() {
  const username = ref('');
  const password = ref('');
  const rememberMe = ref(true);
  const isPasswordVisible = ref(false);
  const errorMessage = ref('');

  // Local Page Redirection Dictionary Matrix
  const DESTINATION_PAGES = {
    admin: 'dashboard-admin.html',
    employee: 'dashboard-employee.html',
    client: 'dashboard-client.html'
  };

  const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
  };

  const injectQuickCredentials = (userRole, userPass) => {
    username.value = userRole;
    password.value = userPass;
    errorMessage.value = '';
  };

  const handleLoginSubmit = () => {
    errorMessage.value = '';
    
    const normalizedUser = username.value.trim().toLowerCase();
    const providedPass = password.value;

    if (!normalizedUser || !providedPass) {
      errorMessage.value = 'Please fill in both fields.';
      return;
    }

    // Static Demo Fallback Authentication Credentials Checking Verification Engine
    if (DESTINATION_PAGES[normalizedUser] && (
      (normalizedUser === 'admin' && providedPass === 'Admin@123') ||
      (normalizedUser === 'employee' && providedPass === 'Employee@123') ||
      (normalizedUser === 'client' && providedPass === 'Client@123')
    )) {
      // Success Callback Matrix Node Redirect Hook Execution
      window.location.href = DESTINATION_PAGES[normalizedUser];
    } else {
      errorMessage.value = 'Invalid username or password. Please verify credentials.';
    }
  };

  return {
    username,
    password,
    rememberMe,
    isPasswordVisible,
    errorMessage,
    togglePasswordVisibility,
    injectQuickCredentials,
    handleLoginSubmit,
  };
}