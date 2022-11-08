<script setup lang="ts">
import { collection } from 'firebase/firestore'
import { useCollection, useFirestore } from 'vuefire'

const db = useFirestore()
const nestedRefs = collection(db, 'playground/nested-refs/list')

const nestedList = useCollection(nestedRefs)
</script>

<template>
  <p>List with nested refs</p>
  <pre>{{ nestedList }}</pre>
</template>
