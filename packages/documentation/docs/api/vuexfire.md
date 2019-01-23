# Vuexfire API Reference

For all code samples, we will consider a `db` variable is imported as follows:

<FirebaseExample id="db creation">

```js
// Get a RTDB instance
const db = firebase.initializeApp({ databaseURL: 'MY PROJECT URL' }).database()
```

```js
// Get a Firestore instance
const db = firebase.initializeApp({ projectId: 'MY PROJECT ID' }).firestore()
db.settings({ timestampsInSnapshots: true })
```

</FirebaseExample>

## vuefireMutations

Mutations required by vuexfire to work. Must be added **only** at the root level of your store:

```js
import Vuex from 'vuex'
import { vuefireMutations } from 'vuexfire'
const store = new Vuex.Store({
  mutations: {
    // other mutations
    ...vuefireMutations,
  },
})
```

## firestoreAction

Wraps an action to inject [`bindFirestoreRef`](#bindfirestoreref) as well as [`unbindFirestoreRef`](#unbindfirestoreref)

```js
// store/actions.js
import { firestoreAction } from 'vuexfire'

export const setTodosRef = firestoreAction(
  ({ bindFirestoreRef, unbindFirestoreRef }, documentId) => {
    bindFirestoreRef('documents', db.collection('documents').doc(documentId))
    unbindFirestoreRef('documents')
  }
)
```

### bindFirestoreRef

- `bindFirestoreRef(key: string, ref: Query, options?): Promise<Object[]>`
- `bindFirestoreRef(key: string, ref: Document, options?): Promise<Object>`

Binds a collection, Query or Document to a property previously declared in the state, relatively to the module we are on. It unbinds any previouly bound reference with the same `key`.

Returns a Promise that is resolved once the data has been _completely_ fetched and synced into the state. This means, it will wait for any [references](#TODO) inside **any** of the documents bound. By default it stops [at a level 2 nesting](#options)

#### `options`

Can contain the following properties:

- `maxRefDepth`: How many levels of nested references should be automatically bound. Defaults to 2, meaning that References inside of References inside of documents bound with `bindFirestoreRef` will automatically be bound too.

### unbindFirestoreRef

`unbindFirestoreRef(key: string): void`

Unsubscribes from updates for a given key. Leaves the state as-is.

## firebaseAction

Wraps an action to inject [`bindFirebaseRef`](#bindfirebaseref) as well as [`unbindFirebaseRef`](#unbindfirebaseref)

```js
// store/actions.js
import { firebaseAction } from 'vuexfire'

export const setDocument = firebaseAction(
  ({ bindFirebaseRef, unbindFirebaseRef }, documentId) => {
    bindFirebaseRef('documents', db.ref('documents').child(documentId))
    unbindFirebaseRef('documents')
  }
)
```

### bindFirebaseRef

- `bindFirebaseRef(key: string, ref: Query): Promise<Object[]>`
- `bindFirebaseRef(key: string, ref: Document): Promise<Object>`

Binds a collection, Query or Document to a property previously declared in the state, relatively to the module we are on. It unbinds any previouly bound reference with the same `key`. If the current value in the state is an Array, it binds the data as an array, otherwise it binds it as an object.

Returns a promise that is resolved once the data is fetched and the state is in sync.

### unbindFirebaseRef

`unbindFirebaseRef(key: string): void`

Unsubscribes from updates for a given key. Leaves the state as-is.
