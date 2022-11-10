<script lang="ts" setup>
import { useAppCheckToken } from 'vuefire'

const token = useAppCheckToken()
</script>

<template>
  <div>
    <h1>App Check</h1>
    <p>Token: {{ token }}</p>
  </div>
</template>
