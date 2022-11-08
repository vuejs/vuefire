<script setup lang="ts">
import { collection } from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'

const db = useFirestore()
const tweetsRef = collection(db, 'tweets')
const nestedRef = collection(db, 'nested')
const momentsRef = collection(db, 'moments')

const nested = useCollection(nestedRef)

const tweets = useCollection(tweetsRef)
const moments = useCollection(momentsRef)
</script>

<template>
  <h4>collection with refs</h4>

  <ul>
    <li v-for="moment in moments">{{ moment }}</li>
  </ul>

  <h5>Original data</h5>

  <ul>
    <li v-for="tweet in tweets">{{ tweet }}</li>
  </ul>
</template>
