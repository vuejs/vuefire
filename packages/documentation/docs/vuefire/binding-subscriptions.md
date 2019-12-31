# Binding / Subscribing to changes

In Vuefire, subscriptions to changes are handled transparently. That's why we always talk about _binding_: you only provide the key of the state where to bind, and the Source (Collection, Query or Document), and Vuefire takes care of the rest!

There are two ways of binding a Reference to the database with Vuefire:

- Declarative binding, which binds to a fixed path within the database, for the lifetime of the component
- Programmatic binding, which allows you to switch from binding to one path, to binding another, while your program is running. 

Once a Reference is bound, Vuefire will keep the local version synchronized in line with the remote database. However, this synchronisation **is only one-way**. Do not modify the local variable (e.g. `this.user.name = 'John'`), because (a) it will not change the remote Database and (b) it can be overwritten at any time by Vuefire. To [write changes to the Database](./writing-data.md), use the Firebase JS SDK.

## Declarative binding

To bind a component property (e.g. `this.documents`) as an array version of what is stored at a Firebase RTDB path, requires two steps. First, create `documents` as an empty array inside `data()`. Then add a `firebase` option, containing the property `documents` whose value is the Firebase RTDB reference. For Firestore, the process is equivalent but uses the `firestore` option instead. 

Binding occurs at creation, after Vue's `created` hook, but before the `mounted` hook. The two examples below show how to bind `this.documents`, either to the Firebase RTDB path "/documents", or to the Firestore Collection "/documents":

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

  firestore: {
    documents: db.collection('documents'),
  },
}
```

</FirebaseExample>

:::warning
You must declare properties with their initial values in `data`. **For the RTDB, using an _Array_ as the initial value will bind the Reference as an array, otherwise it is bound as an object**. For Firestore, collections and queries are bound as arrays while documents are bound as objects.
:::

## Programmatic binding

For most data you obtain from a database, you will want to change the reference to point to various different parts of the database at different times while the application is running, e.g. to display a different user profile, or different product detail page. This can be achieved through the `$rtdbBind`/`$bind` methods added by `rtdbPlugin`/`firestorePlugin` in any Vue component.

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
No need to call [`$rtdbUnbind`/`$unbind`](#unbinding-unsubscribing-to-changes) as `$rtdbBind`/`$bind` will automatically unbind any existing binding on the provided key. Upon component removal, all bindings are removed as well, so no need to use `$rtdbUnbind`/`$unbind` in `destroyed` hooks.
:::

If you need to wait for a binding to be ready before doing something, you can _await_ for the returned Promise:

<FirebaseExample>

```js
this.$rtdbBind('user', users.child(this.id)).then(user => {
  // user will be an object if this.user was set to anything but an array
  // and it will point to the same property declared in data:
  // this.user === user
})

this.$rtdbBind('documents', documents.orderByChild('creator').equalTo(this.id)).then(documents => {
  // documents will be an array if this.documents was initially set to an array
  // and it will point to the same property declared in data:
  // this.documents === documents
})
```

```js
this.$bind('user', users.doc(this.id)).then(user => {
  // user will point to the same property declared in data:
  // this.user === user
})

this.$bind('documents', documents.where('creator', '==', this.id)).then(documents => {
  // documents will point to the same property declared in data:
  // this.documents === documents
})
```

</FirebaseExample>

## Using the data bound by Vuefire

### `.key` / `id`

Any document bound by Vuefire will retain it's _id_ in the database as a non-enumerable, read-only property. This makes it easier to [write changes](./writing-data.md#updates-to-collection-and-documents) and allows you to copy the data only using the [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#Spread_in_object_literals) or [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign).

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

> Refer to [Plugin installation](./getting-started.md#plugin) to retrieve the `Geopoint` class

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
const paris = this.cities[this.cities.length - 1]
paris.location.latitude // 48.8588377
paris.location.longitude // 2.2770206
```

</FirebaseExample>

<!-- Read more about [writing Geopoints to the database](./writing-data.md#geopoints) in the [writing data](./writing-data.md) section. -->

### Timestamps (Firestore only)

In Firestore you can store [Timestamps](https://firebase.google.com/docs/reference/js/firebase.firestore.Timestamp). They are stored as-is by Vuefire, meaning that you can directly use methods like `isEqual`, `toDate` and access its properties `seconds` and `nanoseconds`.

> Refer to [Plugin installation](./getting-started.md#plugin) to retrieve the `Timestamp` class

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
const prise = this.events[this.events.length - 1]
prise.date.seconds // -5694969600
prise.date.nanoseconds // 0
prise.toDate() // Tue Jul 14 1789
```

</FirebaseExample>

<!-- Read more about [writing Timestamps to the database](./writing-data.md#timestamps) in the [writing data](./writing-data.md) section. -->

### References (Firestore only)

In Firestore you can store [References](https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentReference) to other Documents in Documents. Vuefire automatically bind References found in Collections and documents. This also works for nested references (References found in bound References). By default, Vuefire will stop at that level (2 level nesting).

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

`sharedWith` is also an array of References, but those references are users. Users also contain references to documents, therefore, if we automatically bind every nested reference, we could end up with an infinite-memory-consumming binding. By default, if we bind `users/1` with Vuefire, this is what we end up having:

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

`documents.sharedWith.documents` end up as arrays of strings. Those strings can be passed to `db.doc()` as in `db.doc('documents/robin-book')` to get the actual reference to the document. By being a string instead of a Reference, it is possibe to display a bound document with Vuefire as plain text.

It is possible to customize this behaviour by providing a [`maxRefDepth` option](../api/vuefire.md#options-2) when invoking `$bind`:

```js
// override the default value of 2 for maxRefDepth
this.$bind('user', db.collection('users').doc('1'), { maxRefDepth: 1 })
```

Read more about [writing References to the database](./writing-data.md#references) in the [writing data](./writing-data.md) section.

## Unbinding / Unsubscribing to changes

While Vuefire will automatically unbind any reference bound in a component whenever needed, you may still want to do it on your own to stop displaying updates on a document or collection or because the user logged out and they do not have read-access to a resource anymore.

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

By default, Vuefire **will reset** the property, you can customize this behaviour by providing a second argument to the `unbind`/`rtdbUnbind`

<FirebaseExample>

```js
// default behavior
this.$rtdbUnbind('user')
this.$rtdbUnbind('user', true)
// this.user === null

// using a boolean value for reset to keep current value
this.$rtdbUnbind('user', false)
// this.user === { name: 'Eduardo' }

// using the function syntax to customize the value
this.$rtdbUnbind('user', () => ({ name: 'unregistered' }) }))
// this.user === { name: 'unregistered' }

// for references bound as arrays, they are reset to an empty array by default instead of `null`
this.$rtdbUnbind('documents')
// this.documents === []
```

```js
// default behavior
this.$unbind('user')
this.$unbind('user', true)
// this.user === null

// using a boolean value for reset to keep current value
this.$unbind('user', false)
// this.user === { name: 'Eduardo' }

// using the function syntax to customize the value
this.$unbind('user', () => ({ name: 'unregistered' }))
// this.user === { name: 'unregistered' }

// for collections, they are reset to an empty array by default instead of `null`
this.$unbind('documents')
// this.documents === []
```

</FirebaseExample>

It's also possible to customize this behavior when _binding_ by using the [`reset` option](../api/vuefire.md#options-2):

<FirebaseExample>

```js
// using a boolean value for reset
await this.$rtdbBind('user', userRef)
this.$rtdbBind('user', otherUserRef, { reset: false })
// while the user is fetched
// this.user === { name: 'Eduardo' }
```

```js
// using a boolean value for reset
await this.$bind('user', userRef)
this.$bind('user', otherUserRef, { reset: false })
// while the user is fetched
// this.user === { name: 'Eduardo' }
```

</FirebaseExample>
