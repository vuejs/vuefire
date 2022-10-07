<script setup lang="ts">
import { addDoc, collection, doc, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { ref } from 'vue'
import { firestoreBind } from 'vuefire';
import { useFirestore } from '@/firestore';

interface Todo {
  created: Date
  finished: boolean
  text: string
}

const db = useFirestore();
const todosRef = collection(db, 'todos')
const finishedTodos = query(todosRef, where('finished', '==', true))
const unfinishedTodos = query(todosRef, where('finished', '==', false))

const todos = ref<Todo[]>([]);
// TODO: return an augmented typed ref
firestoreBind(todos, todosRef);

const newTodoText = ref('')

function addTodo() {
  if (newTodoText.value) {
    addDoc(todosRef, {
      text: newTodoText.value,
      finished: false,
      created: serverTimestamp()
    })
    newTodoText.value = ''
  }
}

function updateTodoText(todo: any, newText: string) {
  console.log('update', todo)
  return
  updateDoc(doc(db, 'todos', todo.id), {
    text: newText
  })

}

function removeTodo() { }

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
      <input :value="todo.text" @input="updateTodoText(todo, $event.target.value)" />
      <button @click="removeTodo(todo)">X</button>
    </li>
  </ul>
</template>
