<script lang="ts" setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <div>
    <p>count: {{ counter.count }}</p>
    <button @click="counter.increment">increment</button>
  </div>
</template>
