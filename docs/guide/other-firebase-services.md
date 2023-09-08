# Firebase Services

VueFire provides a set of composable functions to access some of the different Firebase services. These are all exposed as composables starting with the word _use_:

```vue
<script setup>
import {
  useFirebaseApp,
  useAuth,
  useDatabase,
  useFirestore,
  useFirebaseStorage,
  // etc
} from 'vuefire'

const firebaseApp = useFirebaseApp()
const auth = useAuth()
const database = useDatabase()
const firestore = useFirestore()
const storage = useFirebaseStorage()
</script>
```

As [all composables](https://vuejs.org/guide/reusability/composables.html), these must be called within _Injectable Contexts_ like the _setup_ of a component, a Pinia store, or a Router navigation guard. However, you can call these specific Firebase Services composables anywhere in your application as long as you pass the **Firebase App name as the parameter**.

::: tip
The Firebase Name parameter is only needed when using the composable outside of _setup_ and one of these condition are met:

- You are doing SSR
- You have multiple Firebase Apps

**Omit the name in all other scenarios**, it's just not needed.
:::

## Other Firebase Services

For any other service not covered by VueFire, you should use the Firebase SDK directly by passing the firebase app as the first parameter:

```vue
<script setup>
import { useFirebaseApp } from 'vuefire'
import { getMessaging } from 'firebase/messaging'

const firebaseApp = useFirebaseApp()
const messaging = getMessaging(firebaseApp)
</script>
```

If you find yourself using this very often, you can create a composable for it:

::: code-group

```ts [composables/firebase-messaging.ts]
import { getMessaging } from 'firebase/messaging'
import { useFirebaseApp } from 'vuefire'

export function useFirebaseMessaging() {
  return getMessaging(useFirebaseApp())
}
```

```vue [MyComponent.vue]
<script setup>
import { useFirebaseMessaging } from '~/composables/firebase-messaging'

const messaging = useFirebaseMessaging()
</script>
```

:::

In the case of Services that require initialization, you should do it alongside the initialization of the Firebase App:

```ts
import { initializeApp } from 'firebase/app'
import { initializeAnalytics } from 'firebase/analytics'

export const firebaseApp = initializeApp({
  // config
})
initializeAnalytics(firebaseApp)
```

## Nuxt

In the context of Nuxt, you can create a plugin in the `plugins/` folder, it will be picked up automatically by Nuxt:

::: code-group

```ts [plugins/analytics.client.ts]
import {
  type Analytics,
  initializeAnalytics,
  isSupported,
} from 'firebase/analytics'

export default defineNuxtPlugin(async () => {
  const firebaseApp = useFirebaseApp()

  console.log('Loading analytics')

  let analytics: Analytics | null = null
  if (await isSupported()) {
    analytics = initializeAnalytics(firebaseApp)
    console.log('Loaded analytics')
  } else {
    console.log('Analytics not supported')
  }

  return {
    provide: {
      analytics,
    },
  }
})
```

:::

The `.client` suffix is important for services that only run on the client, like analytics. See the [Nuxt docs](https://nuxt.com/docs/guide/directory-structure/plugins) for more information.
