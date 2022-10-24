<script setup lang="ts">
import { collection, doc } from 'firebase/firestore'
import { useCollection } from 'vuefire'
import { useFirestore } from '@/firebase'

const db = useFirestore()
const numbers = useCollection(
  collection(db, 'numbers').withConverter<number>({
    toFirestore(n) {
      return { n }
    },
    fromFirestore(snapshot) {
      return snapshot.data().n as number
    },
  })
)
</script>

<template>
  <p>numbers:</p>
  <ul>
    <li v-for="num in numbers">{{ num }}</li>
  </ul>
</template>
