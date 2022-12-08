import type { Ref } from 'vue-demi'
import type { UnbindWithReset } from '../shared'
import type { FirestoreRefOptions } from './bind'
import { firestoreUnbinds } from './optionsApi'

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
