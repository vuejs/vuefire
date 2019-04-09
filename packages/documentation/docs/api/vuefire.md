# Vuefire API Reference

For all code samples, we will consider a `db` variable is imported as follows:

<FirebaseExample id="db creation">

```js
// Get a RTDB instance
const db = firebase.initializeApp({ databaseURL: 'MY PROJECT URL' }).database()
```

```js
// Get a Firestore instance
const db = firebase.initializeApp({ projectId: 'MY PROJECT ID' }).firestore()
```

</FirebaseExample>

## firestorePlugin

Vue plugin to add support for the [`firestore` option](#firestore-option) as well [`$bind`](#bind), [`$unbind`](#unbind) and [`$firestoreRefs`](#firestorerefs)

```js
import Vue from 'vue'
import { firestorePlugin } from 'vuefire'

Vue.use(firestorePlugin, options)
```

### options

- `bindName`: name for the [`$bind`](#bind) method added to all Vue components. Defaults to `$bind`.
- `unbindName`: name for the [`$unbind`](#unbind) method added to all Vue components. Defaults to `$unbind`.

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
    finishedTodos: todos.where('finished', '==', true),
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

Programatically binds a collection, document or query to an **existing property** (created in `data`). It's what is called for you when using the [`firestore` option](#firestore-option):

- `this.$bind(key: string, reference: Query, options?): Promise<Object[]>`
- `this.$bind(key: string, reference: Document, options?): Promise<Object>`

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

`$bind` returns a Promise that is resolved once the data has been _completely_ fetched and synced into the state. This means, it will wait for any [references](#TODO) inside **any** of the documents bound. By default it stops [at a level 2 nesting](#options-2)

#### `options`

Object that can contain the following properties:

- `maxRefDepth`: How many levels of nested references should be automatically bound. Defaults to 2, meaning that References inside of References inside of documents bound with `bindFirestoreRef` will automatically be bound too.

## \$unbind

:::miniwarn
This method is only available after [installing `firestorePlugin`](#firestoreplugin)
:::

Unsubscribe from updates for a given key as well as any nested [reference](#TODO) that is being listened to. Also removes the Reference from [`$firestoreRefs`](#firestorerefs)

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

---

## rtdbPlugin

Vue plugin to add support for the [`firebase` option](#firebase-option) as well as [`$rtdbBind`](#rtdbbind), [`$rtdbUnbind`](#rtdbunbind) and [`$firebaseRefs`](#firebaserefs).

```js
import Vue from 'vue'
import { rtdbPlugin } from 'vuefire'

Vue.use(rtdbPlugin, options)
```

### options

- `bindName`: name for the [`$rtdbBind`](#rtdbBind) method added to all Vue components. Defaults to `$rtdbBind`.
- `unbindName`: name for the [`$rtdbUnbind`](#rtdbUnbind) method added to all Vue components. Defaults to `$rtdbUnbind`.

## `firebase` option

:::miniwarn
This option is only available after [installing `rtdbPlugin`](#rtdbplugin)
:::

Provide an object of properties to be bound to a Firebase Reference or Query. Those properties **must be declared** in `data` as well:

```js
new Vue({
  data: {
    todos: [],
    finishedTodos: [],
    currentTodo: null,
  },
  firebase: {
    todos: db.ref('todos'),
    finishedTodos: todos.orderByChild('finished').equalTo(true),
    currentTodo: db.ref('todos/1'),
  },
})
```

:::warning

- Use an empty array `[]` as the initial value for a property that must be bound as an Array
- Use `null` if you want vuefire to bind References as objects

:::

You can also provide a function that returns an object and access local variables:

```js
new Vue({
  data: {
    currentTodo: null,
  },
  firebase() {
    return {
      currentTodo: db.ref('todos/' + this.selectedDocument),
    }
  },
})
```

:::tip
Keep in mind `currentTodo` won't be kept in sync with `selectedDocument`. You will have to use [\$rtdbBind](#rtdbbind) with `watch` property or, if you are using the router, a guard like `beforeRouteUpdate`.
:::

## \$rtdbBind

:::miniwarn
This method is only available after [installing `rtdbPlugin`](#rtdbplugin)
:::

`$rtdbBind` allows you to programatically bind a Reference or query to an **existing property** (created in `data`). It is called for you when you use the [`firebase` option](#firebase-option):

`this.$rtdbBind(key: string, reference: Referenc | Query, options?): Promise<Object | Array>`

Depending on the type of the property, the Reference or Query will be bound as an array or as an object.

```js
const documents = db.ref('documents')

export default {
  props: ['documentId'],
  data: () => ({ currentDocument: null }),
  firebase() {
    return {
      currentDocument: documents.child(this.documentId),
    }
  },
  watch: {
    documentId(id) {
      // $rtdbBind automatically unbinds the previously bound property
      // `currentDocument` will be bound as an object because it's value
      // is not an array
      this.$rtdbBind('currentDocument', documents.child(id))
    },
  },
}
```

`$rtdbBind` returns a Promise that is resolved once the data has been retrieved and synced into the state.

## \$rtdbUnbind

:::miniwarn
This method is only available after [installing `rtdbPlugin`](#rtdbplugin)
:::

Unsubscribes from updates for a given key and removes the given Reference from [`$firebaseRefs`](#firebaserefs)

`this.$rtdbUnbind(key: string): void`

## \$firebaseRefs

:::miniwarn
This property is only available after [installing `rtdbPlugin`](#rtdbplugin)
:::

Dictionary containing References to currently bound References and Queries

```js
const documents = db.ref('documents')
this.$rtdbBind('documents', documents)
this.$firebaseRefs.documents === documents
```
