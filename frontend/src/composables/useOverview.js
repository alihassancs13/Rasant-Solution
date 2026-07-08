// useOverview.js
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLoginStore } from '@/stores/loginStore.js';

export function useOverview() {
    const router = useRouter();
    const loginStore = useLoginStore();

    // Reactive state to control the Tailwind modal visibility
    const showLogoutModal = ref(false);

    const openLogoutModal = () => {
        showLogoutModal.value = true;
    };

    const closeLogoutModal = () => {
        showLogoutModal.value = false;
    };

    const handleLogout = async () => {
        try {
            closeLogoutModal(); // Hide modal right away
            await loginStore.logout();
            await router.push('/login');
        } catch (error) {
            console.error('Logout navigation failed:', error);
        }
    };

    return {
        showLogoutModal,
        openLogoutModal,
        closeLogoutModal,
        handleLogout
    };
}