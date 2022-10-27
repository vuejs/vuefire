import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { firestorePlugin } from 'vuefire'
import App from './App.vue'
import { createFirebaseApp, VueFirePlugin } from './firebase'
import { createWebHistory, createRouter } from 'vue-router/auto'
import { createStore } from 'vuex'

const router = createRouter({
  history: createWebHistory(),
})

const store = createStore({
  // can't work with vuefire
  // strict: import.meta.env.DEV,
  state: () => ({
    count: 0,
    todos: [],
  }),
})

const app = createApp(App)
app
  .use(createPinia())
  .use(firestorePlugin)
  .use(VueFirePlugin(createFirebaseApp()))
  .use(store)
  .use(router)

app.mount('#app')
