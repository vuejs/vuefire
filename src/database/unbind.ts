import type { Ref } from 'vue-demi'
import type { UnbindWithReset, ResetOption } from '../shared'

export const databaseUnbinds = new WeakMap<
  object,
  Record<string, UnbindWithReset>
>()

export function internalUnbind(
  key: string,
  unbinds: Record<string, UnbindWithReset> | undefined,
  reset?: ResetOption
) {
  if (unbinds && unbinds[key]) {
    unbinds[key](reset)
    delete unbinds[key]
  }
}

export const unbind = (target: Ref, reset?: ResetOption) =>
  internalUnbind('', databaseUnbinds.get(target), reset)
