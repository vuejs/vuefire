var config = {
  apiKey: "YourCONFIGhere",
  authDomain: "YourCONFIGhere",
  databaseURL: "YourCONFIGhere",
  projectId: "YourCONFIGhere",
  storageBucket: "YourCONFIGhere",
  messagingSenderId: "YourCONFIGhere"
};

var firebaseApp = firebase.initializeApp({config})


var db = firebaseApp.ref('todos')

var vm = new Vue({
el: '#app',
       data: {
         newTodoText: ''
       },
       firebase: {
         todos: db.limitToLast(25)
       },
       methods: {
         addTodo: function () {
           if (this.newTodoText) {
             db.push({
               text: this.newTodoText
             })
             this.newTodoText = ''
           }
         },
         updateTodoText: function (todo, newText) {
           db.child(todo['.key']).child('text').set(newText)
         },
         removeTodo: function (todo) {
           db.child(todo['.key']).remove()
         }
       }
})