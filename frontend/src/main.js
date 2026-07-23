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
    // Browser tab: apple-touch-icon.png + module name (e.g. "Leave | Rasant Solutions")
    const moduleName = to.meta?.module || null
    const fallbackTitle = to.meta?.title || 'Rasant Solutions'
    document.title = moduleName
        ? `${moduleName} | Rasant Solutions`
        : fallbackTitle

    const iconHref = '/apple-touch-icon.png'
    let icon = document.querySelector("link[rel='icon']")
    if (!icon) {
        icon = document.createElement('link')
        icon.setAttribute('rel', 'icon')
        document.head.appendChild(icon)
    }
    icon.setAttribute('type', 'image/png')
    icon.setAttribute('href', iconHref)
});

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(pinia);
app.use(router);
app.use(Toast);
app.mount('#app')