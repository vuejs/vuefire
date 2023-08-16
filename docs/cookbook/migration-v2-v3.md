# Upgrading to VueFire v3

VueFire v2 and VueFire v3 have a lot in common but a big improvement to the Vue.js Ecosystem happened between them: the Composition API. On top of that, Firebase SDK itself evolved a lot. VueFire v3 is built on top of the Composition API to provide an idiomatic way to use Firebase with Vue.js that works with **both Vue 2 and Vue 3**. This means that if you are still on Vue 2, as long as you are **using Vue 2.7**, you can upgrade to VueFire v3 and use the Composition API or the Options API. It also relies on the new Firebase SDK v9 which provides a modular API that greatly improves the final size of your application.

Therefore, these are the requirements to upgrade to VueFire v3:

- Use Vue 2.7 or higher
- Use Firebase SDK v9 or higher

## General recommendations

VueFire 3 introduces a Composition API that is more flexible and powerful than the Options API. However, it keeps the existing Options API as close as possible to the existing version in v2. Internally, it is implemented as a wrapper around the Composition API.

Terms starting with _rtdb_ are now prefixed with _database_ to match the Firebase SDK. For example, `rtdbBindAsArray` is now `databaseBindAsArray`. The ones starting with _rtdb_ are still available but marked as deprecated.

## Deprecations

The `firestorePlugin` and `rtdbPlugin` are now deprecated in favor of _modules_. They are still available but will be removed in the next major version. You should use `VueFire`, `VueFireFirestoreOptionsAPI` and `VueFireDatabaseOptionsAPI` instead:

```ts
 const app = createApp({})

 // for firestore
app.use(firestorePlugin, options) // [!code --]
app.use(VueFire, { modules: [VueFireFirestoreOptionsAPI(options)] }) // [!code ++]

 // for database
app.use(rtdbPlugin, options) // [!code --]
app.use(VueFire, { modules: [VueFireDatabaseOptionsAPI(options)] }) // [!code ++]
```

## Breaking changes

### Removal of `serialize` option for Firestore

Firestore supports a native equivalent of the `serialize` option: [Firestore Data Converter](https://firebase.google.com/docs/firestore/query-data/get-data#custom_objects). You can use it to convert your data to a class instance. This is the recommended way to use Firestore with VueFire **and make it typesafe**.

VueFire does support a **global `converter` option** that is equivalent to the previous global `serialize` option. Note that, like its predecessor `serialize`, VueFire uses a default converter that adds the `id` property to your data, you can import it to use it:

```ts
import { firestorePlugin } from 'vuefire'
import { createApp } from 'vue'

const app = createApp(App)
app.use(firestorePlugin, {
  converter: {
    toFirestore() {
      // ...
    },
    fromFirestore() {
      // ...
    }
  }
})
```

If you were using it locally when calling `$bind()`, you should now use the `.withConverter()` method on your data source:

```ts
const usersRef = collection(db, 'users').withConverter({
  // you can directly use the default converter
  toFirestore: firestoreDefaultConverter.toFirestore,
  fromFirestore: (snapshot, options) => {
    // or reuse it and extend it
    const data = firestoreDefaultConverter.fromFirestore(snapshot, options)
    return new User(data)
  }
})
```

Note you can even **reuse** the default converter to extend it:

```ts
import { firestoreDefaultConverter } from 'vuefire'

const usersRef = collection(db, 'users').withConverter({
  // you can directly use the default converter
  toFirestore: firestoreDefaultConverter.toFirestore,
  fromFirestore: (snapshot, options) => {
    // or reuse it and extend it
    const data = firestoreDefaultConverter.fromFirestore(snapshot, options)
    return new User(data)
  }
})
```

### Rename `$bind` to `$firestoreBind`

The `$bind` method is now called `$firestoreBind` to avoid conflicts with other libraries. In the same way, `$unbind` is now called `$firestoreUnbind`.

### Rename `$rtdbBind` to `$databaseBind`

The `$rtdbBind` method is now called `$databaseBind` to have a consistent naming that aligns with the Firebase SDK. In the same way, `$rtdbUnbind` is now called `$databaseUnbind`.

Note that for compatibility reasons, the `$rtdbBind` and `$rtdbUnbind` methods are still available but marked as deprecated.

### Default changes to `reset` and `wait`

The default value of `reset` is now `false` and the default value of `wait` is now `true`. This should be seen as an enhancement as it makes it easier to load new _documents_ or _collections_ without affecting the view while data is being fetched for the first time from Firebase. If you wish the old behavior, you can enforce these settings globally:

```ts
app.use(VueFire, {
  modules: [
    VueFireFirestoreOptionsAPI({
      // same behavior as vuefire v2
      reset: true,
      wait: false,
    }),
    VueFireDatabaseOptionsAPI({
      // same behavior as vuefire v2
      reset: true,
      wait: false,
    }),
  ]
})
```

## Vuexfire

::: tip
If you are using [Pinia](https://pinia.vuejs.org/), make sure to check the [Pinia guide](./subscriptions-external.md#pinia) instead.
:::

As of VueFire 3, Vuexfire doesn't have an exact replacement. This is because Pinia has become the new defacto store solution for Vue.

Find a guide on how to use VueFire with Vuex [here](./vuex.md).
