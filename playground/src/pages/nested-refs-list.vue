<script setup lang="ts">
import { collection, doc, getDoc } from 'firebase/firestore'
import { useCollection, useDocument } from 'vuefire'
import { useFirestore } from '@/firebase'

const db = useFirestore()
const nestedRefs = collection(db, 'playground/nested-refs/list')

const nestedList = useCollection(nestedRefs)
</script>

<template>
  <p>List with nested refs</p>
  <pre>{{ nestedList }}</pre>
</template>
