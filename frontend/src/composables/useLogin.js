import { ref } from "vue";

export default function useLogin() {
  const error = ref("");
  const loading = ref(false);

  const login = async (username, password) => {
    error.value = "";
    loading.value = true;

    try {
      const pages = {
        admin: "/dashboard-admin",
        employee: "/dashboard-employee",
        client: "/dashboard-client",
      };

      const key = username.toLowerCase();

      if (
        pages[key] &&
        ((key === "admin" && password === "Admin@123") ||
          (key === "employee" && password === "Employee@123") ||
          (key === "client" && password === "Client@123"))
      ) {
        window.location.href = pages[key];
        return;
      }

      error.value = "Invalid username or password";
    } finally {
      loading.value = false;
    }
  };

  return {
    login,
    error,
    loading,
  };
}