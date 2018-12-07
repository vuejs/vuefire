import Vue from 'vue'
import * as firebase from 'firebase'
import Vuefire from '../index'

const db = firebase.firestore()

Vue.use(Vuefire)

const todos = db.collection('todos')
const todosSorted = db.collection('todos').orderBy('created')
const doc = db.collection('todos').doc('2')

const app = new Vue({
  firestore: {
    todos,
    todosSorted,
    doc
  }
})

new Vue({
  firestore () {
    return {
      todos,
      todosSorted,
      doc
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

app.$bind('todos', todosSorted).then(todos => {
  todos.length
})

app.$unbind('document')
app.$unbind('collection')

Vue.component('firestore-component', {
  firestore: {
    todos,
    todosSorted,
    doc
  },
  methods: {
    doSomething () {
      // TODO not sure if making this work is possible
      // this.todos.map(todo => todo.id)
    }
  }
})
