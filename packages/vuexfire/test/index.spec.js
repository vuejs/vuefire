var firebase = require('firebase')
var Vue = require('vue')
var Vuex = require('vuex')
var helpers = require('./helpers')
var VuexFire = require('../src')

var firebaseApp = firebase.initializeApp({
  apiKey: helpers.generateRandomString(),
  databaseURL: 'https://' + helpers.generateRandomString() + '.firebaseio-demo.com'
})

Vue.use(Vuex)
Vue.use(VuexFire)

describe('VuexFire', function () {
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

  describe('Errors', function () {
    var store
    beforeEach(function () {
      store = new Vuex.Store({
        state: {
          items: []
        },
        mutations: {}
      })
    })

    it('throws error for invalid firebase ref', function () {
      helpers.invalidFirebaseRefs.forEach(function (ref) {
        expect(function () {
          new Vue({
            store: store,
            firebase: {
              items: ref
            }
          })
        }).to.throw('VuexFire: invalid Firebase binding source.')
      })
    })

    it('throws if vuex is not available', function () {
      expect(function () {
        new Vue({
          firebase: {}
        })
      }).to.throw('VuexFire: missing Vuex. Install Vuex before VuexFire')
    })

    it('throws when trying to binding to a non existing key', function () {
      expect(function () {
        new Vue({
          store: store,
          firebase: {
            foo: firebaseRef
          }
        })
      }).to.throw('VuexFire: bind failed: "foo" is not defined in the store state')
    })

    it('throws with wrong source')
  })

  describe('Array binding', function () {
    var store, vuex
    vuex = {
      getters: {
        items: function (state) { return state.items }
      }
    }
    beforeEach(function () {
      store = new Vuex.Store({
        state: {
          items: {
            '.ref': 'items'
          }
        },
        mutations: {}
      })
    })

    it('binds an array of objects', function (done) {
      var vm = new Vue({
        store: store,
        vuex: vuex,
        firebase: {items: firebaseRef},
        template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item.index }} </div></div>'
      }).$mount()
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

    it('binds an array of primitives', function (done) {
      var vm = new Vue({
        store: store,
        vuex: vuex,
        firebase: {items: firebaseRef},
        template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
      }).$mount()
      firebaseRef.set([0, 1, 2], function () {
        console.log(vm.items)
        expect(vm.items).to.deep.equal([
          { '.key': '0', '.value': 0 },
          { '.key': '1', '.value': 1 },
          { '.key': '2', '.value': 2 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('0 0 1 1 2 2')
          done()
        })
      })
    })
  })
})
