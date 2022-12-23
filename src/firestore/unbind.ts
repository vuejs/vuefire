import type { Ref } from 'vue-demi'
import type { UnbindWithReset } from '../shared'
import type { FirestoreRefOptions } from './bind'

export const firestoreUnbinds = new WeakMap<
  object,
  Record<string, UnbindWithReset>
>()

export function internalUnbind(
  key: string,
  unbinds: Record<string, UnbindWithReset> | undefined,
  reset?: FirestoreRefOptions['reset']
) {
  if (unbinds && unbinds[key]) {
    unbinds[key](reset)
    delete unbinds[key]
  }
}

export const unbind = (target: Ref, reset?: FirestoreRefOptions['reset']) =>
  internalUnbind('', firestoreUnbinds.get(target), reset)
