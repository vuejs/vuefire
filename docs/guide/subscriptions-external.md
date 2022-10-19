# Binding Firebase Reference to existing Vue Refs

When you need to bind a Firebase reference to existing Vue `ref()`, you can pass it as the `target` option:

```ts
todos // Ref<Todo[]>
useCollection(todoListRef, { target: todos })
```

## Pinia

If you are using [Pinia](https://pinia.vuejs.org), you can directly use the `useCollection` function within [setup stores](https://pinia.vuejs.org/cookbook/composables.html#setup-stores):

```ts
import { defineStore } from 'pinia'

export const useTodoStore = defineStore('todos', () => {
  const todos = useCollection(todoListRef)
  
  return { todos }
})
```

Note you will still have to follow the [Firebase API](https://firebase.google.com/docs/firestore/manage-data/structure-data) (e.g. `addDoc()`, `updateDoc()`, etc) to update the data.

## TypeScript

TODO: use type helper to add properties of converter
