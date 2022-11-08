<script lang="ts" setup>
import { doc, setDoc } from 'firebase/firestore'
import { toRef } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import { useStore } from 'vuex'

const store = useStore()
const db = useFirestore()
const countRef = doc(db, 'playground', 'pinia-counter').withConverter<number>({
  toFirestore(n) {
    return { n }
  },
  fromFirestore(snapshot) {
    return snapshot.data().n as number
  },
})

const count = toRef(store.state, 'count')

useDocument(countRef, {
  target: count,
})

async function increment() {
  await setDoc(countRef, count.value + 1)
}
</script>

<template>
  <div>
    <p>count: {{ count }}</p>
    <button @click="increment">increment</button>
  </div>
</template>
