<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router/auto'

const router = useRouter()
const routes = computed(() =>
  router
    .getRoutes()
    .filter((route) => !route.path.includes(':') && !route.children.length)
)
</script>

<template>
  <ul>
    <li v-for="route in routes">
      <RouterLink :to="{ name: route.name as any }" v-slot="{ href }">{{
        href
      }}</RouterLink>
    </li>
  </ul>
</template>
