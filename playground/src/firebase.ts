import { initializeApp, type FirebaseApp } from 'firebase/app'
import { Firestore, getFirestore } from 'firebase/firestore'
import { inject, type App, type InjectionKey } from 'vue'
import { getAnalytics, type Analytics } from 'firebase/analytics'

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
  const analytics = getAnalytics(firebaseApp)

  // connectFirestoreEmulator(firestore, 'localhost', 8080)

  return { firebaseApp, firestore, analytics }
}

export function VueFirePlugin({
  firebaseApp,
  firestore,
  analytics,
}: ReturnType<typeof createFirebaseApp>) {
  return (app: App) => {
    app.provide(FirebaseAppInjectKey, firebaseApp)
    app.provide(FirestoreInjectKey, firestore)
    app.provide(FirebaseAnalyticsInjectKey, analytics)
  }
}

export const FirestoreInjectKey: InjectionKey<Firestore> = Symbol('firestore')
export const FirebaseAppInjectKey: InjectionKey<FirebaseApp> =
  Symbol('firebaseApp')
export const FirebaseAnalyticsInjectKey: InjectionKey<Analytics> =
  Symbol('analytics')

export function useFirestore() {
  // TODO: warning with no currentInstance
  return inject(FirestoreInjectKey)!
}

export function useFirebaseApp() {
  return inject(FirebaseAppInjectKey)!
}

export function useFirebaseAnalytics() {
  return inject(FirebaseAnalyticsInjectKey)!
}
