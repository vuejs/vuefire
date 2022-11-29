# Realtime Data

:::info
If you are looking for the VueFire Options API guide, make sure to **also check** the [dedicated page](./options-api-realtime-data.md). This page still includes a more information than the Options API page, which focuses more on its syntax.
:::

In VueFire, subscriptions to data changes are handled transparently. That's why we always talk about _binding_: you only provide the _data source_ (Collection, Query or Document), and VueFire takes care of the rest!

When using Firebase Database and Firestore, you can either retrieve the data once or _subscribe_ to changes with methods like `onSnapshot()` and `onValue()`. VueFire will automatically handle the subscription for you, and update the data when it changes by internally using these functions, greatly simplifying the whole process of connecting your Vue Data to the realtime data from Firebase. It exposes a few [composables](https://vuejs.org/guide/reusability/composables.html#composables) to create these realtime bindings, it's important to note that, like other composables, these functions are meant to be used within a `setup()` function or a `<script setup>`. You can still use them outside of these contexts for advanced scenarios [like Vuex/Pinia](../cookbook/subscriptions-external.md) or global bindings but we will focus on the most common use case here. You can also use the [Options API equivalent](#options-api), in this section of the docs we will focus on the Composition API version and give you the equivalent for the Options API.

## Declarative realtime data

Use the `useCollection()`, `useList()`, `useDocument()`, and `useObject()` composables to create a realtime data connected to Firestore and/or a Realtime Database. These functions take a reference to a Collection, Query, or Document a Vue `ref()`:

<FirebaseExample>

```vue
<script setup>
import { useList } from 'vuefire'
import { ref as dbRef } from 'firebase/database'

const todos = useList(dbRef(db, 'todos'))
const someTodo = useObject(dbRef(db, 'todos', 'someId'))
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

These composables all return a Vue `Ref` of the data. Note **this is a readonly data**, you shouldn't mutate it directly, [use the Firebase SDK](./writing-data.md) instead. It will be automatically updated when the data changes anywhere.

Sometimes, you need to change the document you are observing, let's say you have a list of contacts and that you display one based on the URL, you handle this by passing a reactive variable of the data source to the `useDocument()`, `useObject()`, etc composables:

```ts
const route = useRoute()
const contactSource = computed(
  () => doc(collection(db, 'contacts'), route.params.id)
)
// contact will always be
const contact = useDocument(contactSource)
```

This way, if the route changes, the document will be updated to the new one, automatically unsubscribing from the previous one and subscribing to the new one.

:::tip
If you can't use a `computed()`, use `shallowRef()`s instead of `ref()`s to store the data sources. This is because `shallowRef()` doesn't try to recursively observe the object it's given, which in the case of a Firebase data source, would be wasteful.
:::

### Subscription state

All of the composables not only return a `Ref`, they can also be destructured to access other useful data like _is the initial load still pending?_ or _did the subscription fail?_. You only need to destructure the returned value from the composables:

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
  promise
} = useDocument(contactSource)
```

Notice how we rename `data` to whatever makes more sense for the context. It's important to note

:::note
All of the properties that can be defined on the Ref are defined as [non-enumerable properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) which means they won't be copied over when using the spread operator e.g. `const { data, ...rest } = useDocument(contactSource)`. This is to ensure they are completely ignored in other places like devtools.
:::

## VueFire extras

VueFire adds a few properties to the data snapshot to make it easier to work with.

### Document's `id`

Each document/object, has an `id` property that is the key of the document/object. This is useful when you want to display the id of the document/object in your template. It's set as a non enumerable property so it won't be copied over when using the spread operator.

<FirebaseExample>

```js
this.user.id // -KguCoSMemQZw3JD6EPh
// the id is non enumerable
Object.keys(this.user).includes('id') // false

// it originally comes from the `key` attribute
dbRef(db, 'users/ada').key // 'ada'
// More at https://firebase.google.com/docs/reference/js/database.datasnapshot.md#datasnapshotkey
```

```js
this.user.id // jORwjIykFn1NmkdzTkhU
// the id is non enumerable
Object.keys(this.user).includes('id') // false

// it originally comes from the `id` attribute
doc(collection(db, 'users'), 'ada').id // 'ada'
// More at https://firebase.google.com/docs/reference/js/firestore_.documentreference.md#documentreferenceid
```

</FirebaseExample>

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
const paris = cities.value[cities.value.length - 1]
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
const prise = events.value[events.value.length - 1]
prise.date.seconds // -5694969600
prise.date.nanoseconds // 0
prise.toDate() // Tue Jul 14 1789
```

</FirebaseExample>

### References (Firestore only)

In Firestore you can store [Nested References](https://firebase.google.com/docs/firestore/manage-data/structure-data). You can think of this as pointers to Documents within a Document. VueFire automatically bind References found in Collections and Documents. This also works for nested references (References found in bound References). By default, VueFire will stop at that level (2 level nesting) but you can change that with `maxRefDepth`.

Given some _users_ with _documents_ that are being viewed by other _users_. This could be **users/1**:

```js
{
  name: 'Jessica',
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

`documents.sharedWith.documents` end up as arrays of strings. Those strings are actuallyh _paths_ that can be passed to `doc()` as in `doc(db, 'documents/robin-book')` to get the actual reference to the document. By being a string instead of a Reference, it is possible to display a bound document with VueFire as plain text.

It is possible to customize this behavior by providing a [`maxRefDepth` option](../api/interfaces/UseDocumentOptions.md#maxrefdepth):

```js
// override the default value of 2 for maxRefDepth
useDocument(doc(db, 'users/1'), { maxRefDepth: 1 })
```

Read more about [writing References to the Database](./writing-data.md#references) in the [writing data](./writing-data.md) section.

### Primitive values (Database only)

In Realtime Database, you can _push_ primitive values like strings, numbers, booleans, etc. When calling `useList()` on a database ref containing primitive values, **you will get a slightly different value**. Instead of an array of values, you will get an array of objects **with a `$value` and an `id` property**. This is because VueFire needs to keep track of the key of each value in order to add, update, or remove them.

```js
import { ref as databaseRef, push } from 'firebase/database'

const numbersRef = databaseRef(db, 'numbers')
// add some numbers
push(numbersRef, 24)
push(numbersRef, 7)
push(numbersRef, 10)

const numberList = useList(numbersRef)
// [{ $value: 24, id: '...' }, { $value: 7, id: '...' }, { $value: 10, id: '...' }]
// note the order might be different
```

## TypeScript

Usually, the different composables accept a generic to enforce the type of the documents:

<FirebaseExample>

```ts
const contacts = useList<Contact>(dbRef(db, 'contacts'))
const settings = useObject<Settings>(dbRef(db, 'settings/someId'))
```

```ts
const contacts = useCollection<Contact>(collection(db, 'contacts'))
const settings = useDocument<Settings>(doc(collection(db, 'settings'), 'someId'))
```

</FirebaseExample>

Note this is only a type annotation, it does not perform any runtime validation.

### Firestore `.withConverter()`

The recommended Firebase approach is to use the `withConverter()` for Firestore:

:::info
`.withConverter()` is a Firestore feature that doesn't have an equivalent in Database but you can use VueFire's [`serialize()` option](#TODO:global options when installing plugin) instead.
:::

```ts
interface TodoI {
  text: string
  finished: boolean
}

const todoList = useDocument(
  doc(db, 'todos').withConverter<TodoI>({
    fromFirestore: (snapshot) => {
      const data = snapshot.data()
      // usually you can do data validation here
      return { text: data.text, finished: data.finished }
    },
    toFirestore: (todo) => todo,
  })
)
```
