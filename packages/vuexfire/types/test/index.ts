import Vuex from 'vuex'
import { vuexfireMutations, firestoreAction } from '../'
import { firestore } from 'firebase'

interface Payload {
  todos: firestore.CollectionReference
  sortedTodos: firestore.Query
  todosWitMaxDepthZero: firestore.Query
  user: firestore.DocumentReference
}

new Vuex.Store({
  state: {
    sortedTodos: [], // Will be bound as an array
    todos: [], // Will be bound as an array
    user: null, // Will be bound as an object
  },
  mutations: {
    // your mutations
    ...vuexfireMutations,
  },
  actions: {
    init: firestoreAction(
      ({ bindFirestoreRef, unbindFirestoreRef, commit }, payload: Payload) => {
        // this will unbind any previously bound ref to 'todos'
        bindFirestoreRef('todos', payload.todos)
          .then(todos => {
            todos.length
            commit('setTodosLoaded', true)
          })
          .catch(err => {
            console.log(err)
          })
        bindFirestoreRef('sortedTodos', payload.sortedTodos)
          .then(todos => {
            todos.length
            commit('setSortedTodosLoaded', true)
          })
          .catch(err => {
            console.log(err)
          })

        bindFirestoreRef('todosWitMaxDepthZero', payload.todosWitMaxDepthZero, {
          maxRefDepth: 0,
        })
          .then(todos => {
            todos.length
            commit('setTodosWitMaxDepthZero', true)
          })
          .catch(err => console.log(err))

        bindFirestoreRef('user', payload.user).then(doc => {
          doc.something
        })

        // you can unbind any ref easily
        unbindFirestoreRef('user')
      }
    ),
  },
  plugins: [
    store => {
      const db = firestore()

      const payload: Payload = {
        todos: db.collection('todos'),
        sortedTodos: db.collection('todos').orderBy('createdAt'),
        todosWitMaxDepthZero: db.collection('todos'),
        user: db.doc('user'),
      }

      store.dispatch('init', payload)
    },
  ],
})
