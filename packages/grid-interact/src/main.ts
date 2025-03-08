import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Import PrimeVue
import PrimeVue from 'primevue/config'
// For PrimeVue 4, themes structure has changed
// We'll skip the theme import for now
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css' // Icons

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  ripple: true
})
app.use(ToastService)

app.mount('#app')