<script setup lang="ts">
import {
  push,
  remove,
  ref as dbRef,
  serverTimestamp,
  update,
} from 'firebase/database'
import { ref } from 'vue'
import { useList } from 'vuefire'
import { useDatabase } from '@/firebase'

interface Todo {
  created: Date
  finished: boolean
  text: string
}

const db = useDatabase()
const todosRef = dbRef(db, 'todos')
// TODO:
// const finishedTodos = query(todosRef, where('finished', '==', true))
// const unfinishedTodos = query(todosRef, where('finished', '==', false))

const todos = useList<Todo>(todosRef)

const newTodoText = ref('')

function addTodo() {
  if (newTodoText.value) {
    push(todosRef, {
      text: newTodoText.value,
      finished: false,
      created: serverTimestamp(),
    })
    newTodoText.value = ''
  }
}

function updateTodoText(todo: Todo, newText: string) {
  update(dbRef(db, 'todos/' + todo.id), {
    text: newText,
  })
}

function removeTodo(todo: Todo) {
  remove(dbRef(db, 'todos/' + todo.id))
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
