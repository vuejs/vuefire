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
      // call it upon creatin too
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
      // call it upon creatin too
      immediate: true,
      handler(id) {
        this.$bind('user', users.doc(id))
      },
    },
  },
}
```

</FirebaseExample>

## Using the data bound by Vuefire

<!-- TODO: talk about ids -->
