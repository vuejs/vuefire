const VUEXFIRE_OBJECT_VALUE = 'vuexfire/OBJECT_VALUE'
const VUEXFIRE_ARRAY_CHANGE = 'vuexfire/ARRAY_CHANGE'
const VUEXFIRE_ARRAY_ADD = 'vuexfire/ARRAY_ADD'
const VUEXFIRE_ARRAY_REMOVE = 'vuexfire/ARRAY_REMOVE'
const VUEXFIRE_ARRAY_MOVE = 'vuexfire/ARRAY_MOVE'

/**
 * Check if a value is an object.
 *
 * @param {*} val
 * @return {boolean}
 */
function isObject (val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

/**
 * Returns the key of a Firebase snapshot across SDK versions.
 *
 * @param {FirebaseSnapshot} snapshot
 * @return {string|null}
 */
function _getKey (snapshot) {
  return typeof snapshot.key === 'function'
  /* istanbul ignore next: Firebase 2.x */
    ? snapshot.key()
    : snapshot.key
}

/**
 * Returns the original reference of a Firebase reference or query across SDK versions.
 *
 * @param {FirebaseReference|FirebaseQuery} refOrQuery
 * @return {FirebaseReference}
 */
function _getRef (refOrQuery) {
  /* istanbul ignore if: Firebase 2.x */
  if (typeof refOrQuery.ref === 'function') {
    refOrQuery = refOrQuery.ref()
    /* istanbul ignore else: Fallback */
  } else if (typeof refOrQuery.ref === 'object') {
    refOrQuery = refOrQuery.ref
  }

  return refOrQuery
}
_getRef

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

/**
 * Convert firebase snapshot into a bindable data record.
 *
 * @param {FirebaseSnapshot} snapshot
 * @return {Object}
 */
function createRecord (snapshot) {
  var value = snapshot.val()
  var res = isObject(value)
        ? value
        : { '.value': value }
  res['.key'] = _getKey(snapshot)
  return res
}

export default function VuexFire (store) {
}

export function generateBind (commit) {
  return function bind (key, source, cancelCallback) {
    console.log(key)
    const cb = source.on('value', function (snapshot) {
      commit(VUEXFIRE_OBJECT_VALUE, {
        key: key,
        record: createRecord(snapshot)
      })
    }, cancelCallback)
    cb
    // vm._firebaseListeners[fullKey] = { value: cb }
  }
}

export { mutations }
