# Vuefire API Reference

For all code samples, we will consider a `db` variable is imported as follows:

<FirebaseExample id="db creation">

```js
import firebase from 'firebase/app'
import 'firebase/database'

// Get a RTDB instance
const db = firebase.initializeApp({ databaseURL: 'MY PROJECT URL' }).database()
```

```js
import firebase from 'firebase/app'
import 'firebase/firestore'

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
- `serialize`: a function to provide a custom serialization strategy when a
  document from firebase is set on the Vue instance. This allows to customize
  the `id` key, to transform data, ignore or support extra properties [like
  `distance` with Geofirestore](#TODO-cookbook)
- `reset`: global version of [`reset` option](#options-2)
- `wait`: global version of [`wait` option](#options-2)

#### `options.serialize`

The function receives a
[DocumentSnapshot](https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentSnapshot)
as its first argument and is expected to return a plain object to be set on
the Vue Instance. Here is the default function that is used when no override is provided:

```ts
const serialize = (snapshot: firestore.DocumentSnapshot) => {
  // snapshot.data() DOES NOT contain the `id` of the document. By
  // default, Vuefire adds it as a non enumerable property named id.
  // This allows to easily create copies when updating documents, as using
  // the spread operator won't copy it
  return Object.defineProperty(snapshot.data(), 'id', { value: snapshot.id })
}

Vue.use(firestorePlugin, { serialize })
```

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

`$bind` returns a Promise that is resolved once the data has been _completely_ fetched and synced into the state. This means, it will wait for any [references](../vuefire/binding-subscriptions.md#references-firestore-only) inside **any** of the documents bound. By default it stops [at a level 2 nesting](#options-2)

#### `options`

Object that can contain the following properties:

- `maxRefDepth`: How many levels of nested references should be automatically bound. Defaults to 2, meaning that References inside of References inside of documents bound with `$bind` will automatically be bound too.
- `reset`: Allows to define the behavior when a previously bound reference is unbound. Defaults to `true`, which resets the property in the vue instance to `null` for documents and to an empty array `[]` for collections. It can also be set to a function returning a value to customize the value set. Setting it to `false` will keep the data as-is when unbinding.
- `wait`: Waits for the binding to be completely resolved before setting the value in data. This will also force `reset: false` unless `reset` is provided as a function.
- `serialize`: same as [plugin options](#options-serialize)

## \$unbind

:::miniwarn
This method is only available after [installing `firestorePlugin`](#firestoreplugin)
:::

Unsubscribe from updates for a given key as well as any nested [reference](../vuefire/binding-subscriptions.md#references-firestore-only) that is being listened to. Also removes the Reference from [`$firestoreRefs`](#firestorerefs)

`this.$unbind(key: string, reset?: FirestoreOptions['reset']): void`

The `reset` parameter accepts the same values as the property `reset` of [`$bind`'s third paramenter `options`](#options-2).

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
- `serialize`: a function to provide a custom serialization strategy when a
  document from firebase is set on the Vue instance. This allows to customize
  the `id` key, to transform data, etc.
- `reset`: global version of [`reset` option](#options-4)
- `wait`: global version of [`wait` option](#options-4)

#### `options.serialize`

The function receives a
[DataSnapshot](https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot)
as its first argument and is expected to return a plain object to be set on the
Vue instance. Here is the default function that is used when no override is provided:

```ts
const serialize = (snapshot: database.DataSnapshot) => {
  const value = snapshot.val()
  // if the value is a primitive, we create an object instead and assign the .value
  const doc = isObject(value) ? value : Object.defineProperty({}, '.value', { value })
  // you could change `.key` by `id` if you want to be able to write
  Object.defineProperty(doc, '.key', { value: snapshot.key })

  return doc
}

Vue.use(rtdbPlugin, { serialize })
```

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

`this.$rtdbBind(key: string, reference: Reference | Query, options?): Promise<Object | Array>`

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

#### `options`

Object that can contain the following properties:

- `reset`: Allows to define the behavior when a previously bound reference is unbound. Defaults to `true`, which resets the property in the vue instance to `null` for properties bound as objects and to an empty array `[]` for properties bound as arrays. It can also be set to a function returning a value to customize the value set. Setting it to `false` will keep the data as-is when unbinding.
- `wait`: Waits for the binding to be completely resolved before setting the value in data. This will also force `reset: false` unless `reset` is provided as a function.
- `serialize`: Same as [plugin options](#options-serialize-2)

## \$rtdbUnbind

:::miniwarn
This method is only available after [installing `rtdbPlugin`](#rtdbplugin)
:::

Unsubscribes from updates for a given key and removes the given Reference from [`$firebaseRefs`](#firebaserefs)

`this.$rtdbUnbind(key: string, reset?: RTDBOptions['reset']): void`

The `reset` parameter accepts the same values as the property `reset` of [`$rtdbBind`'s third paramenter `options`](#options-4).

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
