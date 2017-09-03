import {
  VUEXFIRE_OBJECT_VALUE,
  VUEXFIRE_ARRAY_INITIALIZE,
  VUEXFIRE_ARRAY_ADD,
  VUEXFIRE_ARRAY_CHANGE,
  VUEXFIRE_ARRAY_MOVE,
  VUEXFIRE_ARRAY_REMOVE,
} from './types'

export const mutations = {
  [VUEXFIRE_OBJECT_VALUE] (state, { key, record }) {
    state[key] = record
  },

  [VUEXFIRE_ARRAY_INITIALIZE] (state, { key, value }) {
    state[key] = value
  },

  [VUEXFIRE_ARRAY_ADD] (state, { key, index, record, array }) {
    array = array || state[key]
    array.splice(index, 0, record)
  },

  [VUEXFIRE_ARRAY_CHANGE] (state, { key, index, record, array }) {
    array = array || state[key]
    array.splice(index, 1, record)
  },

  [VUEXFIRE_ARRAY_MOVE] (state, { key, index, record, newIndex, array }) {
    array = array || state[key]
    array.splice(newIndex, 0, array.splice(index, 1)[0])
  },

  [VUEXFIRE_ARRAY_REMOVE] (state, { key, index, array }) {
    array = array || state[key]
    array.splice(index, 1)
  },
}
