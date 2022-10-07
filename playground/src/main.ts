import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { firestorePlugin } from 'vuefire'
import App from './App.vue'

import { createFirebaseApp, VueFirePlugin } from './firestore'

const app = createApp(App)

app
  .use(createPinia())
  .use(firestorePlugin)
  .use(VueFirePlugin(createFirebaseApp()))

app.mount('#app')
