# Nuxt.js

::: warning
The Nuxt module and this docs are a WIP. Things might not work yet.
:::

Install

```bash
npm install nuxt-vuefire
```

Add it to your nuxt config:

```ts
import { defineNuxtConfig } from 'nuxt/config'
import VueFire from 'nuxt-vuefire'

export default defineNuxtConfig({
  modules: [VueFire, {
    /* options */
  }],
})
```
