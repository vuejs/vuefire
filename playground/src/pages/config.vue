<script setup lang="ts">
import { doc } from 'firebase/firestore';
import { ref } from 'vue'
import { firestoreBind } from 'vuefire';
import { useFirestore } from '@/firestore';


const db = useFirestore();
const configRef = doc(db, 'configs', 'jORwjIykFo2NmkdzTkhU')

const config = ref(null)
firestoreBind(config, configRef)
</script>

<template>
  <p>config:</p>
  <pre>{{ config }}</pre>
</template>
