# Binding / Subscribing to changes

In Vuexfire, subscriptions to changes are handled transparently. That's why we always talk about _binding_: you only provide the key of the state where to bind, and the _Source_ (Collection, Query or Document), and Vuexfire takes care of the rest!

Once a Reference is bound, Vuexfire will keep the local version synchronized with the remote Database. However, this synchronisation **is only one-way**. Do not modify the local variable (e.g. doing `this.user.name = 'John'`), because (a) it will not change the remote Database and (b) it can be overwritten at any time by Vuexfire. To [write changes to the Database](./writing-data.md), use the Firebase JS SDK.

## Binding in actions

**The right place to bind references is in actions**. This will also simplify your testing strategy if you choose to mock the store with something like [vuex-mock-store](https://github.com/posva/vuex-mock-store) and also keep writes in actions, you won't have to worry about mocking Firebase database at all in most scenarios. Because of this, Vuexfire provides an action wrapper that injects into the _context_ (first parameter of actions) two new functions: `bindFirestoreRef`/`bindFirebaseRef` and `unbindFirestoreRef`/`unbindFirebaseRef`. That way you can bind a reference as well as unbind existing bindings directly in actions:

<FirebaseExample>

```js
// store.js
import Vuex from 'vuex'
import { vuexfireMutations, firebaseAction } from 'vuexfire'
import { db } from './db'

export default new Vuex.Store({
  state: {
    todos: [],
  },

  mutations: vuexfireMutations,

  actions: {
    bindTodos: firebaseAction(({ bindFirebaseRef }) => {
      // return the promise returned by `bindFirebaseRef`
      return bindFirebaseRef('todos', db.ref('todos'))
    }),
  },
})
```

```js
// store.js
import Vuex from 'vuex'
import { vuexfireMutations, firestoreAction } from 'vuexfire'
import { db } from './db'

export default new Vuex.Store({
  state: {
    todos: [],
  },

  mutations: vuexfireMutations,

  actions: {
    bindTodos: firestoreAction(({ bindFirestoreRef }) => {
      // return the promise returned by `bindFirestoreRef`
      return bindFirestoreRef('todos', db.collection('todos'))
    }),
  },
})
```

</FirebaseExample>

:::warning

It's necessary to declare properties with their initial values in `state`. **For the RTDB, using an _Array_ as the initial value will bind the Reference as an array, otherwise it is bound as an object**. For Firestore, collections and queries are bound as arrays while documents are bound as objects.

:::

:::tip

Always return or `await` the promise returned by `bindFirestoreRef`/`bindFirebaseRef` since it lets you know when your state is filled with data coming from the database. This is very useful [when dealing with SSR](../cookbook/ssr.md)

:::

## Unbinding

To stop the state to be in sync, you can manually do so with `unbindFirestoreRef`/`unbindFirebaseRef`:

<FirebaseExample>

```js
// store.js
export default new Vuex.Store({
  // other store options are omitted for simplicity reasons

  actions: {
    unbindTodos: firebaseAction(({ unbindFirebaseRef }) => {
      unbindFirebaseRef('todos')
    }),
  },
})
```

```js
// store.js
export default new Vuex.Store({
  // other store options are omitted for simplicity reasons

  actions: {
    unbindTodos: firestoreAction(({ unbindFirestoreRef }) => {
      unbindFirestoreRef('todos')
    }),
  },
})
```

</FirebaseExample>

When unbinding, there is no need to wait for a promise, all listeners are teared down. By default, data **will be reset**, you can customize by providing a second argument to the `unbindFirebaseRef`/`unbindFirestoreRef` function:

<!-- TODO: most of the time useless without wait option, specially for arrays? or will wait make reset non necessary? -->

<FirebaseExample>

```js
// store.js
export default new Vuex.Store({
  // other store options are omitted for simplicity reasons

  actions: {
    someAction: firebaseAction(({ state, bindFirebaseRef, unbindFirebaseRef }) => {
      unbindFirebaseRef('todos')
      // or
      unbindFirebaseRef('todos', true)
      // state.todos === []

      // using the boolean version
      unbindFirebaseRef('todos', false)
      // state.todos === [{ text: 'Use Firestore Refs' }]

      // using the function syntax
      unbindFirebaseRef('todos', () => [{ text: 'placeholder' }])
      // state.todos === [{ text: 'placeholder' }]

      // documents are reset to null instead, you can also provide the same options as above
      unbindFirebaseRef('doc')
      // state.doc === null
    }),
  },
})
```

```js
// store.js
export default new Vuex.Store({
  // other store options are omitted for simplicity reasons

  actions: {
    someAction: firestoreAction(({ state, bindFirestoreRef, unbindFirestoreRef }) => {
      unbindFirestoreRef('todos')
      // or
      unbindFirestoreRef('todos', true)
      // state.todos === []

      // using the boolean version
      unbindFirestoreRef('todos', false)
      // state.todos === [{ text: 'Use Firestore Refs' }]

      // using the function syntax
      unbindFirestoreRef('todos', () => [{ text: 'placeholder' }])
      // state.todos === [{ text: 'placeholder' }]

      // documents are reset to null instead, you can also provide the same options as above
      unbindFirestoreRef('doc')
      // state.doc === null
    }),
  },
})
```

</FirebaseExample>

## Binding over existing bindings

When calling `bindFirestoreRef`/`bindFirebaseRef` to bind a collection or document over an existing binding, **it isn't necessary to call `unbindFirestoreRef`/`unbindFirebaseRef`**, it's automatically done for you.

By default, values are reset but this behaviour can be customized with the [`reset` option](../api/vuexfire.md#options):

<FirebaseExample>

```js
// store.js
export default new Vuex.Store({
  // other store options are omitted for simplicity reasons

  actions: {
    someAction: firebaseAction(({ state, bindFirebaseRef, unbindFirebaseRef }) => {
      // will keep the previous value
      bindFirebaseRef('todos', { reset: false })
    }),
  },
})
```

```js
// store.js
export default new Vuex.Store({
  // other store options are omitted for simplicity reasons

  actions: {
    someAction: firestoreAction(({ state, bindFirestoreRef, unbindFirestoreRef }) => {
      // will keep the previous value
      bindFirestoreRef('todos', { reset: false })
    }),
  },
})
```

</FirebaseExample>

## Using the data bound by Vuexfire

### `.key` / `id`

Any document bound by Vuexfire will retain it's _id_ in the database as a non-enumerable, read-only property. This makes it easier to [write changes](./writing-data.md#updates-to-collection-and-documents) and allows you to only copy the data using the [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#Spread_in_object_literals) or [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign).

<FirebaseExample>

```js
store.state.user['.key'] // -KguCoSMemQZw3JD6EPh
// the id is non enumerable
Object.keys(store.state.user).includes('.key') // false

// it originally comes from the `key` attribute
db.ref('users/ada').key // 'ada'
// More at https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#key
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#key
```

```js
store.state.user.id // jORwjIykFn1NmkdzTkhU
// the id is non enumerable
Object.keys(store.state.user).includes('id') // false

// it originally comes from the `id` attribute
db.collection('users').doc('ada').id // 'ada'
// More at https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#key
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#key
```

</FirebaseExample>

### Geopoints (Firestore only)

In Firestore you can store [Geopoints](https://firebase.google.com/docs/reference/js/firebase.firestore.GeoPoint). They are retrieved as-is by Vuexfire, meaning that you can directly use methods like `isEqual` and access its properties `latitude` and `longitude`.

> Refer to [Easy access to Firebase database](./getting-started.md#easy-access-to-firebase-database) to retrieve the `Geopoint` class

<FirebaseExample disable="0">

```js
// Geopoints do not exist in RTDB
```

```js
import { GeoPoint } from './db'

// add Paris to the list of cities and wait for the operation
// to be finished
await db.collection('cities').add({
  name: 'Paris',
  location: new GeoPoint(48.8588377, 2.2770206),
})

// we consider `cities` to be bound to current component
// we retrieve Paris that was just added
const paris = store.state.cities[this.cities.length - 1]
paris.location.latitude // 48.8588377
paris.location.longitude // 2.2770206
```

</FirebaseExample>

<!-- Read more about [writing Geopoints to the database](./writing-data.md#geopoints) in the [writing data](./writing-data.md) section. -->

### Timestamps (Firestore only)

In Firestore you can store [Timestamps](https://firebase.google.com/docs/reference/js/firebase.firestore.Timestamp). They are stored as-is by Vuexfire, meaning that you can directly use methods like `isEqual`, `toDate` and access its properties `seconds` and `nanoseconds`.

> Refer to [Easy access to Firebase database](./getting-started.md#easy-access-to-firebase-database) to retrieve the `Timestamp` class

<FirebaseExample disable="0">

```js
// Timestamps do not exist in RTDB
```

```js
import { Timestamp } from './db'

// Add "La prise de la Bastille" to a list of events
// and wait for th operation to be finished
await db.collection('events').add({
  name: 'Prise de la Bastille',
  date: Timestamp.fromDate(new Date('1789-07-14')),
})

// we consider `events` to be bound to current component
// we retrieve the event we just added
const prise = store.state.events[this.events.length - 1]
prise.date.seconds // -5694969600
prise.date.nanoseconds // 0
prise.toDate() // Tue Jul 14 1789
```

</FirebaseExample>

<!-- Read more about [writing Timestamps to the database](./writing-data.md#timestamps) in the [writing data](./writing-data.md) section. -->

### References (Firestore only)

In Firestore you can store [References](https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference) to other Documents in Documents. Vuexfire automatically bind References found in Collections and documents. This also works for nested references (References found in bound References). By default, Vuexfire will stop at that level (2 level nesting).

Given some _users_ with _documents_ that are being viewed by other _users_. This could be **users/1**:

```js
{
  name: 'Jessica',
  documents: [
    db.collection('documents').doc('gift-list'),
  ],
}
```

`documents` is an array of References. Let's look at the document identified by `gift-list`:

```js
{
  content: '...',
  sharedWith: [
    db.collection('users').doc('2'),
    db.collection('users').doc('3'),
  ]
}
```

`sharedWith` is also an array of References, but those references are users. Users also contain references to documents, therefore, if we automatically bind every nested reference, we could end up with an infinite-memory-consumming binding. By default, if we bind `users/1` with Vuexfire, this is what we end up having:

```js
{
  name: 'Jessica',
  documents: [
    {
      content: '...',
      sharedWith: [
        {
          name: 'Alex',
          documents: [
            'documents/alex-todo-list',
          ]
        },
        {
          name: 'Robin',
          documents: [
            'documents/robin-todo-list',
            'documents/robin-book',
          ],
        },
      ],
    },
  ],
}
```

`documents.sharedWith.documents` end up as arrays of strings. Those strings can be passed to `db.doc()` as in `db.doc('documents/robin-book')` to get the actual reference to the document. By being a string instead of a Reference, it is possibe to display a bound document with Vuexfire as plain text.

It is possible to customize this behaviour by providing a [`maxRefDepth` option](../api/vuexfire.md#options) when invoking `$bind`:

```js
// override the default value of 2 for maxRefDepth
bindFirestoreRef('user', db.collection('users').doc('1'), { maxRefDepth: 1 })
```

Read more about [writing References to the database](./writing-data.md#references) in the [writing data](./writing-data.md) section.
