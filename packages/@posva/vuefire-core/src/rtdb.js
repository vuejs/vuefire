import { createRecordFromRTDBSnapshot } from './utils'

export function rtdbBindAsObject ({ vm, key, document, resolve, reject, ops }) {
  document.on(
    'value',
    snapshot => {
      ops.set(vm, key, createRecordFromRTDBSnapshot(snapshot))
    },
    reject
  )
  document.once('value', resolve)
}
