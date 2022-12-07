<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const routes = router
  .getRoutes()
  // remove dynamic routes
  .filter(route => route.path !== '/' && !route.path.includes(':') && !route.children.length)
  .map((route) => {
    return {
      to: route.name ? { name: route.name } : route.path,
      label: route.path,
    }
  }).sort((a, b) => a.label.localeCompare(b.label))
</script>

<template>
  <div>
    <nav class="nav-links">
      <ul>
        <li v-for="route in routes">
          <NuxtLink :to="route.to">
            {{ route.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <hr>

    <NuxtPage />
  </div>
</template>

<style scoped>
.nav-links {
  margin: 0;
  padding: 0;
}

.nav-links > ul {
  display: flex;
  list-style: none;
  flex-direction: row;
  align-items: center;
  padding: 0;
  margin: 0;
}

.nav-links > ul > li {
  margin: 0 0.5rem;
}
</style>
