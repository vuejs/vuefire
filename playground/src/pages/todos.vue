<script setup lang="ts">
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { ref } from 'vue'
import { useCollection, useFirestore } from 'vuefire'

interface Todo {
  created: Date
  finished: boolean
  text: string
}

// TODO: expose some kind of type to make this posssible
// type TodoData = _VueFireQueryData<Todo>

const db = useFirestore()
const todosRef = collection(db, 'todos')
const todosWithConverterRef = collection(db, 'todos').withConverter<Todo>({
  toFirestore(todoModel) {
    const { id, ...todo } = todoModel
    return todo
  },
  fromFirestore(snapshot, options) {
    const todoData = snapshot.data(options) as Omit<Todo, 'id'>
    return {
      id: snapshot.id,
      ...todoData,
    }
  },
})
const finishedTodos = query(todosRef, where('finished', '==', true))
const unfinishedTodos = query(todosRef, where('finished', '==', false))

const todos = useCollection<Todo>(todosRef)
const todosConverted = useCollection(todosWithConverterRef)

const newTodoText = ref('')

function addTodo() {
  if (newTodoText.value) {
    addDoc(todosRef, {
      text: newTodoText.value,
      finished: false,
      created: serverTimestamp(),
    })
    newTodoText.value = ''
  }
}

function updateTodoText(todo: Todo, newText: string) {
  updateDoc(doc(db, 'todos', todo.id), {
    text: newText,
  })
}

function removeTodo(todo: Todo) {
  deleteDoc(doc(db, 'todos', todo.id))
}

function toggleTodos() {
  // TODO:
}
</script>

<template>
  <button @click="toggleTodos">Toggle todos</button> <br />
  <form @submit.prevent="addTodo">
    <input v-model.trim="newTodoText" placeholder="Add new todo" />
    <button>Add Todo</button>
  </form>
  <ul>
    <li v-for="todo in todos">
      <input
        :value="todo.text"
        @input="updateTodoText(todo, $event.target.value)"
      />
      <button @click="removeTodo(todo)">X</button>
    </li>
  </ul>
</template>
