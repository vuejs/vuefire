# Getting Started

Before using VueFire, make sure you have a Firebase account and a project setup by following the instructions at _[Create a Cloud Firestore project](https://firebase.google.com/docs/firestore/quickstart)_. Keep in mind there are two different databases: _Database_ and _Firestore_. If you have never read about them, you should first read _[Choose a Database](https://firebase.google.com/docs/database/rtdb-vs-firestore)_ in Firebase documentation. VueFire supports using one or both database on the same project. Throughout the docs you will often find snippets showing both, _Database_(<RtdbLogo width="24" style="display: inline; fill: currentColor;" />) and _Firestore_ (<FirestoreLogo height="24" style="display: inline; fill: currentColor;" />) examples. Click on them to switch code samples, they are often very similar.

## Installation

In order to get started make sure to install the latest version of `vuefire` as well as `firebase`:

```sh
yarn add vuefire@next firebase
# or
npm install vuefire@next firebase
```

:::warning

VueFire requires Firebase JS SDK >= 9 but **is compatible with Vue 2 and Vue 3**. It's currently in alpha, make sure to check [the Roadmap](https://github.com/vuejs/vuefire/issues/1241) and report any issue you find.

:::

## Usage

VueFire expects you to use the existing APIs from Firebase as much as possible. It doesn't expose any configs to initialize your app or get the database/firestore instances. You should follow the official Firebase documentation for that. We do have [some recommendations](#TODO) for a Vue project and [a Nuxt module](../cookbook/nuxt.md) to help you get started.

Most of the time, you should gather collection references in one of your files and export them but **to keep examples short, we will always create the database references whenever necessary** instead of gathering them in one place. We will also consider that we have access to some globals (you usually import them from the file where you initialize your Firebase app):

```js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
// ... other firebase imports

export const firebaseApp = initializeApp({
  // your application settings
})
export const database = getFirestore(firebase)
export const firestore = getDataBase(firebase)
// ... other firebase exports
```

:::tip
Note that we will refer to `database` and `firestore` as `db` in examples where only one of them is used.
:::

### Setup

First, install the VueFire Vue plugin. It will allow you to add extra modules like [Storage](./storage.md) or [Auth](./auth.md) to your app.

```ts
import { createApp } from 'vue'
import { VueFire, VueFireAuth } from 'vuefire'
import App from './App.vue'
// the file we created above with `database`, `firestore` and other exports
import { firebaseApp } from './firebase'

const app = createApp(App)
app
  .use(VueFire, {
    // imported above but could also just be created here
    firebaseApp,
    modules: [
      // we will see other modules later on
      VueFireAuth(),
    ],
  })

app.mount('#app')
```

### Composition API

VueFire exposes a few [composables](https://vuejs.org/guide/reusability/composables.html#composables) to create reactive variables from Firebase references.

#### Collections/Lists

You can retrieve a reactive collection (Firestore) or list (Realtime Database) with the `useCollection()`/`useList()` composable:

<FirebaseExample>

```vue
<script setup>
import { useList } from 'vuefire'
import { ref as dbRef } from 'firebase/database'

const todos = useList(dbRef(db, 'todos'))
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
     <span>{{ todo.text }}</span>
    </li>
  </ul>
</template>
```

```vue
<script setup>
import { useCollection } from 'vuefire'
import { collection } from 'firebase/firestore'

const todos = useCollection(collection(db, 'todos'))
</script>

<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
     <span>{{ todo.text }}</span>
    </li>
  </ul>
</template>
```

</FirebaseExample>

In both scenarios, `todos` will be a `ref()` of an array. Note **this is a readonly array**, but it will be automatically updated when the data changes anywhere.

If you want to change the data, you should use the Firebase API (e.g. `addDoc()`, `updateDoc()`, `push()` etc) to update the data:

- [Firestore Documentation](https://firebase.google.com/docs/firestore/manage-data/add-data)
- [Realtime Database Documentation](https://firebase.google.com/docs/database/web/read-and-write)

#### Documents/Objects

Similarly, you can retrieve a reactive document (Firestore) or object (Realtime Database) with the `useDocument()`/`useObject()` composable:

<FirebaseExample>

```vue
<script setup>
import { useObject } from 'vuefire'
import { ref as dbRef } from 'firebase/database'

const settings = useObject(dbRef(db, 'settings', 'some_id'))
</script>
```

```vue
<script setup>
import { useDocument } from 'vuefire'
import { doc } from 'firebase/firestore'

const settings = useDocument(doc(db, 'settings', 'some_id'))
</script>
```

</FirebaseExample>

In both scenarios, `settings` becomes a reactive object. Note **this is a readonly object**, but it will be automatically updated when the data changes anywhere.

If you want to change the data, you should use the Firebase API (e.g. `setDoc()`, `updateDoc()`, `set()` etc) to update the data:

- [Firestore Documentation](https://firebase.google.com/docs/firestore/manage-data/add-data)
- [Realtime Database Documentation](https://firebase.google.com/docs/database/web/read-and-write)

### Options API

TODO: complete this section. The composition API is the recommended way to use VueFire at the moment because its API is more stable and it's easier to use with TypeScript.

VueFire can also be used with the Options API, while less flexible, it's still a valid way to use VueFire. First, you need to install the options plugin:

- Install `firestorePlugin` to use _Firestore_
- Install `databasePlugin` to use Firebase _Database_

<FirebaseExample>

```js
import { createApp } from 'vue'
import { databasePlugin } from 'vuefire'

const app = createApp(App)
app.use(databasePlugin)
```

```js
import { createApp } from 'vue'
import { firestorePlugin } from 'vuefire'

const app = createApp(App)
app.use(firestorePlugin)
```

</FirebaseExample>

### Which API should I use?

The composition API is the recommended way to use VueFire. At the moment its API is more stable and it's easier to use with TypeScript. However, the Options API is still a valid way to use VueFire. The main difference is that the Options API is more verbose and requires you to install the plugin, also being slightly heavier than the composables.
