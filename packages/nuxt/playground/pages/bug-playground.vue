<script lang="ts" setup>
import { useIntervalFn } from '@vueuse/core'
import { doc, DocumentReference, updateDoc } from 'firebase/firestore'

const db = useFirestore()
const docId = ref<'a' | 'b'>('a')
const thingRef = computed(() =>
  doc(db, '/bug-reports/issue-1223/objects', docId.value)
)

interface Item {
  ref: DocumentReference | null
}

const { data: thing, promise } = useDocument<Item>(thingRef, { maxRefDepth: 0 })
const thingDeep = useDocument<Item>(thingRef, {
  maxRefDepth: 1,
  ssrKey: 'deep',
})

promise.value.then(() => {
  console.log('promise resolved', thing.value)
})

const active = ref(false)
useIntervalFn(async () => {
  if (!active.value) {
    return
  }
  if (thing.value?.ref) {
    await updateDoc(thingRef.value, {
      ref: null,
    })
  } else {
    await updateDoc(thingRef.value, {
      ref: doc(db, '/bug-reports/issue-1223/objects', 'b'),
    })
  }
}, 3000)
</script>

<template>
  <div>
    <label>
      <input v-model="active" type="checkbox" />Toggle the nested `ref` every
      3s.
    </label>
    <p v-if="thing">Actual: {{ thing }}</p>
    <p v-if="thingDeep">Actual deep: {{ thingDeep }}</p>
  </div>
</template>
