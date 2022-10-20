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

- VueFire requires Firebase JS SDK >= 9 but **is compatible with Vue 2 and Vue 3**. It's currently in alpha, make sure to check [the Roadmap](https://github.com/vuejs/vuefire/issues/1241) and report any issue you find.

:::

## Usage

VueFire expects you to use the existing APIs from Firebase as much as possible. It doesn't expose any configs to initialize your app or get the database/firestore instances. You should follow the official Firebase documentation for that. We do have [some recommendations](#TODO) for a Vue project and [a Nuxt module](#TODO) to help you get started.

Most of the time, you should gather collection references in one of your files and export them but to keep examples short, we will always create the database references whenever necessary. We will also consider that we have access to some globals (you usually import them from the file where you initialize your Firebase app):

```js
import { initializeApp FirebaseApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getAnalytics, type Analytics } from 'firebase/analytics'

export const firebase = initializeApp({
  // ...
})
export const database = getFirestore(firebase)
export const firestore = getDataBase(firebase)
```

:::tip
Note that we will refer to `database` and `firestore` as `db` in examples where only one of them is used.
:::

### Composition API

VueFire exposes a few [composables](https://vuejs.org/guide/reusability/composables.html#composables) to create reactive variables from Firebase references.

You can retrieve a reactive collection or list:

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

In both scenarios, `todos` will be a `ref()` of an array. You can use it as a readonly array, but it will be automatically updated when the data changes anywhere.

You can also retrieve a reactive object/document:

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

const todos = useDocument(doc(db, 'settings', 'some_id'))
</script>
```

</FirebaseExample>

### Options API

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
