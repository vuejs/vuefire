import { initializeApp, type FirebaseApp } from 'firebase/app'
import { Firestore, getFirestore } from 'firebase/firestore'
import { inject, type App, type InjectionKey } from 'vue'
import { getAnalytics, type Analytics } from 'firebase/analytics'
import { Database, getDatabase } from 'firebase/database'

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
  const database = getDatabase(firebaseApp)
  const analytics = getAnalytics(firebaseApp)

  // connectFirestoreEmulator(firestore, 'localhost', 8080)

  return { firebaseApp, firestore, database, analytics }
}

export function VueFirePlugin({
  firebaseApp,
  firestore,
  analytics,
  database,
}: ReturnType<typeof createFirebaseApp>) {
  return (app: App) => {
    app.provide(FirebaseAppInjectKey, firebaseApp)
    app.provide(FirestoreInjectKey, firestore)
    app.provide(FirebaseAnalyticsInjectKey, analytics)
    app.provide(DatabaseInjectKey, database)
  }
}

export const FirestoreInjectKey: InjectionKey<Firestore> = Symbol('firestore')
export const DatabaseInjectKey: InjectionKey<Database> = Symbol('database')
export const FirebaseAppInjectKey: InjectionKey<FirebaseApp> =
  Symbol('firebaseApp')
export const FirebaseAnalyticsInjectKey: InjectionKey<Analytics> =
  Symbol('analytics')

export function useFirestore() {
  // TODO: warning with no currentInstance
  return inject(FirestoreInjectKey)!
}

export function useDatabase() {
  return inject(DatabaseInjectKey)!
}

export function useFirebaseApp() {
  return inject(FirebaseAppInjectKey)!
}

export function useFirebaseAnalytics() {
  return inject(FirebaseAnalyticsInjectKey)!
}
