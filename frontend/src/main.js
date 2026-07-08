import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia';
import router from './router/index.js'
import './assets/main.css'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import './plugins/icon.js'
import { useLoginStore } from './stores/loginStore.js';
window.addEventListener('storage', (event) => {
    const loginStore = useLoginStore();

    // Build a partial update object based on what changed
    const update = {};
    if (event.key === 'accessToken') {
        update.accessToken = event.newValue;
    }
    if (event.key === 'refreshToken') {
        update.refreshToken = event.newValue;
    }
    if (event.key === 'user') {
        update.user = event.newValue ? JSON.parse(event.newValue) : null;
    }

    if (Object.keys(update).length > 0) {
        loginStore.syncFromStorage(update);
    }

    // Optional: redirect if we just logged out (accessToken became null)
    if (event.key === 'accessToken' && event.newValue === null) {
        // Check if current route requires authentication
        if (router.currentRoute.value.meta.requiresAuth) {
            router.push('/login');
        }
    }
});
const app = createApp(App)
const pinia = createPinia();
app.mixin({
    mounted() {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
})
router.afterEach((to) => {
    document.title = to.meta.title || 'Rasant Solutions';
});

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(pinia);
app.use(router);
app.use(Toast);
app.mount('#app')