# Vuefire API Reference

For all code samples, we will consider a `db` variable is imported as follows:

<FirebaseExample id="db creation">

```js
// Get a RTDB instance
const db = firebase.initializeApp({ databaseURL: 'YOUR OWN URL' }).database()
```

```js
// Get a Firestore instance
const db = firebase.initializeApp({ projectId: 'MY PROJECT ID' }).firestore()
db.settings({ timestampsInSnapshots: true })
```

</FirebaseExample>

## firestorePlugin

Vue plugin to add support for the [`firestore` option](#firestore-option) as well

```js
import Vue from 'vue'
import { firestorePlugin } from 'vuefire'

Vue.use(firestorePlugin, options)
```

### options

TODO: add options

## `firestore` option

:::miniwarn
This option is only available after [installing `firestorePlugin`](#firestoreplugin)
:::

Provide an object of properties to be bound to a Firestore Collection, Document or Query. Those properties **must be declared** in `data` as well:

```js
new Vue({
  data: {
    todos: [],
    finishedTodos: [],
    currentTodo: null,
  },
  firestore: {
    todos: db.collection('todos'),
    finishedTodos: todos.where('finished', '==', false),
    currentTodo: db.collection('todos').doc('1'),
  },
})
```

:::tip

- Use an empty array `[]` as the initial value for a property holding a collection or query so `v-for` always work
- Use `null` for documents so you can wrap a `v-if` around to skip the inner rendering process and errors like _Cannot read property "name" of null_

:::

You can also provide a function that returns an object and access local variables:

```js
new Vue({
  data: {
    todos: [],
    finishedTodos: [],
    currentTodo: null,
  },
  firestore() {
    return {
      currentTodo: db.collection('todos').doc(this.selectedDocument),
    }
  },
})
```

:::tip
Keep in mind `currentTodo` won't be kept in sync with `selectedDocument`. You will have to use [\$bind](#bind) with `watch` property or, if you are using the router, a guard like `beforeRouteUpdate`.
:::

## \$bind

:::miniwarn
This method is only available after [installing `firestorePlugin`](#firestoreplugin)
:::

`$bind` allows you to programatically bind a collection, document or query to an **existing property** (created in `data`). It's what is called for you when using the [`firestore` option](#firestore-option):

`this.$bind(key: string, reference: Query | Document, options?): Promise<Object | Array>`

```js
const documents = db.collection('documents')

export default {
  props: ['documentId'],
  data: () => ({ currentDocument: null }),
  firestore() {
    return {
      currentDocument: documents.doc(this.documentId),
    }
  },
  watch: {
    documentId(id) {
      // $bind automatically unbinds the previously bound property
      this.$bind('currentDocument', documents.doc(id))
    },
  },
}
```

`$bind` returns a Promise that is resolved once the data has been _completely_ fetched and synced into the state. This means, it will wait for any [references](#TODO) inside **any** of the documents bound. By default it stops at a level 2 nesting

## \$unbind

:::miniwarn
This method is only available after [installing `firestorePlugin`](#firestoreplugin)
:::

Unsubscribe from updates for a given key as well as any nested [reference](#TODO) that is being listened to.

`this.$unbind(key: string): void`

## \$firestoreRefs

:::miniwarn
This property is only available after [installing `firestorePlugin`](#firestoreplugin)
:::

Dictionary containing currently bound collections, queries or documents

```js
const documents = db.collection('documents')
this.$bind('documents', documents)
this.$firestoreRefs.documents === documents
```

<!-- TODO should extract the ref when using a query -->
