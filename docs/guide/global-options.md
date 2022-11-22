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
