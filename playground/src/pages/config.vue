<script setup lang="ts">
import { doc } from 'firebase/firestore'
import { useDocument } from 'vuefire'
import { useFirestore } from '@/firebase'

const db = useFirestore()
const configRef = doc(db, 'configs', 'jORwjIykFo2NmkdzTkhU')
// const itemRef = doc(db, 'tests', 'item')

const config = useDocument(configRef)
// const { data: hey } = useDocument(configRef)
</script>

<template>
  <p>config:</p>
  <pre>{{ config }}</pre>
</template>
