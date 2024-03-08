# Authentication

Nuxt VueFire integrates with [Firebase Authentication](https://firebase.google.com/docs/auth) module to automatically synchronize the current user state on the server and the client. Activate this module by setting the `vuefire.auth.enabled` to `true` in `nuxt.config.ts`:

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

::: warning

If you are using a [global middleware](https://nuxt.com/docs/getting-started/routing#route-middleware), make sure **you are not getting into a redirect loop** by ensuring `navigateTo()` is only called if the target location is not the same page:

```ts{4}
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  // ...
  if (!user && to.path !== '/login') {
    return navigateTo({ path: '/login' })
  }
})
```

:::

You can even automatically handle the auth state by _watching_ the current user. We recommend you do this in either a layout or the `app.vue` component so the watcher is always active:

```vue{8-15}
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

## Customizing your Auth dependencies

You can customize how the auth module is initialized as well:

```ts{5-7}
export default defineNuxtConfig({
  // ...
  vuefire: {
    auth: {
      errorMap: 'debug',
      // disable the poupup redirect resolver dependency
      popupRedirectResolver: false,
      persistence: ['indexedDBLocal']
    },
  },
})
```

By default, the auth module will

- Will use debug error maps for development, and production error maps for production.
- Will use the browser popup redirect resolver dependency (`browserPopupRedirectResolver`).
- Will use the indexedDB local persistence dependency (`indexedDBLocalPersistence` and `browserLocalPersistence`).

See [Firebase Docs](https://firebase.google.com/docs/auth/web/custom-dependencies) for more information.

## Session Cookie

When doing SSR and if a service account is provided, Nuxt VueFire can automatically mint a cookie when the user logs in. This cookie is passed to each request and allows the server to authenticate the user while rendering the page, limiting what the user can see based on their permissions.

In order to use this feature, you must provide a service account and ensure you have the correct permissions set in your Google Cloud project:

- Enable the IAM Service Account Credentials API on the [Google Cloud console](https://console.cloud.google.com/apis/api/iamcredentials.googleapis.com/overview).
- Once activated, add a _specific role_ to your service account. Find the details in [the Firebase documentation](https://firebase.google.com/docs/auth/admin/create-custom-tokens#iam_api_not_enabled).

Then you should enable the session cookie by setting `sessionCookie` to `true` in `nuxt.config.ts`:

```ts{7}
export default defineNuxtConfig({
  // ...
  vuefire: {
    // ensures the auth module is enabled
    auth: {
      enabled: true
      // enables the sessionCookie
      sessionCookie: true
    },
  },
})
```

This is useful in projects that render pages with different permissions based on the user. Otherwise, it's not worth enabling.
