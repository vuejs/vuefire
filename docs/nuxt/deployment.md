# Deployment

> This section is a work in progress.

## Spark plan

The Spark plan is a free plan that enable most of firebase services. With this plan, you want to **prerender your app and deploy it as a static site**. In order to do this, make sure **not to apply the Firebase preset** when bundling your app and to use the `generate` command:

```sh
nuxt generate
```

You can then let your CI deploy your app to Firebase or do it manually:

```sh
firebase deploy
```

Note that this requires `ssr: true` in your `nuxt.config.ts` but you can also use `ssr: false` and deploy your Nuxt app as a Single Page Application to Firebase Hosting. In that case you should run `nuxt build` instead of `nuxt generate` as the latter requires SSR.

## Blaze plan

::: warning
The Firebase preset is still experimental. It is not recommended to use it in production.
:::

The Blaze plan is a pay-as-you-go that allows you to run Firebase Functions. **It is free up to a certain amount of requests**. With this plan, you can either do the same as with the [Spark plan](#spark-plan) (cheaper) or build with the Firebase preset and deploy your app as a serverless function:

```sh
NITRO_PRESET=firebase nuxt build
```

alternatively, you can use the `nitro.preset` option in your `nuxt.config.ts`, which will only be applied during builds.

```ts{3}
export default defineNuxtConfig({
  nitro: {
    preset: 'firebase',
  },
  // ...
})
```

### Route Rules

On top of prerendering any routes, you can also use [the `routeRules` option](https://nuxt.com/docs/guide/concepts/rendering#hybrid-rendering) to apply any headers like cache options, redirects or even static rendering.

It is recommended **not to SSR** every route in your application. Instead, you should only SSR or SSG (generate at build) the routes that are critical for SEO and performance. For example, you can SSG the homepage and the product pages, but not the cart page or the admin dashboard. Here is an example of a `routeRules` configuration:

```ts
// nuxt.config.ts
defineNuxtConfig({
  routeRules: {
    // Homepage pre-rendered at build time
    '/': { prerender: true },
    // Product page generated on-demand, revalidates in background
    '/products/**': { swr: true },
    // Blog post generated on-demand once until next deploy
    '/blog/**': { isr: true },
    // Admin dashboard renders only on client-side
    '/admin/**': { ssr: false },
  },
  // ...
})
```

### Custom Nitro Preset

To customize the Firebase functions configuration, it's recommended to create your own _nitro preset_ instead of using the `firebase` preset.

Create a `preset` folder with two files:

::: code-group

```ts [preset/entry.ts]
import '#internal/nitro/virtual/polyfill'
import { onRequest } from 'firebase-functions/v2/https'

const nitroApp = useNitroApp()
const config = useRuntimeConfig()

// you might need to name this function differently
// if you have other functions deployed
export const server = onRequest(
  {
    // You can set the region and other options here
  },
  toNodeListener(nitroApp.h3App)
)
```

```ts [preset/nitro.config.ts]
import { fileURLToPath } from 'node:url'
import type { NitroPreset } from 'nitropack'

export default {
  extends: 'firebase',
  entry: fileURLToPath(new URL('./entry.ts', import.meta.url)),
} satisfies NitroPreset
```

:::

Then set the `nitro.preset` in your `nuxt.config.ts`, this will only be used during the build process:

```ts{3}
export default defineNuxtConfig({
  nitro: {
    preset: './preset',
  },
  // ...
})
```

Make sure you **don't have** a `nitro.preset` option set in your `nuxt.config.ts` file.
