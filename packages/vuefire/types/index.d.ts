import * as firebase from 'firebase'
import { PluginFunction } from 'vue'
import './vue'


interface Options {
  bindName?: string
  unbindName?: string
}

interface FirestoreOptions extends Options {
  createSnapshot?: (documentSnapshot: firebase.firestore.DocumentSnapshot) => Record<string, any>
}

interface RTDBOptions extends Options {
  createSnapshot?: (documentSnapshot: firebase.database.DataSnapshot) => Record<string, any>
}

export declare const firestorePlugin: PluginFunction<FirestoreOptions>
export declare const rtdbPlugin: PluginFunction<RTDBOptions>
