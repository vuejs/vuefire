<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import { useDocument, useFirestore, usePendingPromises } from 'vuefire'
import { ref } from 'vue'

const db = useFirestore()
const configRef = doc(db, 'configs', 'jORwjIykFo2NmkdzTkhU')
// const itemRef = doc(db, 'tests', 'item')
const isDoneFetching = ref(false)
const isAllDoneFetching = ref(false)

const { data: config, promise } = useDocument(configRef, { wait: true })
// const { data: hey } = useDocument(configRef)

onMounted(() => {
  promise.value.then((data) => {
    if (process.client) {
      console.log(data)
    }
    isDoneFetching.value = true
  })

  usePendingPromises().then((data) => {
    if (process.client) {
      console.log(data)
    }
    isAllDoneFetching.value = true
  })
})
</script>

<template>
  <div>
    <p>config:</p>
    <p>finished: {{ isDoneFetching }}</p>
    <p>All finished: {{ isAllDoneFetching }}</p>
    <pre>{{ config }}</pre>
  </div>
</template>
