import Vue from 'vue'
import * as firebase from 'firebase'
import { firestorePlugin, rtdbPlugin } from '../index'

const db = firebase.firestore()
const rtdb = firebase.database()

Vue.use(firestorePlugin)
Vue.use(rtdbPlugin)

const todos = db.collection('todos')
const todosSorted = db.collection('todos').orderBy('created')
const doc = db.collection('todos').doc('2')

const source = rtdb.ref('todos')

const app = new Vue({
  firestore: {
    todos,
    todosSorted,
    doc
  },
  firebase: {
    source
  }
})

new Vue({
  firebase () {
    return { source }
  },
  firestore () {
    return {
      todos,
      todosSorted,
      doc
    }
  }
})

app.$firestoreRefs.todos.id
app.$firebaseRefs.todos.key

app.$bind('document', db.collection('todos').doc('1')).then(doc => {
  doc.something
})

app.$bind('document', db.collection('todos').doc('1'), { maxRefDepth: 2 })
// empty option
app.$bind('document', db.collection('todos').doc('1'), {})
app.$bind('document', db.collection('todos').doc('1'), { reset: false })
app.$bind('document', db.collection('todos').doc('1'), {
  reset: () => ({ foo: 'foo' })
})
app.$rtdbBind('document', source, {})
app.$rtdbBind('document', source, { reset: false })
app.$rtdbBind('document', source, {
  reset: () => ({ foo: 'foo' })
})

app.$rtdbBind('document', source).then(doc => {
  doc.val()
})

app.$bind('collection', db.collection('todos')).then(todos => {
  todos.length
})

app.$bind('collection', db.collection('todos'), {
  serialize (snapshot) {
    return { exists: snapshot.exists, ...snapshot.data() }
  }
})

app.$rtdbBind('collection', source, {
  serialize (snapshot) {
    return { exists: snapshot.exists, ...snapshot.val() }
  }
})

app.$bind('todos', todosSorted).then(todos => {
  todos.length
})

app.$unbind('document')
app.$unbind('collection')
app.$rtdbUnbind('collection')

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
