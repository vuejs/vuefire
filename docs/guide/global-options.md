# Firestore and Database global Options

If you find yourself passing around the same options to `useDocument()`, `useObject()`, ..., you can use the global options to avoid repeating yourself:

<FirestoreExample>

```ts
import { globalDatabaseOptions } from 'vuefire'

globalDatabaseOptions.serialize = ...
```

```ts
import { globalFirestoreOptions } from 'vuefire'

globalFirestoreOptions.converter = ...
```

</FirestoreExample>

Changing these options will affect all calls to `useDocument()`, `useObject()`, ... in your application **and the Options API usage** as well (`$firestoreBind()`, `$rtdbBind()`).

In both scenarios, you need to make sure the returned objects contain their original `id` so other VueFire functionalities can work correctly. The easies way to do this is by reusing the default `serialize`/`converter`:

<FirestoreExample>

```ts
import { globalDatabaseOptions } from 'vuefire'

const defaultSerialize = globalDatabaseOptions.serialize
globalDatabaseOptions.serialize = (snapshot) => {
  const data = defaultSerialize(snapshot)
  // add anything custom to the returned object
  data.metadata = snapshot.metadata
  return data
}
```

```ts
import { globalFirestoreOptions } from 'vuefire'

const defaultConverter = globalFirestoreOptions.converter
globalFirestoreOptions.converter = {
  toFirestore: defaultConverter.toFirestore,
  fromFirestore: (snapshot, options) => {
    const data = defaultConverter.fromFirestore(snapshot, options)
    // add anything custom to the returned object
    data.metadata = snapshot.metadata
    return data
  },
}
```

</FirestoreExample>
