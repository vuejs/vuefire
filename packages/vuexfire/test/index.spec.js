var firebase = require('firebase')
var Vue = require('vue')
var Vuex = require('vuex')
var helpers = require('./helpers')
var VueFirex = require('../src')

var firebaseApp = firebase.initializeApp({
  apiKey: helpers.generateRandomString(),
  databaseURL: 'https://' + helpers.generateRandomString() + '.firebaseio-demo.com'
})

Vue.use(Vuex)
Vue.use(VueFirex)

describe('VueFirex', function () {
  var firebaseRef

  beforeEach(function (done) {
    firebaseRef = firebaseApp.database().ref()
    firebaseRef.remove(function (error) {
      if (error) {
        done(error)
      } else {
        firebaseRef = firebaseRef.child(helpers.generateRandomString())
        done()
      }
    })
  })

  describe('Array binding', function () {
    var store, vm

    beforeEach(function () {
      store = new Vuex.Store({
        state: {
          items: {
            '.ref': 'items'
          }
        },
        mutations: {}
      })
      vm = new Vue({
        store: store,
        vuex: {
          getters: {
            items: function (state) { return state.items }
          }
        },
        firebase: {
          items: firebaseRef
        },
        template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item.index }} </div></div>'
      }).$mount()
    })

    it('binds an array by default', function (done) {
      firebaseRef.set({
        first: { index: 0 },
        second: { index: 1 },
        third: { index: 2 }
      }, function () {
        expect(vm.items).to.deep.equal([
          { '.key': 'first', index: 0 },
          { '.key': 'second', index: 1 },
          { '.key': 'third', index: 2 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('first 0 second 1 third 2')
          done()
        })
      })
    })
  })
})
