import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import {
  VueFire,
  VueFireAuth,
  VueFireAppCheck,
  VueFireFirestoreOptionsAPI,
  VueFireDatabaseOptionsAPI,
  getCurrentUser,
} from 'vuefire'
import App from './App.vue'
import { createFirebaseApp } from './firebase'
import { createWebHistory, createRouter } from 'vue-router/auto'
import { createStore } from 'vuex'
import { ReCaptchaV3Provider } from 'firebase/app-check'

const router = createRouter({
  history: createWebHistory(),
})

router.beforeEach(async () => {
  await getCurrentUser()
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
  .directive('focus', {
    mounted: async (el) => {
      await nextTick()
      el.focus()
    },
  })
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
      VueFireDatabaseOptionsAPI(),
      VueFireFirestoreOptionsAPI(),
    ],
  })
  .use(store)
  .use(router)

app.mount('#app')
