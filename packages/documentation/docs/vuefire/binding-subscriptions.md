# Binding / Subscribing to changes

In Vuefire, subscriptions to changes are handled transparently, that's why we always talk about _binding_, you only provide the key of the state where to bind as well as the Source (Collection, Query or Document) and Vuefire takes care of the rest!

There are two ways of binding a Reference to the Database with Vuefire:

- Using the `firebase`/`firestore` option
- Calling the injected methods `$bind`/`$rtdbBind`

Once a Reference is bound, Vuefire will keep the local version in sync with the remote database. However, this synchronisation **is only one-way**, the local state is always a reflection of the remote Database that you should treat as read only state. If you want to [push changes to the remote Database](./writing-data.md), you need to use Firebase JS SDK. But, more about that later.

## Declarative binding

Any Database Reference provided in a `firebase`/`firestore` option will be bound at creation (after Vue's `created` hook). In the following example we bind a Collection of Documents to our `documents` property. The key provided in the `firebase`/`firestore` option (`documents`) matches the property declared in `data`:

<FirebaseExample>

```js
// RecentDocuments.vue
import { db } from './db'

export default {
  data() {
    return {
      documents: [],
    }
  },

  firebase: {
    documents: db.ref('documents'),
  },
}
```

```js
// RecentDocuments.vue
import { db } from './db'

export default {
  data() {
    return {
      documents: [],
    }
  },

  firebase: {
    documents: db.collection('documents'),
  },
}
```

</FirebaseExample>

:::warning
It's necessary to declare properties with their initial values in `data`. **For the RTDB, using an _Array_ as the initial value will bind the Reference as an array, otherwise it is bound as an object**. For Firestore, collections and queries and bound as arrays while documents are bound as objects.
:::

## Programmatic binding

Declarative binding is simple and easy to write, however, you will probably need to change the reference to the database while the application is running. Changing the active document you are displaying, displaying a different user profile, etc. This can be achieved through the `$rtdbBind`/`$bind` methods added by `rtdbPlugin`/`firestorePlugin` in any Vue component.

<FirebaseExample>

```js
// UserProfile.vue
const users = db.ref('users')

export default {
  props: ['id'],
  data() {
    return {
      user: null,
    }
  },

  watch: {
    id: {
      // call it upon creation too
      immediate: true,
      handler(id) {
        this.$rtdbBind('user', users.child(id))
      },
    },
  },
}
```

```js
// UserProfile.vue
const users = db.collection('users')

export default {
  props: ['id'],
  data() {
    return {
      user: null,
    }
  },

  watch: {
    id: {
      // call it upon creation too
      immediate: true,
      handler(id) {
        this.$bind('user', users.doc(id))
      },
    },
  },
}
```

</FirebaseExample>

With the approach above, `user` will always be bound to the user defined by the prop `id`

:::tip
No need to call [`$rtdbUnbind`/`$unbind`](#unbinding-unsubscribing-to-changes) as `$rtdbBind`/`$bind` will automatically unbind any existant binding on the provided key. Upon component removal, all bindings are removed as well.
:::

If you need to wait for a binding to be ready before doing something, you can _await_ for the returned Promised:

<FirebaseExample>

```js
this.$rtdbBind('user', users.child(this.id)).then(user => {
  // user will be an object if this.user was set to anything but an array
  // this.user === user
})

this.$rtdbBind(
  'documents',
  documents.orderByChild('creator').equalTo(this.id)
).then(documents => {
  // documents will be an array if this.documents was initially set to an array
  // this.documents === documents
})
```

```js
this.$bind('user', users.doc(this.id)).then(user => {
  // user will be an object if this.user was set to anything but an array
  // this.user === user
})

this.$bind('documents', documents.where('creator', '==', this.id)).then(
  documents => {
    // documents will be an array if this.documents was initially set to an array
    // this.documents === documents
  }
)
```

</FirebaseExample>

## Using the data bound by Vuefire

### `.key` / `id`

Any document bonud by Vuefire will retain it's _id_ in the database as a non-enumerable, read-only property. This make it easier to [write changes](./writing-data.md) and allows you to copy the data only.

<FirebaseExample>

```js
this.user['.key'] // -KguCoSMemQZw3JD6EPh
// the id is non enumerable
Object.keys(this.user).includes('.key') // false

// it originally comes from the `key` attribute
db.ref('users/ada').key // 'ada'
// More at https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#key
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#key
```

```js
this.user.id // jORwjIykFn1NmkdzTkhU
// the id is non enumerable
Object.keys(this.user).includes('id') // false

// it originally comes from the `id` attribute
db.collection('users').doc('ada').id // 'ada'
// More at https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#key
// https://firebase.google.com/docs/reference/js/firebase.database.Reference#key
```

</FirebaseExample>

### Geopoints (Firestore only)

In Firestore you can store [Geopoints](https://firebase.google.com/docs/reference/js/firebase.firestore.GeoPoint). They are retrieved as-is by Vuefire, meaning that you can directly use methods like `isEqual` and access its properties `latitude` and `longitude`.

<FirebaseExample disable="0">

```js
// Geopoints do not exist in RTDB
```

```js
// TODO: make sure about the import
import { GeoPoint } from 'firebase/firestore'

// add Paris to the list of cities and wait for the operation
// to be finished
await db.collection('cities').app({
  name: 'Paris',
  location: new GeoPoint(48.8588377, 2.2770206),
})

// we consider `cities` to be bound to current component
// we retrieve Paris that was just added
const paris = this.cities[this.cities.length - 1]
paris.location.latitude // 48.8588377
paris.location.longitude // 2.2770206
```

</FirebaseExample>

Read more about [writing Geopoints to the database](./writing-data.md#geopoints) in the [writing data](./writing-data.md) section.

### Timestamps (Firestore only)

In Firestore you can store [Timestamps](https://firebase.google.com/docs/reference/js/firebase.firestore.Timestamp). They are stored as-is by Vuefire, meaning that you can directly use methods like `isEqual`, `toDate` and access its properties `seconds` and `nanoseconds`.

<FirebaseExample disable="0">

```js
// Timestamps do not exist in RTDB
```

```js
// TODO: make sure about the import
import { Timestamp } from 'firebase/firestore'

// Add "La prise de la Bastille" to a list of events
// and wait for th operation to be finished
await db.collection('events').app({
  name: 'Prise de la Bastille',
  date: Timestamp.fromDate(new Date('1789-07-14')),
})

// we consider `events` to be bound to current component
// we retrieve the event we just added
const prise = this.events[this.events.length - 1]
prise.date.seconds // -5694969600
prise.date.nanoseconds // 0
prise.toDate() // Tue Jul 14 1789
```

</FirebaseExample>

Read more about [writing Timestamps to the database](./writing-data.md#timestamps) in the [writing data](./writing-data.md) section.

## Unbinding / Unsubscribing to changes

While Vuefire will automatically unbind any reference bound in a component whenever needed, you may still want to do it on your own to stop displaying updates on a document or collection.

<FirebaseExample>

```js
// unsubscribe from database updates
this.$rtdbUnbind('user')
this.$rtdbUnbind('documents')
```

```js
// unsubscribe from database updates
this.$unbind('user')
this.$unbind('documents')
```

</FirebaseExample>

Vuefire will **leave the data as-is**, if you want to reset it back to something is up to you do so:

```js
// after calling `$rtdbUnbind` or `$unbind` on 'user' and 'documents'
this.user = null
this.documents = []
```
