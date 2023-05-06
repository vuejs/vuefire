# Binding Firebase Reference to existing Vue Refs

Sometimes, you might want to reuse an existing `ref()`. This might be because you want to write the Firebase data to a _custom ref_ coming from a composable or because the ref comes from an existing reactivity source like a Vuex/Pinia store. This can be achieved by passing the `ref()` to the `target` option of the composable:

```ts
todos // given an existing Ref<Todo[]>
const { pending } = useCollection(todoListRef, { target: todos })
```

When passing a target ref, the composable will not create a new `ref()` for you, but will instead use the one you passed. It will also not return the `ref()` as a result, but instead return an object with some useful properties. You can find more about this in [the declarative subscriptions](../guide/realtime-data.md) section.

## Pinia

If you are using [Pinia](https://pinia.vuejs.org), you can directly use the `useCollection()` function within [setup stores](https://pinia.vuejs.org/cookbook/composables.html#setup-stores):

```ts
import { defineStore } from 'pinia'

export const useTodoStore = defineStore('todos', () => {
  const todos = ref<Type[]>([])
  const db = getFirestore(firebaseApp)
  const load = async () => await useCollection(collection(db, 'todos'), { target: todos }).promise.value
  load()
  
  return { todos }
})
```

Note you will still have to follow the [Firebase API](https://firebase.google.com/docs/firestore/manage-data/structure-data) (e.g. `addDoc()`, `updateDoc()`, etc) to update the data.

If you wanted to export getters from the store without modifying the original ref, you could bind it to another ref and then use `computed()` properties over it.

```ts
export const useTodoStore = defineStore('todos', () => {
  // given an existing pinia implementation
  
  const todosFormatted = computed(() => {
    todos.value.map((item:Type) => ({
      ...item,
      text: parseText(item.text)
    }))
  })
  
  return { todos, todosFormatted }
})
```

## TypeScript

TODO: use type helper to add properties of converter

```ts
interface User {
  id?: string;
  name: string;
}

const converter = <T>() => ({
  toFirestore: (data: PartialWithFieldValue<T>) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
});

const userDocRef = doc(db, 'users', 'my-user-id').withConverter(
  converter<User>()
);
const userData = useFirestore(userDocRef);
```

Now userData has a type of `Ref<User | null | undefined>` and you can access all the User properties on it without error.
