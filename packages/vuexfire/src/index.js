import {
  VUEXFIRE_OBJECT_VALUE,
  VUEXFIRE_ARRAY_INITIALIZE,
  VUEXFIRE_ARRAY_ADD,
  VUEXFIRE_ARRAY_CHANGE,
  VUEXFIRE_ARRAY_MOVE,
  VUEXFIRE_ARRAY_REMOVE
} from './types.js'

import {
  createRecord,
  getRef,
  indexForKey,
  getKey
} from './utils/index.js'

const mutations = {
  [VUEXFIRE_OBJECT_VALUE] (state, payload) {
    state[payload.key] = payload.record
  },

  [VUEXFIRE_ARRAY_INITIALIZE] (state, payload) {
    state[payload.key] = []
  },

  [VUEXFIRE_ARRAY_ADD] (state, payload) {
    state[payload.key].splice(payload.index, 0, payload.record)
  },

  [VUEXFIRE_ARRAY_CHANGE] (state, payload) {
    state[payload.key].splice(payload.index, 1, payload.record)
  },

  [VUEXFIRE_ARRAY_MOVE] (state, payload) {
    const array = state[payload.key]
    array.splice(payload.newIndex, 0, array.splice(payload.index, 1)[0])
  },

  [VUEXFIRE_ARRAY_REMOVE] (state, payload) {
    state[payload.key].splice(payload.index, 1)
  }
}

export default function VuexFire (store) {
}

function bindAsObject ({
  key,
  source,
  cancelCallback,
  listeners,
  commit
}) {
  const cb = source.on('value', function (snapshot) {
    commit(VUEXFIRE_OBJECT_VALUE, {
      key,
      record: createRecord(snapshot)
    })
  }, cancelCallback)
  listeners[key] = { value: cb }
}

function bindAsArray ({
  key,
  source,
  cancelCallback,
  listeners,
  commit,
  state
}) {
  // Initialise the array to an empty one
  commit(VUEXFIRE_ARRAY_INITIALIZE, { key })
  const onAdd = source.on('child_added', function (snapshot, prevKey) {
    const array = state[key]
    const index = prevKey ? indexForKey(array, prevKey) + 1 : 0
    commit(VUEXFIRE_ARRAY_ADD, {
      key,
      index,
      record: createRecord(snapshot)
    })
  }, cancelCallback)

  const onChange = source.on('child_changed', function (snapshot) {
    const array = state[key]
    const index = indexForKey(array, getKey(snapshot))
    commit(VUEXFIRE_ARRAY_CHANGE, {
      key,
      index,
      record: createRecord(snapshot)
    })
  }, cancelCallback)

  listeners[key] = {
    child_added: onAdd,
    child_changed: onChange
  }
}

export function generateBind ({ commit, state }) {
  const listeners = Object.create(null)
  const sources = Object.create(null)

  function bind (key, source, cancelCallback) {
    // Unbind if it already exists
    if (key in sources) {
      unbind(key)
    }
    sources[key] = getRef(source)
    if (state[key] && 'length' in state[key]) {
      bindAsArray({ key, source, cancelCallback, commit, state, listeners })
    } else {
      bindAsObject({ key, source, cancelCallback, commit, listeners })
    }
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
