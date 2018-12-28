import { MutationTree, ActionContext, Action } from 'vuex'
import { firestore } from 'firebase'

export declare const vuefireMutations: MutationTree<any>

interface FirestoreActionContext<S, R> extends ActionContext<S, R> {
  bindFirebaseRef(
    key: string,
    ref: firestore.Query
  ): Promise<firestore.DocumentData[]>
  bindFirebaseRef(
    key: string,
    ref: firestore.DocumentReference
  ): Promise<firestore.DocumentData>
  unbindFirebaseRef(key: string): void
}

export declare function firestoreAction<S, R>(
  cb: (context: FirestoreActionContext<S, R>, payload: any) => any
): Action<S, R>
