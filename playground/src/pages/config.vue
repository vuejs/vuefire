<script setup lang="ts">
import { doc } from 'firebase/firestore'
import { ref } from 'vue'
import { firestoreBind } from 'vuefire'
import { useFirestore } from '@/firebase'

const db = useFirestore()
const configRef = doc(db, 'configs', 'jORwjIykFo2NmkdzTkhU')
const itemRef = doc(db, 'tests', 'item')

const config = ref()
firestoreBind(config, itemRef)
// firestoreBind(config, configRef)
</script>

<template>
  <p>config:</p>
  <pre>{{ config }}</pre>
</template>
