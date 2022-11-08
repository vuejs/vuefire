# Upgrading to VueFire v3

VueFire v2 and VueFire v3 have a lot in common but a big improvement to the Vue.js Ecosystem happened between them: the Composition API. On top of that, Firebase SDK itself evolved a lot. VueFire v3 is built on top of the Composition API to provide an idiomatic way to use Firebase with Vue.js that works with **both Vue 2 and Vue 3**. This means that if you are still on Vue 2, as long as you are **using Vue 2.7**, you can upgrade to VueFire v3 and use the Composition API or the Options API. It also relies on the new Firebase SDK v9 which provides a modular API that greatly improves the final size of your application.

Therefore, these are the requirements to upgrade to VueFire v3:

- Use Vue 2.7 or higher
- Use Firebase SDK v9 or higher

## General recommendations

VueFire 3 introduces a Composition API that is more flexible and powerful than the Options API. It keeps the existing Options API as a wrapper around the Composition API but we recommend you to give the Composition API a try as it gives you more control over your data state.

## Breaking changes

### Removal of `serialize` option for Firestore

Firestore support a native equivalent of the `serialize` option: [Firestore Data Converter](https://firebase.google.com/docs/firestore/query-data/get-data#custom_objects). You can use it to convert your data to a class instance. This is the recommended way to use Firestore with VueFire **and make it typesafe**.

## Vuexfire

:::tip
If you are using [Pinia](https://pinia.vuejs.org/), make sure to check the [Pinia guide](./subscriptions-external.md#pinia) instead.
:::

As of VueFire 3, Vuexfire doesn't have an exact replacement. This is because the Composition API allows us to have the same functionality without the need for a plugin.

TODO: example
