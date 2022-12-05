<script lang="ts" setup>
import { getToken } from 'firebase/app-check'
import { onMounted } from 'vue'
import { useAppCheckToken, useAppCheck } from 'vuefire'

const token = useAppCheckToken()
const appCheck = useAppCheck()

onMounted(async () => {
  if (appCheck) {
    console.log('appcheck token', await getToken(appCheck))
  } else {
    console.log('App Check not initialized')
  }
})
</script>

<template>
  <div>
    <h1>App Check</h1>
    <p>Token: {{ token }}</p>
  </div>
</template>
