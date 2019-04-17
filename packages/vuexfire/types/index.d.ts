import { MutationTree, ActionContext, Action } from 'vuex'
import { firestore } from 'firebase'

export declare const vuexfireMutations: MutationTree<any>

export interface BindFirestoreRefOptions {
  maxRefDepth: number
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

export declare function firestoreAction<S, R>(
  cb: (context: FirestoreActionContext<S, R>, payload: any) => any
): Action<S, R>
