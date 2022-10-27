import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async (nuxtApp) => {
  // TODO: create the plugin that stores the promises with data

  if (process.server) {
    await 2 // TODO: wait for promises to resolve

    // nuxtApp.payload.firebaseState = ...
  } else {
    // hydrate the plugin state from nuxtApp.payload.firebaseState
  }

  return {
    provide: {
      // firebaseApp:
      // firestore
      // database
      // auth
    },
  }
})
