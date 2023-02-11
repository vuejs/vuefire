# Nuxt.js

::: warning
The Nuxt VueFire module is still a work in progress and it might contain breaking changes in the future. If you find any issues, please open an issue on GitHub.
:::

## Installation

```bash
yarn add vuefire nuxt-vuefire
# or
npm install vuefire nuxt-vuefire
```

Additionally, if you are using [SSR](https://nuxt.com/docs/api/configuration/nuxt-config/#ssr), you need to install `firebase-admin` and its peer dependencies:

```bash
yarn add firebase-admin @firebase/app-types
# or
npm install firebase-admin @firebase/app-types
```

## Configuration

Next, add `nuxt-vuefire` to the `modules` section of `nuxt.config.js` and configure it with the credentials created in your app settings in your project overview (`https://console.firebase.google.com/project/YOUR_PROJECT_NAME/overview)`. You can find more details [in Firebase Documentation](https://firebase.google.com/docs/web/setup#create-project). It should look something like this:

```ts{4,7-15}
export default defineNuxtConfig({
  modules: [
    // ... other modules
    'nuxt-vuefire',
  ],

  vuefire: {
    config: {
      apiKey: '...',
      authDomain: '...',
      projectId: '...',
      appId: '...',
      // there could be other properties depending on the project
    },
  },
})
```

If you are using SSR with any auth related feature, you will need to create a [service account](https://firebase.google.com/support/guides/service-accounts) and provide a path to the credentials file in the `serviceAccount` property:

```ts{5}
export default defineNuxtConfig({
  vuefire: {
    // ...
    admin: {
      serviceAccount: 'path/to/credentials.json',
    }
  },
})
```

:::tip
This service account file contains sensitive information and should **not be committed to your repository**.
:::

### Additional configuration

If you are using the [Authentication](https://firebase.google.com/docs/auth) module or [AppCheck](https://firebase.google.com/docs/app-check), make sure to enable them as well:

```ts{3-14}
export default defineNuxtConfig({
  // ...
  vuefire: {
    // ensures the auth module is enabled
    auth: true,
    appCheck: {
      // Allows you to use a debug token in development
      debug: process.env.NODE_ENV !== 'production',
      isTokenAutoRefreshEnabled: true,
      provider: 'ReCaptchaV3',
      // Find the instructions in the Firebase documentation, link above
      key: '...',
    },
  },
})
```

## Auto imports

Nuxt VueFire will automatically import the most commonly used functions of `vuefire` so you don't even need to import them in your components ✨.
