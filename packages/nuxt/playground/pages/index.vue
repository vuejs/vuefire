<script setup lang="ts">
const router = useRouter()

const routeRecords = router
  .getRoutes()
  // remove dynamic routes
  .filter(route => route.path !== '/' && !route.path.includes(':'))
  .map((route) => {
    return {
      to: route.name ? { name: route.name } : route.path,
      label: route.path,
    }
  }).sort((a, b) => a.label.localeCompare(b.label))
</script>

<template>
  <div>
    <ul>
      <li v-for="route in routeRecords" :key="route.label">
        <NuxtLink :to="route.to">
          {{ route.label }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
