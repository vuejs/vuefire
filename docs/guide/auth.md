# Firebase Authentication

VueFire exposes the current user as a reactive variable while allowing you to use the Firebase Authentication API as you would normally do.

## Installation

Start by adding the `VueFireAuth` module to the `VueFire` plugin:

```ts
app
  .use(VueFire, {
    firebaseApp: createFirebaseApp(),
    modules: [
      // ... other modules
      VueFireAuth(),
    ],
  })
```

## Get the Current User

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

## Wait for the user to be loaded

There is also a `getCurrentUser()` function that returns a promise of the current user. This is useful if you want to wait for the user to be loaded before doing anything. You can, for example, await it within a navigation guard:

```ts
router.beforeEach(async () => {
  await getCurrentUser()
})
```

::: tip
If you are using `getCurrentUser()` in a navigation guard, make sure to add it before calling `app.use(router)` as that will trigger the initial navigation.
:::

Once the user is loaded, `getCurrentUser()` will immediately resolve the current user.
