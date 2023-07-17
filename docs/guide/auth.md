# Firebase Authentication

[Firebase Authentication](https://firebase.google.com/docs/auth/web/start) makes it really easy to add different kind of authentications to your app and integrate with security rules for Firestore and Database.
Most of the APIs can be used as you would normally do with Firebase, VueFire exposes a few composables to integrate better with Vue:

## Installation

Start by adding the `VueFireAuth` module to the `VueFire` plugin:

```ts
import { VueFire, VueFireAuth } from 'vuefire'
app.use(VueFire, {
  firebaseApp: createFirebaseApp(),
  modules: [
    // ... other modules
    VueFireAuth(),
  ],
})
```

This will automatically initialize and inject the [Auth module](https://firebase.google.com/docs/auth/web/start#add-initialize-sdk) as well as the other features described in this page.

## Auth instance

You can access the current Auth instance in any component with the `useFirebaseAuth()` composable:

```vue
<script setup>
const auth = useFirebaseAuth()
</script>
```

This is necessary if you want to use the [Firebase Auth API](https://firebase.google.com/docs/auth/web/start#sign_in_existing_users) to sign in users, create users, etc:

```vue{7,9,14,22}
<script setup>
import {
  getRedirectResult,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'

const auth = useFirebaseAuth()! // only exists on client side

// display errors if any
const error = ref<Error | null>(null)
function signinRedirect() {
  signInWithRedirect(auth, someAuthProvider).catch((reason) => {
    console.error('Failed signinRedirect', reason)
    error.value = reason
  })
}

// only on client side
onMounted(() => {
  getRedirectResult(auth).catch((reason) => {
    console.error('Failed redirect result', reason)
    error.value = reason
  })
})
</script>

<template>
  <main>
    <ErrorBox v-if="error" :error="error" />
    <button @click="signinRedirect()">SignIn with Google</button>
  </main>
</template>
```

::: tip
`useFirebaseAuth()` is `null` on the server side, so if you are using TypeScript, you might need to add a `!` to assert that it's not null:

```ts
const auth = useFirebaseAuth()!
```

:::

### Providers

There are multiple ways to add the auth providers to your app like exporting a `new GoogleAuthProvider()` instance from the file where we initialize Firebase. Another way is to create it directly in the component where you need it. make sure to add it into a regular `<script>` since each `<script setup>` is scoped to a component instance:

```vue{1-4,17}
<script lang="ts">
import { GoogleAuthProvider } from 'firebase/auth'
export const googleAuthProvider = new GoogleAuthProvider()
</script>

<script setup>
import {
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'

//...

function signinPopup() {
  error.value = null
  signInWithPopup(auth, googleAuthProvider).catch((reason) => {
    console.error('Failed sign', reason)
    error.value = reason
  })
}
</script>
```

## Current User

You can get the current user as a reactive variable with the `useCurrentUser()` composable:

```vue
<script setup>
import { useCurrentUser } from 'vuefire'

const user = useCurrentUser()
</script>

<template>
  <p v-if="user">Hello {{ user.providerData.displayName }}</p>
</template>
```

### Wait for the user to be loaded

The `useCurrentUser()` composable will give you an `undefined` value until the user is loaded. It will then become `null` or the user object itself. If you need to wait for the user to be loaded in a declarative fashion, you can use the `useIsCurrentUserLoaded()` composable. Internally it's just a computed property that returns `true` when if user is not `undefined`.

There is also a `getCurrentUser()` function that returns a promise of the current user. This is useful if you want to wait for the user to be loaded before doing anything. You can, for example, await it within a navigation guard:

```ts
router.beforeEach(async (to) => {
  // routes with `meta: { requiresAuth: true }` will check for the users, others won't
  if (to.meta.requiresAuth) {
    const currentUser = await getCurrentUser()
    // if the user is not logged in, redirect to the login page
    if (!currentUser) {
      return {
        path: '/login',
        query: {
          // we keep the current path in the query so we can redirect to it after login
          // with `router.push(route.query.redirect || '/')`
          redirect: to.fullPath,
        },
      }
    }
  }
})
```

::: tip
If you are using `getCurrentUser()` in a navigation guard, make sure to add it before calling `app.use(router)` as that will trigger the initial navigation.
:::

Once the user is loaded, `getCurrentUser()` will immediately resolve the current user.

Sometimes, the Firebase SDK might be able to automatically log in the user with a hidden cookie or local storage. In that case, you can automatically redirect the user to the page they were trying to access before being automatically logged in. You can even redirect them to the login page if they logout:

```ts
// App.vue
const user = useCurrentUser()
const router = useRouter()
const route = useRoute()

watch(user, async (currentUser, previousUser) => {
  // redirect to login if they logout and the current
  // route is only for authenticated users
  if (
    !currentUser &&
    previousUser &&
    isCurrentRouteAuthenticated(route)
  ) {
    return router.push({ name: 'login' })
  }
  // redirect the user if they are logged in but were
  // rejected because the user wasn't ready yet, logged in
  // then got back to this page
  if (currentUser && typeof route.query.redirect === 'string') {
    return router.push(route.query.redirect)
  }
})
```
