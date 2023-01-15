# Nuxt.js

::: warning
The Nuxt module and this docs are a WIP. Things might not work yet.
:::

## Installation

```bash
npm install nuxt-vuefire
```

Additionally, if you are using [SSR](https://nuxt.com/docs/api/configuration/nuxt-config/#ssr), you need to install `firebase-admin` and some other peer dependencies:

```bash
npm install firebase-admin @firebase/@app-types
```

## Configuration

Next, add `nuxt-vuefire` to the `modules` section of `nuxt.config.js` and configure it with the credentials created in your app settings in your project overview (`https://console.firebase.google.com/project/YOUR_PROJECT_NAME/overview)`. You can find more details [in Firebase Documentation](https://firebase.google.com/docs/web/setup#create-project). It should look something like this:

```ts
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

```ts
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
