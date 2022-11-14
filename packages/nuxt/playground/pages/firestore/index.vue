<script lang="ts" setup>
const router = useRouter()

const routes = router
  .getRoutes()
  .filter(record => record.path.startsWith('/firestore/'))
  .map((record) => {
    return {
      name: record.name,
      path: record.path,
    }
  })
</script>

<template>
  <div>
    <NuxtLink to="/">
      &lt;&lt; Back Home
    </NuxtLink>
    <ul>
      <li v-for="link in routes">
        <NuxtLink :to="link">
          {{ link.path }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
