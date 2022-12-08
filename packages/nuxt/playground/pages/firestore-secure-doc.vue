<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import { useCurrentUser, useDocument, useFirestore, usePendingPromises } from 'vuefire'
import { ref } from 'vue'

const db = useFirestore()
const user = useCurrentUser()
console.log(user.value?.uid)
const secretRef = computed(() => user.value ? doc(db, 'secrets', user.value.uid) : null)

const secret = useDocument(secretRef)
</script>

<template>
  <div>
    <p v-if="!user">
      Log in in the authentication page to test this.
    </p>
    <template v-else>
      <p>Secret Data for user {{ user.displayName }} ({{ user.uid }})</p>
      <pre>{{ secret }}</pre>
    </template>
  </div>
</template>
