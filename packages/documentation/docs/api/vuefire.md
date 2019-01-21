# `vuefire` API Reference

For all code samples, we will consider a `db` variable is imported as follows:

<FirebaseExample id="db creation">
```js
// Get a RTDB instance
const db = firebase
  .initializeApp({ databaseURL: 'YOUR OWN URL' })
  .database()
```
```js
// Get a Firestore instance
const db = firebase.initializeApp({ projectId: 'MY PROJECT ID' }).firestore()
db.settings({ timestampsInSnapshots: true })
```
</FirebaseExample>

## `firestorePlugin` 

Vue plugin to add support for the [`firestore` option](#firestore-option) as well

```js
import Vue from 'vue'
import { firestorePlugin } from 'vuefire'

Vue.use(firestorePlugin, options)
```

### `options`

TODO: add options

## `firestore` option

:::warning
This option is only available after [installing `firestorePlugin`](#firestoreplugin)
:::

Provide an object of properties to be bound to a Firestore Collection, Document or Query:

```js
new Vue({
  firestore: {
    todos: db.collection('todos'),
    finishedTodos: todos.where('finished', '==', false),
    currentTodo: db.collection('todos').doc('1'),
  },
})
```

You can also provide a function that returns an object and access local variables:

```js
new Vue({
  firestore () {
    return {
      currentTodo: db.collection('todos').doc(this.selectedDocument),
    }
  },
})
```

:::tip
Keep in mind `currentTodo` won't be kept in sync with `selectedDocument`. You will have to use [$bind](#bind) with `watch` property or, if you are using the router, a guard like `beforeRouteUpdate`.
:::

## `$bind`

:::warning
This option is only available after [installing `firestorePlugin`](#firestorePlugin)
:::


