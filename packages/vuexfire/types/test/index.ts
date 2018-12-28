import Vuex from 'vuex'
import { vuefireMutations, firestoreAction } from '../'
import { firestore } from 'firebase'

interface Payload {
  todos: firestore.CollectionReference
  sortedTodos: firestore.Query
  user: firestore.DocumentReference
}

new Vuex.Store({
  state: {
    sortedTodos: [], // Will be bound as an array
    todos: [], // Will be bound as an array
    user: null // Will be bound as an object
  },
  mutations: {
    // your mutations
    ...vuefireMutations
  },
  actions: {
    init: firestoreAction(
      ({ bindFirebaseRef, unbindFirebaseRef, commit }, payload: Payload) => {
        // this will unbind any previously bound ref to 'todos'
        bindFirebaseRef('todos', payload.todos)
          .then(todos => {
            todos.length
            commit('setTodosLoaded', true)
          })
          .catch(err => {
            console.log(err)
          })
        bindFirebaseRef('sortedTodos', payload.sortedTodos)
          .then(todos => {
            todos.length
            commit('setSortedTodosLoaded', true)
          })
          .catch(err => {
            console.log(err)
          })

        bindFirebaseRef('user', payload.user).then(doc => {
          doc.something
        })

        // you can unbind any ref easily
        unbindFirebaseRef('user')
      }
    )
  },
  plugins: [
    store => {
      const db = firestore()

      const payload: Payload = {
        todos: db.collection('todos'),
        sortedTodos: db.collection('todos').orderBy('createdAt'),
        user: db.doc('user')
      }

      store.dispatch('init', payload)
    }
  ]
})
