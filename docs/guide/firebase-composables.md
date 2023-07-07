# Firebase Services

You can access all of the Firebase services within components with the different composables provided by VueFire:

```vue
<script setup>
import {
  useFirebaseApp,
  useAuth,
  useDatabase,
  useFirestore,
  useFirebaseStorage,
} from 'vuefire'

const firebaseApp = useFirebaseApp()
const auth = useAuth()
const database = useDatabase()
const firestore = useFirestore()
const storage = useFirebaseStorage()
</script>
```

As [all composables](https://vuejs.org/guide/reusability/composables.html), these must be called within the _setup_ of a component. However, you can call these specific Firebase Services composables anywhere in your application as long as you pass the **Firebase App name as the parameter**.

::: tip
The Firebase Name parameter is only needed when using the composable outside of _setup_ and one of these condition are met:

- You are doing SSR
- You have multiple Firebase Apps

**Omit the name in all other scenarios**, it's just not needed.
:::
