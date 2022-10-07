import { initializeApp, type FirebaseApp } from 'firebase/app'
import { Firestore, getFirestore } from 'firebase/firestore'
import { inject, type App, type InjectionKey } from 'vue'

export function createFirebaseApp() {
  const firebaseApp = initializeApp({
    apiKey: 'AIzaSyAkUKe36TPWL2eZTshgk-Xl4bY_R5SB97U',
    authDomain: 'vue-fire-store.firebaseapp.com',
    databaseURL: 'https://vue-fire-store.firebaseio.com',
    projectId: 'vue-fire-store',
    storageBucket: 'vue-fire-store.appspot.com',
    messagingSenderId: '998674887640',
    appId: '1:998674887640:web:1e2bb2cc3e5eb2fc3478ad',
    measurementId: 'G-RL4BTWXKJ7',
  })

  const firestore = getFirestore(firebaseApp)

  return { firebaseApp, firestore }
}

export function VueFirePlugin({
  firebaseApp,
  firestore,
}: {
  firebaseApp: FirebaseApp
  firestore: Firestore
}) {
  return (app: App) => {
    app.provide(FirestoreInjectKey, firestore)
    app.provide(FirebaseAppInjectKey, firebaseApp)
  }
}

export const FirestoreInjectKey: InjectionKey<Firestore> = Symbol('firestore')
export const FirebaseAppInjectKey: InjectionKey<FirebaseApp> =
  Symbol('firebaseApp')

export function useFirestore() {
  // TODO: warning with no currentInstance
  return inject(FirestoreInjectKey)!
}

export function useFirebaseApp() {
  return inject(FirebaseAppInjectKey)!
}
