# Firestore and Database global Options

If you find yourself passing around the same options to `useDocument()`, `useDatabaseObject()`, ..., you can use the global options to avoid repeating yourself:

<FirebaseExample>

```ts
import { globalDatabaseOptions } from 'vuefire'

globalDatabaseOptions.serialize = ...
```

```ts
import { globalFirestoreOptions } from 'vuefire'

globalFirestoreOptions.converter = ...
```

</FirebaseExample>

Changing these options will affect **all calls** to `useDocument()`, `useDatabaseObject()`, ... in your application **as well as Options API calls** (`$firestoreBind()`, `$rtdbBind()`).

## Custom `serialize`/`converter`

When adapting `serialize`/`converter` or using `.withConverter()`, **you need to make sure the returned objects contain their original `id`** so other VueFire functionalities can work correctly. The easies way to do this is by reusing the default `serialize`/`converter`:

<FirebaseExample>

```ts
import { databaseDefaultSerializer } from 'vuefire'

globalDatabaseOptions.serialize = (snapshot) => {
  const data = databaseDefaultSerializer(snapshot)
  // add anything custom to the returned object
  data.metadata = snapshot.metadata
  return data
}
```

```ts
import { firestoreDefaultConverter } from 'vuefire'

globalFirestoreOptions.converter = {
  // the default converter just returns the data: (data) => data
  toFirestore: firestoreDefaultConverter.toFirestore,
  fromFirestore: (snapshot, options) => {
    const data = firestoreDefaultConverter.fromFirestore(snapshot, options)
    // if the document doesn't exist, return null
    if (!data) return null
    // add anything custom to the returned object
    data.metadata = snapshot.metadata
    return data
  },
}
```

</FirebaseExample>
