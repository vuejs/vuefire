<script setup lang="ts">

</script>

<template>
  <template v-if="$route.name !== '/'">
    <RouterLink to="/">&lt;&lt; Home</RouterLink>
    <hr>
  </template>
  <RouterView></RouterView>
</template>
