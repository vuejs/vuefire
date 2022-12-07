<script lang="ts" setup>
import { googleAuthProvider } from '@/firebase'
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  GoogleAuthProvider,
  updateCurrentUser,
  updateProfile,
  AuthCredential,
  getRedirectResult,
} from 'firebase/auth'
import { ref } from 'vue'
import {
  updateCurrentUserProfile,
  useCurrentUser,
  useFirebaseAuth,
} from 'vuefire'

const auth = useFirebaseAuth()
const user = useCurrentUser()
let credential: AuthCredential | null = null

// new user
const email = ref('')
const password = ref('')
function signUp() {
  // link to an existing anonymous account
  if (user.value?.isAnonymous) {
    credential = EmailAuthProvider.credential(email.value, password.value)

    return linkWithCredential(user.value, credential).then(() => {
      return signInWithEmailAndPassword(auth, email.value, password.value)
    })
  }

  // create a regular account
  return createUserWithEmailAndPassword(auth, email.value, password.value)
}

function signinPopup() {
  return signInWithPopup(auth, googleAuthProvider).then((result) => {
    const googleCredential = GoogleAuthProvider.credentialFromResult(result)
    credential = googleCredential
    const token = googleCredential?.accessToken
    console.log('Got Google token', token)
    console.log('Got googleCredential', googleCredential)
  })
}

async function changeUserImage() {
  if (user.value) {
    await updateCurrentUserProfile({
      photoURL: 'https://i.pravatar.cc/150?u=' + Date.now(),
    })

    // updateCurrentUserEmail('hello@esm.dev')
  }
}

function signinRedirect() {
  signInWithRedirect(auth, googleAuthProvider)
}

getRedirectResult(auth).then((creds) => {
  console.log('got creds', creds)
  if (creds) {
    // credential = creds.user.
  }
})
</script>

<template>
  <main>
    <h1>Auth playground</h1>
    <button @click="signOut(auth)">SignOut</button>
    <button @click="signInAnonymously(auth)">Anonymous signIn</button>
    <button @click="signinPopup()">Signin Google (popup)</button>
    <button @click="signinRedirect()">Signin Google (redirect)</button>
    <button @click="changeUserImage">Change User picture</button>

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

    <p v-if="user">
      Name: {{ user.displayName }} <br />
      <img v-if="user.photoURL" :src="user.photoURL" referrerpolicy="no-referrer">
    </p>

    <hr />

    <p>Current User:</p>
    <pre>{{ user }}</pre>
  </main>
</template>
