<script setup lang="ts">
import { doc, setDoc } from 'firebase/firestore'
import { useCurrentUser, useFirestore, usePendingPromises } from 'vuefire'

definePageMeta({
  middleware: ['vuefire-auth']
})

const db = useFirestore()
const user = useCurrentUser()
const secretRef = computed(() => user.value ? doc(db, 'secrets', user.value.uid) : null)

const { data:secret, pending: isSecretLoading } = useDocument(secretRef)

const textSecret = ref('')
function setSecret() {
  if (secretRef.value) {
    setDoc(secretRef.value, { text: textSecret.value })
  }
}
</script>

<template>
  <div>
    <p v-if="!user">
      Log in in the authentication page to test this.
    </p>
    <template v-else-if="secret">
      <p>Secret Data for user {{ user.displayName }} ({{ user.uid }})</p>
      <pre v-if="secret">{{ secret }}</pre>
      <div v-else>
        <p>You have no secret. Do you want to create one?</p>
        <form @submit.prevent="setSecret()">
          <input v-model="textSecret" type="text">
          <button>Set the secret</button>
        </form>
      </div>
    </template>
    <template v-else-if="isSecretLoading">
      <p>Loading...</p>
    </template>
  </div>
</template>
