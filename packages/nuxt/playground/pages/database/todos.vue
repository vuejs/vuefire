<script setup lang="ts">
const todos = []
</script>

<template>
  <div>
    <h1>Todos</h1>
    <ul>
      <li v-for="todo in todos" :key="todo.id">
        <NuxtLink :to="`/database/todos/${todo.id}`">{{ todo.title }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>
