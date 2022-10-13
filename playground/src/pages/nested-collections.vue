<script setup lang="ts">
import { collection } from 'firebase/firestore';
import { ref } from 'vue'
import { firestoreBind } from 'vuefire';
import { useFirestore } from '@/firebase;

const db = useFirestore();
const tweetsRef = collection(db, 'tweets')
const nestedRef = collection(db, 'nested')
const momentsRef = collection(db, 'moments')

const nested = ref([])
firestoreBind(nested, nestedRef)

const tweets = ref([])
firestoreBind(tweets, tweetsRef)
const moments = ref([])
firestoreBind(moments, momentsRef)
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
