import {
  VUEXFIRE_OBJECT_VALUE,
  VUEXFIRE_ARRAY_ADD,
  VUEXFIRE_ARRAY_CHANGE,
  VUEXFIRE_ARRAY_MOVE,
  VUEXFIRE_ARRAY_REMOVE
} from './types.js'

import {
  createRecord,
  getRef
} from './utils.js'

const mutations = {
  [VUEXFIRE_OBJECT_VALUE] (state, payload) {
    state[payload.key] = payload.record
  },

  [VUEXFIRE_ARRAY_CHANGE] (state, payload) {
    state[payload.key].splice(payload.index, 1, payload.record)
  },

  [VUEXFIRE_ARRAY_ADD] (state, payload) {
    state[payload.key].splice(payload.index, 0, payload.record)
  },

  [VUEXFIRE_ARRAY_REMOVE] (state, payload) {
    state[payload.key].splice(payload.index, 1)
  },

  [VUEXFIRE_ARRAY_MOVE] (state, payload) {
    const array = state[payload.key]
    array.splice(payload.newIndex, 0, array.splice(payload.index, 1)[0])
  }
}

export default function VuexFire (store) {
}

export function generateBind (commit) {
  const listeners = Object.create(null)
  const sources = Object.create(null)

  function bind (key, source, cancelCallback) {
    // Unbind if it already exists
    if (key in sources) {
      unbind(key)
    }
    sources[key] = getRef(source)
    const cb = source.on('value', function (snapshot) {
      commit(VUEXFIRE_OBJECT_VALUE, {
        key: key,
        record: createRecord(snapshot)
      })
    }, cancelCallback)
    listeners[key] = { value: cb }
  }

  function unbind (key) {
    const oldSource = sources[key]
    const oldListeners = listeners[key]
    for (let event in oldListeners) {
      oldSource.off(event, oldListeners[event])
    }
  }

  return {
    bind,
    unbind
  }
}

export { mutations }
