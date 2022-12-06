<script lang="ts" setup>
import { doc, getDoc } from 'firebase/firestore'
import { onServerPrefetch, ref } from 'vue'
import { useFirestore } from 'vuefire'

const db = useFirestore()
const configRef = doc(db, 'configs', 'jORwjIykFo2NmkdzTkhU')

onServerPrefetch(async () => {
  const snapshot = await getDoc(configRef)
  console.log('got snapshot once', snapshot.data()?.amount)
})
</script>

<template>
  <div>Hello</div>
</template>
