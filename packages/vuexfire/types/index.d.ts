import { MutationTree, ActionContext, Action } from 'vuex'
import { firestore } from 'firebase'

export declare const vuexfireMutations: MutationTree<any>

interface FirestoreActionContext<S, R> extends ActionContext<S, R> {
  bindFirestoreRef(
    key: string,
    ref: firestore.Query
  ): Promise<firestore.DocumentData[]>
  bindFirestoreRef(
    key: string,
    ref: firestore.DocumentReference
  ): Promise<firestore.DocumentData>
  unbindFirestoreRef(key: string): void
}

export declare function firestoreAction<S, R>(
  cb: (context: FirestoreActionContext<S, R>, payload: any) => any
): Action<S, R>
