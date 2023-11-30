<script setup lang="ts">
import {
  GeoPoint,
  Timestamp,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { useDocument, useFirestore, usePendingPromises } from 'vuefire'
import { ref } from 'vue'

async function setupNestedDocument() {
  const configDoc = await getDoc(configRef)
  if (configDoc.exists()) {
    return
  }

  for (let i = 0; i < 3; i++) {
    await setDoc(doc(db, 'todos', String(i)), {
      text: 'Todo ' + i,
      finished: false,
      created: serverTimestamp(),
    })
    await setDoc(doc(db, 'tweets', String(i)), {
      text: 'Tweet ' + i,
      created: serverTimestamp(),
    })
  }

  await setDoc(configRef, {
    amount: 28,
    name: 'Eduardo',
    array: ['one', 'two'],
    object: {
      bar: 'baro',
      foo: 'foo',
      todo: doc(db, 'todos', '1'),
    },
    oneTweet: doc(db, 'tweets', '1'),
    time: serverTimestamp(),
    loc: new GeoPoint(48.8566, 2.3522),

    todos: [doc(db, 'todos', '1'), doc(db, 'todos', '2')],
    tweets: [doc(db, 'tweets', '1'), doc(db, 'tweets', '2')],
  })
}

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
      console.log('promise resolved', toRaw(data))
    }
    isDoneFetching.value = true
  })

  usePendingPromises().then((data) => {
    if (process.client) {
      console.log('pending promise resolved', toRaw(data))
    }
    isAllDoneFetching.value = true
  })
})

setupNestedDocument()
</script>

<template>
  <div>
    <p>config:</p>
    <p>finished: {{ isDoneFetching }}</p>
    <p>All finished: {{ isAllDoneFetching }}</p>
    <p>Revive check:</p>
    <ul>
      <li>
        TimeStamp: {{ config?.time }}. toMillis:
        {{ (config?.time as Timestamp).toMillis() }}
      </li>
      <li>
        GeoPoint: {{ config?.loc }}. isEqual:
        {{ (config?.loc as GeoPoint).isEqual(new GeoPoint(0, 0)) }}
      </li>
    </ul>

    <hr />

    <pre>{{ config }}</pre>
  </div>
</template>
