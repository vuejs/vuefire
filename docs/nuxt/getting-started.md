# Nuxt.js

::: warning
The Nuxt VueFire module is still a work in progress and it might contain breaking changes in the future. If you find any issues, please open an issue on GitHub.
:::

## Installation

::: code-group

```sh [pnpm]
pnpm install vuefire nuxt-vuefire firebase
```

```sh [yarn]
yarn add vuefire nuxt-vuefire firebase
```

```sh [npm]
npm install vuefire nuxt-vuefire firebase
```

:::

Additionally, if you are using [SSR](https://nuxt.com/docs/api/configuration/nuxt-config/#ssr), you need to install `firebase-admin` and its peer dependencies:

::: code-group

```sh [pnpm]
pnpm install firebase-admin firebase-functions @firebase/app-types
```

```sh [yarn]
yarn add firebase-admin firebase-functions @firebase/app-types
```

```sh [npm]
npm install firebase-admin firebase-functions @firebase/app-types
```

:::

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

### Configuring the Admin SDK

If you are using SSR with any auth related feature, you will need to create a [service account](https://firebase.google.com/support/guides/service-accounts) and provide its content as an _environment variable_ named `GOOGLE_APPLICATION_CREDENTIALS`.

In local development it's more convenient to put the `service-account.json` file alongside other files and refer to its path in the environment variable:

```dotenv
GOOGLE_APPLICATION_CREDENTIALS=service-account.json
```

:::tip
This service account file contains sensitive information and should **not be committed to your repository**. Make sure to exclude it from your version control system:

```sh
echo service-account.json >> .gitignore
```

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
