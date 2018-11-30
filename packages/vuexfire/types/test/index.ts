import Vuex from 'vuex'
import { firebaseMutations, firebaseAction } from '../'
import { firestore } from 'firebase'

interface Payload {
  todos: firestore.CollectionReference
  user: firestore.DocumentReference
}

new Vuex.Store({
  state: {
    todos: [], // Will be bound as an array
    user: null // Will be bound as an object
  },
  mutations: {
    // your mutations
    ...firebaseMutations
  },
  actions: {
    init: firebaseAction(({ bindFirebaseRef, unbindFirebaseRef, commit }, payload: Payload) => {
      // this will unbind any previously bound ref to 'todos'
      bindFirebaseRef('todos', payload.todos).then(() => {
        commit('setTodosLoaded', true)
      }).catch((err) => {
        console.log(err)
      })

      bindFirebaseRef('user', payload.user)

      // you can unbind any ref easily
      unbindFirebaseRef('user')
    })
  },
  plugins: [
    store => {
      const db = firestore()

      const payload: Payload = {
        todos: db.collection('todos'),
        user: db.doc('user')
      }

      store.dispatch('init', payload)
    }
  ]
})