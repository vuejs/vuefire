# Realtime Data

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
If you can't use a `computed()`, use `shallowRef()`s instead of `ref()`s to store the data sources. This is because `shallowRef()` doesn't try to recursively observe the object it's given, which in the case of a Firebase data source, would be wasteful
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

## TypeScript

Most of the composables can be typed by passing a generic to them:

```ts
const contacts = useCollection<Contact>(collection(db, 'contacts'))
const settings = useDocument<Settings>(doc(collection(db, 'settings'), 'someId'))
```

### Typing documents with `withConverter()`

:::info
This is for Firestore only. Use the [`serialize()` option](#TODO) for RTDB instead.
:::

In Firestore, the recommended approach is to use `.withConverter()` on documents and collections to ensure type safety

TODO:

## Options API

TODO:
