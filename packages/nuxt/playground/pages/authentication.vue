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
import { googleAuthProvider } from '~/helpers/auth'

// auth is null on the server but it's fine as long as we don't use it. So we force the type to be non-null here because
// auth is only used within methods that are only called on the client
const auth = useFirebaseAuth()!
const user = useCurrentUser()
let credential: AuthCredential | null = null

const route = useRoute()
const router = useRouter()

// automatically redirect the user if they are logged in but was rejected on the server because of an outdated cookie
watch(user, (user) => {
  if (
    user &&
    route.query.redirect &&
    typeof route.query.redirect === 'string'
  ) {
    router.push(route.query.redirect)
  }
})

// new user
const email = ref('')
const password = ref('')
const tenant = ref<string | null>(null)

async function signUp() {
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

async function signinPopup() {
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

onMounted(() => {
  getRedirectResult(auth).then((creds) => {
    console.log('got creds', creds)
    if (creds) {
      // credential = creds.user.
    }
  })
})
</script>

<template>
  <main>
    <h1>Auth playground</h1>
    <button data-testid="sign-out" @click="auth.tenantId = null; signOut(auth)">SignOut</button>
    <button data-testid="anonymous-sign-in" @click="auth.tenantId = null; signInAnonymously(auth)">Anonymous signIn</button>
    <button data-testid="google-popup-sign-in" @click="auth.tenantId = null; signinPopup()">Signin Google (popup)</button>
    <button data-testid="google-redirect-sign-in" @click="auth.tenantId = null; signinRedirect()">Signin Google (redirect)</button>
    <button data-testid="change-user-picture" @click="changeUserImage">Change User picture</button>

    <p>
      Tenant: <input v-model="tenant" data-testid="tenant" type="text" placeholder="leave empty for default tenant"/>
    </p>


    <form @submit.prevent="auth.tenantId = tenant || null; signUp()">
      <fieldset>
        <legend>New User</legend>

        <label> Email: <input v-model="email" data-testid="email-signup" type="email" required /> </label>

        <label>
          Password: <input v-model="password" data-testid="password-signup" type="password" required />
        </label>

        <button data-testid="submit-signup">Create</button>
      </fieldset>
    </form>

    <form @submit.prevent="auth.tenantId = tenant || null; signInWithEmailAndPassword(auth, email, password)">
      <fieldset>
        <legend>Sign in</legend>

        <label> Email: <input v-model="email" data-testid="email-signin" type="email" required /> </label>

        <label>
          Password: <input v-model="password" data-testid="password-signin" type="password" required />
        </label>

        <button data-testid="submit-signin">Signin</button>
      </fieldset>
    </form>

    <p v-if="user">
      Name: {{ user.displayName }} <br />
      <img
        v-if="user.photoURL"
        :src="user.photoURL"
        referrerpolicy="no-referrer"
      />
    </p>

    <hr />

    <!-- this is for debug purposes only, displaying it on the server would create a hydration mismatch -->
    <ClientOnly>
      <p>Current User:</p>
      <pre data-testid="user-data-client">{{ user }}</pre>
    </ClientOnly>

    <ServerOnlyPre 
      v-if="user" 
      :data="user"
      testid="user-data-server"
    />
  </main>
</template>
