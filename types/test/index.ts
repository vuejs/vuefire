import Vue from 'vue'
import * as firebase from 'firebase'
import Vuefire from '../index'

const db = firebase.firestore()

Vue.use(Vuefire)

const app = new Vue({
  firestore: {
    todos: db.collection('todos'),
    doc: db.collection('todos').doc('2')
  }
})

new Vue({
  firestore() {
    return {
      todos: db.collection('todos'),
      doc: db.collection('todos').doc('2')
    }
  }
})

app.$firestoreRefs.todos.id

app.$bind('document', db.collection('todos').doc('1')).then(doc => {
  doc.something
})

app.$bind('collection', db.collection('todos')).then(todos => {
  todos.length
})

app.$unbind('document')
app.$unbind('collection')

Vue.component('firestore-component', {
  firestore: {
    todos: db.collection('todos'),
    doc: db.collection('todos').doc('2')
  },
  methods: {
    doSomething() {
      // TODO not sure if making this work is possible
      // this.todos.map(todo => todo.id)
    }
  }
})
