# Server Side Rendering

When doing SSR (Server Side Rendering) you want to wait for the data on the server to serialize it and retrieve it on the client side where it will displayed

## Vue 3 + Suspense

By serializing the data on the server (using a store like [Pinia](https://pinia.vuejs.org) for example) and `await`ing the returned `promise` of `useDocument()` you can ensure your data is loaded when rendering the page on the server and hydrating on the client.

```vue
<script lang="ts" setup>
const { data: userList, promise } = useCollection(collection(db, 'users'))

await promise.value
</script>
```

:::tip
Make sure your component is the descendant of [`<Suspense>`](https://vuejs.org/guide/built-ins/suspense.html) in order to use `await` within `<script setup>`.
:::

## Vue Router Data Loaders

Get the data once only on server

```vue
<script lang="ts">
export const useUserList = defineLoader(async () => {
  const { data: users, promise } = useCollection(collection(db, 'users'), { once: true })
  // or
  // const users = await useCollectionOnce(collection(db, 'users'))
  return users
})
</script>

<script setup lang="ts">
const { data: users } = useUserList()
</script>
```
