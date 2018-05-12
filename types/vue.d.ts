/**
 * Augment the typings of Vue.js
 */

import Vue from 'vue'
import { firestore } from 'firebase'

declare function bindCollection(
  name: string,
  reference: firestore.CollectionReference
): Promise<firestore.DocumentData[]>

declare function bindDocument(
  name: string,
  reference: firestore.DocumentReference
): Promise<firestore.DocumentData>

declare module 'vue/types/vue' {
  interface Vue {
    $bind: typeof bindCollection & typeof bindDocument
    $unbind: (name: string) => void
    $firestoreRefs: Readonly<
      Record<string, firestore.DocumentReference | firestore.CollectionReference>
    >
  }
}

type VueFirestoreObject = Record<
  string,
  firestore.DocumentReference | firestore.CollectionReference
>

type FirestoreOption<V> = VueFirestoreObject | ((this: V) => VueFirestoreObject)

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    firestore?: FirestoreOption<V>
  }
}
