var Vue = require('vue/dist/vue.js')
var Vuex = require('vuex')
var helpers = require('./helpers')
var VuexFire = require('../src')
/* eslint-disable no-native-reassign, no-global-assign */
window.Promise = require('promise-polyfill')

var firebaseApp = helpers.createFirebaseApp()

Vue.use(Vuex)
Vue.use(VuexFire)

var mapGetters = Vuex.mapGetters

describe('Unbind', function () {
  var firebaseRef

  beforeEach(function (done) {
    helpers.createRef(firebaseApp)
      .then(function (ref) {
        firebaseRef = ref
        done()
      })
      .catch(done)
  })

  var store, computed
  computed = mapGetters(['items', 'item0', 'item1'])
  beforeEach(function () {
    store = new Vuex.Store({
      state: {
        items: null,
        item0: null,
        item1: null
      },
      getters: {
        items: function (state) { return state.items },
        item0: function (state) { return state.item0 },
        item1: function (state) { return state.item1 }
      },
      mutations: VuexFire.mutations
    })
  })

  it('should work properly for instances with no firebase bindings', function () {
    expect(function () {
      var vm = new Vue()
      vm.$destroy()
    }).not.to.throw()
  })

  it('unbinds the state bound to Firebase as an array', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef
      }
    })
    firebaseRef.set({
      first: { index: 0 },
      second: { index: 1 },
      third: { index: 2 }
    }, function () {
      vm.$unbind('items')
      expect(vm.items).to.be.null
      expect(vm.$firebaseRefs.items).to.be.null
      expect(vm._firebaseSources.items).to.be.null
      expect(vm._firebaseListeners.items).to.be.null
      done()
    })
  })

  it('unbinds the state bound to Firebase as an object', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: {
          source: firebaseRef,
          asObject: true
        }
      }
    })
    firebaseRef.set({
      first: { index: 0 },
      second: { index: 1 },
      third: { index: 2 }
    }, function () {
      vm.$unbind('items')
      expect(vm.items).to.be.null
      expect(vm.$firebaseRefs.items).to.be.null
      expect(vm._firebaseSources.items).to.be.null
      expect(vm._firebaseListeners.items).to.be.null
      done()
    })
  })

  it('unbinds all bound state when the component unmounts', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        item0: firebaseRef,
        item1: {
          source: firebaseRef,
          asObject: true
        }
      }
    })
    sinon.spy(vm, '$unbind')
    firebaseRef.set({
      first: { index: 0 },
      second: { index: 1 },
      third: { index: 2 }
    }, function () {
      expect(vm.$store.state.item0).to.not.be.null
      expect(vm.$store.state.item1).to.not.be.null
      vm.$destroy()
      expect(vm.$unbind).to.have.been.calledTwice
      expect(vm.$store.state.item0).to.be.null
      expect(vm.$store.state.item1).to.be.null
      done()
    })
  })

  it('handles already unbound state when the component unmounts', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        item0: firebaseRef,
        item1: {
          source: firebaseRef,
          asObject: true
        }
      }
    })
    sinon.spy(vm, '$unbind')
    firebaseRef.set({
      first: { index: 0 },
      second: { index: 1 },
      third: { index: 2 }
    }, function () {
      expect(vm.$store.state.item0).to.not.be.null
      expect(vm.$store.state.item1).to.not.be.null
      vm.$unbind('item0')
      vm.$destroy()
      expect(vm.$unbind).to.have.been.calledTwice
      expect(vm.$store.state.item0).to.be.null
      expect(vm.$store.state.item1).to.be.null
      done()
    })
  })
})
