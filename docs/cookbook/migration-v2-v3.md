# Upgrading to VueFire v3

VueFire v2 and VueFire v3 have a lot in common but a big improvement to the Vue.js Ecosystem happened between them: the Composition API. On top of that, Firebase SDK itself evolved a lot. VueFire v3 is built on top of the Composition API to provide an idiomatic way to use Firebase with Vue.js that works with **both Vue 2 and Vue 3**. This means that if you are still on Vue 2, as long as you are **using Vue 2.7**, you can upgrade to VueFire v3 and use the Composition API or the Options API. It also relies on the new Firebase SDK v9 which provides a modular API that greatly improves the final size of your application. Therefore, these are the requirements to upgrade to VueFire v3:

- Use Vue 2.7 or higher
- Use Firebase SDK v9 or higher

## Vuexfire
