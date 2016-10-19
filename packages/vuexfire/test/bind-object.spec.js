var firebase = require('firebase')
var Vue = require('vue')
var Vuex = require('vuex')
var helpers = require('./helpers')
var VuexFire = require('../src')
/* eslint-disable no-native-reassign, no-global-assign */
window.Promise = require('promise-polyfill')

var firebaseApp = firebase.initializeApp({
  apiKey: 'AIzaSyC3eBV8N95k_K67GTfPqf67Mk1P-IKcYng',
  authDomain: 'oss-test.firebaseapp.com',
  databaseURL: 'https://oss-test.firebaseio.com',
  storageBucket: 'oss-test.appspot.com'
})

Vue.use(Vuex)
Vue.use(VuexFire)

var mapGetters = Vuex.mapGetters

describe('Object binding', function () {
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

  var store, computed
  computed = mapGetters(['items', 'bindVar0', 'bindVar1'])
  beforeEach(function () {
    store = new Vuex.Store({
      state: {
        items: {
          '.ref': 'items'
        },
        bindVar0: null,
        bindVar1: null
      },
      getters: {
        items: function (state) { return state.items },
        bindVar0: function (state) { return state.bindVar0 },
        bindVar1: function (state) { return state.bindVar1 }
      },
      mutations: VuexFire.mutations
    })
  })

  it('binds to an Object', function (done) {
    var obj = {
      first: { index: 0 },
      second: { index: 1 },
      third: { index: 2 }
    }
    var vm = new Vue({
      store: store,
      computed: mapGetters(['items', 'bindVar0', 'bindVar1']),
      firebase: {
        items: {
          source: firebaseRef.child('items'),
          asObject: true
        }
      },
      template: '<div>{{ items | json }}</div>'
    }).$mount()
    firebaseRef.child('items').set(obj, function () {
      obj['.key'] = 'items'
      expect(vm.items).to.deep.equal(obj)
      Vue.nextTick(function () {
        expect(vm.$el.textContent).to.contain(JSON.stringify(obj, null, 2))
        done()
      })
    })
  })

  it('binds to a primitive', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: {
          source: firebaseRef.child('items'),
          asObject: true
        }
      },
      template: '<div>{{ items | json }}</div>'
    }).$mount()
    firebaseRef.child('items').set('foo', function () {
      expect(vm.items).to.deep.equal({
        '.key': 'items',
        '.value': 'foo'
      })
      Vue.nextTick(function () {
        expect(vm.$el.textContent).to.contain(JSON.stringify(vm.items, null, 2))
        done()
      })
    })
  })

  it('binds to Firebase reference with no data', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: {
          source: firebaseRef.child('items'),
          asObject: true
        }
      },
      template: '<div>{{ items | json }}</div>'
    }).$mount()
    firebaseRef.child('items').set(null, function () {
      expect(vm.items).to.deep.equal({
        '.key': 'items',
        '.value': null
      })
      Vue.nextTick(function () {
        expect(vm.$el.textContent).to.contain(JSON.stringify(vm.items, null, 2))
        done()
      })
    })
  })

  it('sets the key as null when bound to the root of the database', function (done) {
    var rootRef = firebaseRef.root
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: {
          source: rootRef,
          asObject: true
        }
      },
      template: '<div>{{ items | json }}</div>'
    }).$mount()
    rootRef.set('foo', function () {
      expect(vm.items).to.deep.equal({
        '.key': null,
        '.value': 'foo'
      })
      Vue.nextTick(function () {
        expect(vm.$el.textContent).to.contain(JSON.stringify(vm.items, null, 2))
        done()
      })
    })
  })

  it('binds with limit queries', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: {
          source: firebaseRef.child('items').limitToLast(2),
          asObject: true
        }
      },
      template: '<div>{{ items | json }}</div>'
    }).$mount()
    firebaseRef.child('items').set({
      first: { index: 0 },
      second: { index: 1 },
      third: { index: 2 }
    }, function () {
      expect(vm.items).to.deep.equal({
        '.key': 'items',
        second: { index: 1 },
        third: { index: 2 }
      })
      Vue.nextTick(function () {
        expect(vm.$el.textContent).to.contain(JSON.stringify(vm.items, null, 2))
        done()
      })
    })
  })

  it('binds multiple Firebase references to state variables at the same time', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        bindVar0: {
          source: firebaseRef.child('items0'),
          asObject: true
        },
        bindVar1: {
          source: firebaseRef.child('items1'),
          asObject: true
        }
      },
      template: '<div>{{ bindVar0 | json }} {{ bindVar1 | json }}</div>'
    }).$mount()

    var items0 = {
      first: { index: 0 },
      second: { index: 1 },
      third: { index: 2 }
    }

    var items1 = {
      bar: {
        foo: 'baz'
      },
      baz: true,
      foo: 100
    }

    firebaseRef.set({
      items0: items0,
      items1: items1
    }, function () {
      items0['.key'] = 'items0'
      expect(vm.bindVar0).to.deep.equal(items0)
      items1['.key'] = 'items1'
      expect(vm.bindVar1).to.deep.equal(items1)
      Vue.nextTick(function () {
        expect(vm.$el.textContent).to.contain(JSON.stringify(vm.bindVar0, null, 2))
        expect(vm.$el.textContent).to.contain(JSON.stringify(vm.bindVar1, null, 2))
        done()
      })
    })
  })

  it('binds a mixture of arrays and objects to state variables at the same time', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        bindVar0: {
          source: firebaseRef.child('items0'),
          asObject: true
        },
        bindVar1: {
          source: firebaseRef.child('items1'),
          asObject: false
        }
      },
      template: '<div>{{ bindVar0 | json }} {{ bindVar1 | json }}</div>'
    }).$mount()

    var items0 = {
      first: { index: 0 },
      second: { index: 1 },
      third: { index: 2 }
    }

    var items1 = {
      bar: {
        foo: 'baz'
      },
      baz: true,
      foo: 100
    }

    firebaseRef.set({
      items0: items0,
      items1: items1
    }, function () {
      items0['.key'] = 'items0'
      expect(vm.bindVar0).to.deep.equal(items0)
      expect(vm.bindVar1).to.deep.equal([
        { '.key': 'bar', foo: 'baz' },
        { '.key': 'baz', '.value': true },
        { '.key': 'foo', '.value': 100 }
      ])
      Vue.nextTick(function () {
        expect(vm.$el.textContent).to.contain(JSON.stringify(vm.bindVar0, null, 2))
        expect(vm.$el.textContent).to.contain(JSON.stringify(vm.bindVar1, null, 2))
        done()
      })
    })
  })

  it('binds with $bindAsObject after $unbind', function (done) {
    var obj = {
      first: { index: 0 },
      second: { index: 1 },
      third: { index: 2 }
    }
    var objOther = {
      onlyOne: { index: 0 },
      second: { index: 1 }
    }
    var vm = new Vue({
      store: store,
      computed: computed,
      template: '<div>{{ items | json }}</div>',
      created: function () {
        this.$bindAsObject('items', firebaseRef.child('items'))
      }
    }).$mount()
    firebaseRef.child('items').set(obj, function () {
      obj['.key'] = 'items'
      expect(vm.items).to.deep.equal(obj)
      vm.$unbind('items')
      vm.$bindAsObject('items', firebaseRef.child('others'))
      firebaseRef.child('others').set(objOther, function () {
        objOther['.key'] = 'others'
        expect(vm.items).to.deep.equal(objOther)
        done()
      })
    })
  })

  it('binds with $bindAsObject', function (done) {
    var obj = {
      first: { index: 0 },
      second: { index: 1 },
      third: { index: 2 }
    }
    var vm = new Vue({
      store: store,
      computed: computed,
      template: '<div>{{ items | json }}</div>',
      created: function () {
        this.$bindAsObject('items', firebaseRef.child('items'))
      }
    }).$mount()
    firebaseRef.child('items').set(obj, function () {
      obj['.key'] = 'items'
      expect(vm.items).to.deep.equal(obj)
      Vue.nextTick(function () {
        expect(vm.$el.textContent).to.contain(JSON.stringify(obj, null, 2))
        done()
      })
    })
  })
})
