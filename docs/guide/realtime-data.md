# Realtime Data

::: info
If you are looking for the VueFire Options API guide, make sure to **also check** the [dedicated page](./options-api-realtime-data.md). This page still includes a more information than the Options API page, which focuses more on its syntax.
:::

In VueFire, subscriptions to data changes are handled transparently. That's why we always talk about _binding_: you only provide the _data source_ (Collection, Query or Document), and VueFire takes care of the rest!

When using Firebase Database and Firestore, you can either retrieve the data once or _subscribe_ to changes with methods like `onSnapshot()` and `onValue()`. VueFire will automatically handle the subscription for you, and update the data when it changes by internally using these functions, greatly simplifying the whole process of connecting your Vue Data to the realtime data from Firebase. It exposes a few [composables](https://vuejs.org/guide/reusability/composables.html#composables) to create these realtime bindings, it's important to note that, like other composables, these functions are meant to be used within a `setup()` function or a `<script setup>`. You can still use them outside of these contexts for advanced scenarios [like Vuex/Pinia](../cookbook/subscriptions-external.md) or global bindings but we will focus on the most common use case here. You can also use the [Options API equivalent](./options-api-realtime-data.md), in this section of the docs we will focus on the Composition API version and give you the equivalent for the Options API.

## Declarative realtime data

Use the `useCollection()`, `useDatabaseList()`, `useDocument()`, and `useDatabaseObject()` composables to create a realtime data connected to Firestore and/or a Realtime Database. These functions take a source reference to a Collection, Query, or Document. They also accept reactive versions of these as `ref()` or `computed()`:

<FirebaseExample>

```vue
<script setup>
import { useDatabaseList, useDatabaseObject } from 'vuefire'
import { ref as dbRef } from 'firebase/database'

const todos = useDatabaseList(dbRef(db, 'todos'))
const someTodo = useDatabaseObject(dbRef(db, 'todos', 'someId'))
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
const someTodo = useDocument(doc(collection(db, 'todos'), 'someId'))
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

Each of these composables return a Vue `Ref` containing the data. Note **this is a readonly data**, you shouldn't mutate it directly, you should instead [use the Firebase SDK](./writing-data.md). VueFire will automatically keep the data in sync with the database.

Sometimes, you need to start observing a different document or collection, let's say you have a _collection_ of contacts and that you display a specific contact based on the URL, e.g. displaying the contact with an id equal to `24` on `/contacts/24`, you can achieve this by passing a _reactive variable of the data source_ to the `useDocument()`, `useDatabaseObject()`, etc composables:

<FirebaseExample>

```ts
const route = useRoute()
// since route is reactive, `contactSource` will be reactive too
const contactSource = computed(() => dbRef(db, 'contacts/' + route.params.id))
// contact will always be in sync with the data source
const contact = useDatabaseObject(contactSource)
```

```ts
const route = useRoute()
// since route is reactive, `contactSource` will be reactive too
const contactSource = computed(() =>
  doc(collection(db, 'contacts'), route.params.id)
)
// contact will always be in sync with the data source
const contact = useDocument(contactSource)
```

</FirebaseExample>

This way, when the route changes, the document will be updated to the new one, automatically unsubscribing from the previous one and subscribing to the new one.

::: tip

`contactSource` can either be a _getter_, a `computed()`, or a `ref()`. If you are using a `ref()`, make sure to use `shallowRef()` instead of `ref()` for better performance.

```ts
const asRef = shallowRef(dbRef(db, 'contacts/' + route.params.id))
useDocument(asRef)
const asComputed = computed(() => dbRef(db, 'contacts/' + route.params.id))
useDocument(asComputed)
// a getter is the lightest option
useDocument(() => dbRef(db, 'contacts/' + route.params.id))
```

:::

On top of that, VueFire also allows `null` as a value for the data source. This is useful when you want to start observing a document or collection later in the lifecycle of your component, or if you cannot computed a valid document path, e.g. when the user is not logged in:

<FirebaseExample>

```ts
const user = useCurrentUser()
const myContactList = useDatabaseList(() =>
  user.value
    ? // Firebase will error if a null value is passed to `dbRef()`
      dbRef(db, 'users', user.value.id, 'contacts')
    : // this will be considered as no data source
      null
)
```

```ts
const user = useCurrentUser()
const myContactList = useCollection(() =>
  user.value
    ? // Firebase will error if a null value is passed to `collection()`
      collection(db, 'users', user.value.id, 'contacts')
    : // this will be considered as no data source
      null
)
```

</FirebaseExample>

### Subscription state

All of the composables can also be destructured to access other useful data like _is the initial load still pending?_ or _did the subscription fail?_. You only need to destructure the returned value from the composables:

```ts
// instead of writing
const contact = useDocument(contactSource)
// write
const {
  // rename the Ref to something more meaningful
  data: contact,
  // is the subscription still pending?
  pending,
  // did the subscription fail?
  error,
  // A promise that resolves or rejects when the initial state is loaded
  promise,
} = useDocument(contactSource)
```

Notice how we rename `data` to whatever makes more sense for the context.

::: warning
All of the properties that can be defined on the `Ref` are defined as [non-enumerable properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) which means they won't be copied over when using the spread operator e.g. `const { data, ...rest } = useDocument(contactSource)`. This is to ensure they are completely ignored and do not create problems in other places like devtools.
:::

### Fetching data once

To fetch data only _once_, pass the [`once`](../api/interfaces/vuefire.UseDocumentOptions.html#once) option, which will automatically destroy the subscription as soon as the document or collection is completely fetched:

<FirebaseExample>

```ts{5,8}
import { useDatabaseList, useDatabaseObject } from 'vuefire'
import { ref as dbRef } from 'firebase/database'

const todos = useDatabaseList(dbRef(db, 'todos'), {
  once: true,
})
const someTodo = useDatabaseObject(dbRef(db, 'todos', 'someId'), {
  once: true,
})
```

```ts{5,8}
import { useCollection, useDocument } from 'vuefire'
import { collection, doc } from 'firebase/firestore'

const todos = useCollection(collection(db, 'todos'), {
  once: true,
})
const someTodo = useDocument(doc(collection(db, 'todos'), 'someId'), {
  once: true,
})
```

</FirebaseExample>

## VueFire additions

VueFire adds a few properties to the data snapshot to make it easier to work with.

### Document's `id`

Each document/object, has an convenient `id` property that is the id/key of the document/object. It's set as a non enumerable property so it won't be copied over when using the spread operator.

<FirebaseExample>

```js
this.user.id // -KguCoSMemQZw3JD6EPh
// the id is non enumerable
Object.keys(this.user).includes('id') // false

// it originally comes from the `key` attribute
dbRef(db, 'users/-KguCoSMemQZw3JD6EPh').key // '-KguCoSMemQZw3JD6EPh'
// More at https://firebase.google.com/docs/reference/js/database.datasnapshot.md#datasnapshotkey
```

```js
this.user.id // jORwjIykFn1NmkdzTkhU
// the id is non enumerable
Object.keys(this.user).includes('id') // false

// it originally comes from the `id` attribute
doc(collection(db, 'users'), 'jORwjIykFn1NmkdzTkhU').id // 'jORwjIykFn1NmkdzTkhU'
// More at https://firebase.google.com/docs/reference/js/firestore_.documentreference.md#documentreferenceid
```

</FirebaseExample>

This behavior can be customized through the [`serialize`/`converter` option](./global-options.md#custom-serializeconverter). Note that in both cases, **you must keep the `id` property for VueFire to correctly work**.

### GeoPoints (Firestore only)

In Firestore you can store [GeoPoints](https://firebase.google.com/docs/reference/js/firestore_.geopoint). They are retrieved as-is by VueFire, meaning that you can directly use methods like `isEqual` and access its properties `latitude` and `longitude`.

<FirebaseExample disable="0">

```js
// GeoPoints do not exist in RTDB
```

```js
import { GeoPoint } from 'firebase/firestore'

// add Paris to the list of cities and wait for the operation
// to be finished
await addDoc(collection(db, 'cities'), {
  name: 'Paris',
  location: new GeoPoint(48.8588377, 2.2770206),
})

// somewhere else...
// we consider `cities` to be the result af `useCollection(collection(db, 'cities'))`
// we retrieve Paris that was just added
const paris = cities.value.at(-1)
paris.location.latitude // 48.8588377
paris.location.longitude // 2.2770206
```

</FirebaseExample>

### Timestamps (Firestore only)

In Firestore you can store [Timestamps](https://firebase.google.com/docs/reference/js/firestore_.timestamp). They are stored as-is by VueFire, meaning that you can directly use methods like `isEqual`, `toDate` and access its properties `seconds` and `nanoseconds`.

<FirebaseExample disable="0">

```js
// Timestamps do not exist in RTDB
```

```js
import { Timestamp } from 'firebase/firestore'

// Add "La prise de la Bastille" to a list of events
// and wait for th operation to be finished
await addDoc(collection(db, 'events'), {
  name: 'Prise de la Bastille',
  date: Timestamp.fromDate(new Date('1789-07-14')),
})

// somewhere else...
// we consider `events` to be the result af `useCollection(collection(db, 'events'))`
// we retrieve the event we just added
const prise = events.value.at(-1)
prise.date.seconds // -5694969600
prise.date.nanoseconds // 0
prise.toDate() // Tue Jul 14 1789
```

</FirebaseExample>

### References (Firestore only)

In Firestore you can store [Nested References](https://firebase.google.com/docs/firestore/manage-data/structure-data). You can think of this as pointers to Documents within a Document. VueFire automatically binds References found in Collections and Documents. This also works for nested references (References found in bound References). By default, VueFire will stop at that level (2 level nesting) but you can change that with `maxRefDepth`.

Given some _users_ with _documents_ that are being viewed by other _users_. This could be **users/1**:

```js
{
  name: 'Claire',
  documents: [
    // The document is stored somewhere else. Here we are only holding a reference
    doc(collection(db, 'documents'), 'gift-list'),
  ],
}
```

In the example above, `documents` is an array of References. Let's look at the document identified by `gift-list`:

```js
{
  content: '...',
  sharedWith: [
    doc(collection(db, 'users'), '2'),
    doc(collection(db, 'users'), '3'),
  ]
}
```

`sharedWith` is also an array of References, but those references are users. Users also contain references to documents, therefore, if we automatically bind every nested reference, we could end up with an infinite-memory-consuming binding. By default, if we bind `users/1` with VueFire, this is what we end up having:

```js
{
  name: 'Claire',
  documents: [
    {
      content: '...',
      sharedWith: [
        {
          name: 'Chris',
          documents: [
            'documents/chris-todo-list',
          ]
        },
        {
          name: 'Leon',
          documents: [
            'documents/leon-todo-list',
            'documents/leon-book',
          ],
        },
      ],
    },
  ],
}
```

`documents.sharedWith.documents` end up as arrays of strings. Those strings are actually _paths_ that can be passed to `doc()` as in `doc(db, 'documents/leon-book')` to get the actual reference to the document. By being a string instead of a Reference, it is possible to display a bound document with VueFire as plain text.

It is possible to customize this behavior by providing a [`maxRefDepth` option](../api/interfaces/vuefire.UseDocumentOptions.html#maxRefDepth):

```js
// override the default value of 2 for maxRefDepth
useDocument(doc(db, 'users/1'), { maxRefDepth: 1 })
```

Read more about [writing References to the Database](./writing-data.md#references) in the [writing data](./writing-data.md) section.

### Primitive values (Database only)

In Realtime Database, you can _push_ primitive values like strings, numbers, booleans, etc. When calling `useDatabaseList()` on a database ref containing primitive values, **you will get a slightly different value**. Instead of an array of values, you will get an array of objects **with a `$value` and an `id` property**. This is because VueFire needs to keep track of the key of each value in order to add, update, or remove them.

```js
import { ref as databaseRef, push } from 'firebase/database'

const numbersRef = databaseRef(db, 'numbers')
// add some numbers
push(numbersRef, 24)
push(numbersRef, 7)
push(numbersRef, 10)

const numberList = useDatabaseList(numbersRef)
// [{ $value: 24, id: '...' }, { $value: 7, id: '...' }, { $value: 10, id: '...' }]
// note the order might be different
```

## TypeScript

To enforce a type, you only need to pass a generic type when using the different composables functions:

<FirebaseExample>

```ts
const contacts = useDatabaseList<Contact>(dbRef(db, 'contacts'))
const settings = useDatabaseObject<Settings>(dbRef(db, 'settings/someId'))
```

```ts
const contacts = useCollection<Contact>(collection(db, 'contacts'))
const settings = useDocument<Settings>(
  doc(collection(db, 'settings'), 'someId')
)
```

</FirebaseExample>

Note this is only a type annotation, it does not perform any runtime validation. If you want a runtime validation, you can use the `withConverter()` method as shown below.

### Firestore `.withConverter()`

The recommended Firebase approach is to use the `withConverter()` for Firestore:

::: info
`.withConverter()` is a Firestore feature that doesn't have an equivalent in Database but you can use VueFire's [`serialize()` option](./global-options.md#firestore-and-database-global-options) instead.
:::

```ts
import { firestoreDefaultConverter } from 'vuefire'

interface TodoI {
  text: string
  finished: boolean
}

const todoList = useDocument(
  doc(db, 'todos').withConverter<TodoI>({
    fromFirestore: (snapshot) => {
      const data = firestoreDefaultConverter.fromFirestore(snapshot)
      // usually you can do data validation here
      if (!data || !isValidTodoItem(data)) return null

      return data
    },
    toFirestore: firestoreDefaultConverter.toFirestore,
  })
)
```

In Firebase 10, `withConverter()` takes two generics instead of one:

```ts{2,5}
// ...
import type { DocumentData } from 'firebase/firestore'

const todoList = useDocument(
  doc(db, 'todos').withConverter<TodoI, DocumentData>({
    // ...
  })
)
```

::: warning

While you can return pretty much anything in `withConverter()`, **if you are using [SSR](./ssr.md)**, make sure you object is serializable. For example, you can't return custom classes or functions.

:::
