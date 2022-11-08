<script lang="ts" setup>
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { ref } from 'vue'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'

const auth = useFirebaseAuth()
const user = useCurrentUser()

// new user
const email = ref('')
const password = ref('')
function signUp() {
  // link to an existing anonymous account
  if (user.value?.isAnonymous) {
    const credential = EmailAuthProvider.credential(email.value, password.value)
    return linkWithCredential(user.value, credential).then(() => {
      return signInWithEmailAndPassword(auth, email.value, password.value)
    })
  }

  // create a regular account
  return createUserWithEmailAndPassword(auth, email.value, password.value)
}
</script>

<template>
  <main>
    <h1>Auth playground</h1>
    <button @click="signOut(auth)">SignOut</button>
    <button @click="signInAnonymously(auth)">Anonymous signIn</button>
    <form @submit.prevent="signUp()">
      <fieldset>
        <legend>New User</legend>

        <label> Email: <input type="email" required v-model="email" /> </label>

        <label>
          Password: <input type="password" required v-model="password" />
        </label>

        <button>Create</button>
      </fieldset>
    </form>

    <form @submit.prevent="signInWithEmailAndPassword(auth, email, password)">
      <fieldset>
        <legend>Sign in</legend>

        <label> Email: <input type="email" required v-model="email" /> </label>

        <label>
          Password: <input type="password" required v-model="password" />
        </label>

        <button>Signin</button>
      </fieldset>
    </form>
    <p>Current User:</p>
    <pre>{{ user }}</pre>
  </main>
</template>
