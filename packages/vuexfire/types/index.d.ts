import { MutationTree, ActionContext, Action } from 'vuex'
import { firestore } from 'firebase'

export declare const firebaseMutations: MutationTree<any>

interface FirebaseActionContext<S, R> extends ActionContext<S, R> {
  bindFirebaseRef(key: string, ref: firestore.CollectionReference): Promise<firestore.DocumentData[]>
  bindFirebaseRef(key: string, ref: firestore.DocumentReference): Promise<firestore.DocumentData>
  unbindFirebaseRef(key: string): void
}

export declare function firebaseAction<S, R>(cb: (context: FirebaseActionContext<S, R>, payload: any) => any): Action<S, R>