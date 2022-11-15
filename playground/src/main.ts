import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { firestorePlugin, VueFire, VueFireAuth, VueFireAppCheck } from 'vuefire'
import App from './App.vue'
import { createFirebaseApp } from './firebase'
import { createWebHistory, createRouter } from 'vue-router/auto'
import { createStore } from 'vuex'
import { ReCaptchaV3Provider } from 'firebase/app-check'

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
  .use(VueFire, {
    firebaseApp: createFirebaseApp(),
    modules: [
      VueFireAuth(),
      VueFireAppCheck({
        debug: process.env.NODE_ENV !== 'production',
        isTokenAutoRefreshEnabled: true,
        provider: new ReCaptchaV3Provider(
          '6LfJ0vgiAAAAAHheQE7GQVdG_c9m8xipBESx_SKI'
        ),
      }),
    ],
  })
  .use(firestorePlugin)
  .use(store)
  .use(router)

app.mount('#app')
