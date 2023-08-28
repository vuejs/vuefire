# Authentication

Nuxt VueFire integrates with [Firebase Authentication](https://firebase.google.com/docs/auth) module to automatically synchronize the current user state on the server and the client. Activate this module by setting the `vuefire.auth` to `true` in `nuxt.config.ts`:

```ts{5-7}
export default defineNuxtConfig({
  // ...
  vuefire: {
    // ensures the auth module is enabled
    auth: {
      enabled: true
    },
    config: {
      // ...
    }
  },
})
```

You can access the current user with the `useCurrentUser()` composable within any component:

```vue{2}
<script setup>
const user = useCurrentUser()
</script>
```

You can also await for the user to be ready in route middleware and other async functions with `getCurrentUser()`. For example, you can create a custom route middleware that only allows authenticated users to access a route:

```ts
// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = await getCurrentUser()

  // redirect the user to the login page
  if (!user) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    })
  }
})
```

You can then enable this middleware on any page in the `pages/` directory:

```vue{2-4}
<script setup>
definePageMeta({
  middleware: ['auth'],
})
</script>
```

You can even automatically handle the auth state by _watching_ the current user. We recommend you do this in either a layout or the `app.vue` component so the watcher is always active:

```vue
<script setup>
const router = useRouter()
const route = useRoute()
const user = useCurrentUser()

// we don't need this watcher on server
onMounted(() => {
  watch(user, (user, prevUser) => {
    if (prevUser && !user) {
      // user logged out
      router.push('/login')
    } else if (user && typeof route.query.redirect === 'string') {
      // user logged in
      router.push(route.query.redirect)
    }
  })
})
</script>
```

## Session Cookie

When doing SSR and if a service account is provided, Nuxt VueFire automatically mints a cookie when the user logs in. This cookie is passed to each request and allows the server to authenticate the user while rendering the page, limiting what the user can see based on their permissions.

In order to use this feature, you must provide a service account and ensure you have the correct permissions set in your Google Cloud project. I recommend you to take a look at [this template and its instructions to setup Authentication](https://github.com/posva/nuxt--vuefire-example-blaze-plan#authentication).

```ts{7}
export default defineNuxtConfig({
  // ...
  vuefire: {
    // ensures the auth module is enabled
    auth: {
      enabled: true
      sessionCookie: true
    },
  },
})
```
