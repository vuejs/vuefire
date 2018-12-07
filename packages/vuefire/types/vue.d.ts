/**
 * Augment the typings of Vue.js
 */

import Vue from 'vue'
import { firestore } from 'firebase'

declare module 'vue/types/vue' {
  interface Vue {
    $bind(name: string, reference: firestore.Query): Promise<firestore.DocumentData[]>
    $bind(name: string, reference: firestore.DocumentReference): Promise<firestore.DocumentData>
    $unbind: (name: string) => void
    $firestoreRefs: Readonly<
      Record<string, firestore.DocumentReference | firestore.CollectionReference>
    >
  }
}

type VueFirestoreObject = Record<string, firestore.DocumentReference | firestore.Query>

type FirestoreOption<V> = VueFirestoreObject | ((this: V) => VueFirestoreObject)

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    firestore?: FirestoreOption<V>
  }
}
