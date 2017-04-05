import {
  VUEXFIRE_OBJECT_VALUE,
  VUEXFIRE_ARRAY_INITIALIZE,
  VUEXFIRE_ARRAY_ADD,
  VUEXFIRE_ARRAY_CHANGE,
  VUEXFIRE_ARRAY_MOVE,
  VUEXFIRE_ARRAY_REMOVE,
} from './types.js'

export const mutations = {
  [VUEXFIRE_OBJECT_VALUE] (state, { key, record }) {
    state[key] = record
  },

  [VUEXFIRE_ARRAY_INITIALIZE] (state, { key }) {
    state[key] = []
  },

  [VUEXFIRE_ARRAY_ADD] (state, { key, index, record }) {
    state[key].splice(index, 0, record)
  },

  [VUEXFIRE_ARRAY_CHANGE] (state, { key, index, record }) {
    state[key].splice(index, 1, record)
  },

  [VUEXFIRE_ARRAY_MOVE] (state, { key, index, record, newIndex }) {
    const array = state[key]
    array.splice(newIndex, 0, array.splice(index, 1)[0])
  },

  [VUEXFIRE_ARRAY_REMOVE] (state, { key, index }) {
    state[key].splice(index, 1)
  },
}
