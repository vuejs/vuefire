# App Check

Nuxt VueFire integrates with [Firebase App Check](https://firebase.google.com/docs/app-check#web) by specifying the `appCheck` option in `nuxt.config.ts`:

```ts{4-10}
export default defineNuxtConfig({
  // ...
  vuefire: {
    appCheck: {
      debug: process.env.NODE_ENV !== 'production',
      isTokenAutoRefreshEnabled: true,
      provider: 'ReCaptchaV3',
      // Find the instructions in the Firebase documentation, link above
      key: '...',
    },
  },
})
```

You can find more information in the [VueFire App Check documentation](/guide/app-check).

## Debug Tokens

Instead of specifying `debug: true`, you can specify a debug token [using Environment variables](https://vuefire.vuejs.org/nuxt/environment-variables.html#AppCheck).
