import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { firestorePlugin } from 'vuefire'
import App from './App.vue'
import { createFirebaseApp, VueFirePlugin } from './firestore'
import { createWebHistory, createRouter } from 'vue-router/auto'

const router = createRouter({
  history: createWebHistory(),
})

const app = createApp(App)
app
  .use(createPinia())
  .use(firestorePlugin)
  .use(VueFirePlugin(createFirebaseApp()))
  .use(router)

app.mount('#app')
