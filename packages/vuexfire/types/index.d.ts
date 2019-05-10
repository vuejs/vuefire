import { MutationTree, ActionContext, Action } from 'vuex'
import { firestore, database } from 'firebase'

export declare const vuexfireMutations: MutationTree<any>

// TODO: could be refactored in vuefire-core
export interface BindFirestoreRefOptions {
  maxRefDepth?: number
  reset?: boolean | (() => any)
}

export interface BindRTDBRefOptions {
  reset?: boolean | (() => any)
}

interface FirestoreActionContext<S, R> extends ActionContext<S, R> {
  bindFirestoreRef(
    key: string,
    ref: firestore.Query,
    options?: BindFirestoreRefOptions
  ): Promise<firestore.DocumentData[]>
  bindFirestoreRef(
    key: string,
    ref: firestore.DocumentReference,
    options?: BindFirestoreRefOptions
  ): Promise<firestore.DocumentData>
  unbindFirestoreRef(key: string): void
}

interface FirebaseActionContext<S, R> extends ActionContext<S, R> {
  bindFirebaseRef(
    key: string,
    reference: database.Reference | database.Query,
    options?: BindRTDBRefOptions
  ): Promise<database.DataSnapshot>
  unbindFirebaseRef(key: string): void
}

export declare function firestoreAction<S, R>(
  action: (context: FirestoreActionContext<S, R>, payload: any) => any
): Action<S, R>

export declare function firebaseAction<S, R>(
  action: (context: FirebaseActionContext<S, R>, payload: any) => any
): Action<S, R>
