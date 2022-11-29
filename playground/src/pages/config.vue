<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import { useDocument, useFirestore, usePendingPromises } from 'vuefire'
import { onMounted, ref } from 'vue'

const db = useFirestore()
const configRef = doc(db, 'configs', 'jORwjIykFo2NmkdzTkhU')
// const itemRef = doc(db, 'tests', 'item')
const isDoneFetching = ref(false)
const isAllDoneFetching = ref(false)

const { data: config, promise } = useDocument(configRef)

onMounted(() => {
  console.log('heeyo')
  promise.value.then((data) => {
    console.log('one', data)
    isDoneFetching.value = true
  })

  usePendingPromises().then((data) => {
    console.log(data)
    isAllDoneFetching.value = true
  })
})
</script>

<template>
  <p>config:</p>
  <p>finished: {{ isDoneFetching }}</p>
  <p>All finished: {{ isAllDoneFetching }}</p>
  <pre>{{ config }}</pre>
</template>
