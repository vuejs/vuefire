import { createRecordFromRTDBSnapshot } from './utils'

export function rtdbBindAsObject ({ vm, key, document, resolve, reject, ops }) {
  const listener = document.on(
    'value',
    snapshot => {
      ops.set(vm, key, createRecordFromRTDBSnapshot(snapshot))
    },
    reject
  )
  document.once('value', resolve)

  return () => {
    document.off('value', listener)
  }
}
