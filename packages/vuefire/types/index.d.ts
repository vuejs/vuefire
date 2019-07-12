import * as firebase from 'firebase'
import { PluginFunction } from 'vue'
import './vue'

interface Options {
  bindName?: string
  unbindName?: string
}

interface FirestoreOptions extends Options {
  serialize?: (documentSnapshot: firebase.firestore.DocumentSnapshot) => any
}

interface RTDBOptions extends Options {
  serialize?: (documentSnapshot: firebase.database.DataSnapshot) => any
}

export declare const firestorePlugin: PluginFunction<FirestoreOptions>
export declare const rtdbPlugin: PluginFunction<RTDBOptions>
