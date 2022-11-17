<script lang="ts">
import {} from 'firebase/firestore'
// import { listAll, ref as storageRef } from 'firebase/storage'
// import { useFirebaseApp, useStorage } from 'vuefire'

console.log('initializing pages/index.vue')
// console.log('firebaseApp', !!useFirebaseApp())

// listAll(storageRef(useStorage(), 'demo')).then((data) => {
//   console.log('data', data)
// })
</script>

<template>
  <div>
    <ul>
      <li>
        <NuxtLink to="/database"> Database </NuxtLink>
      </li>
      <li>
        <NuxtLink to="/firestore"> Firestore </NuxtLink>
      </li>
    </ul>
  </div>
</template>
