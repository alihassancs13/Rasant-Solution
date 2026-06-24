import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './assets/main.css'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import './fontAwesomeIcons/icon.js'

const app = createApp(App)

app.mixin({
    mounted() {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
})
router.afterEach((to) => {
    document.title = to.meta.title || 'Rasant Solutions';
});
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(router)
app.mount('#app')