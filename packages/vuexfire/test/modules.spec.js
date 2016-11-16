var Vue = require('vue/dist/vue.js')
var Vuex = require('vuex')
var helpers = require('./helpers')
var VuexFire = require('../src')
var utils = require('../src/utils/modules')
/* eslint-disable no-native-reassign, no-global-assign */
window.Promise = require('promise-polyfill')

var firebaseApp = helpers.createFirebaseApp()

Vue.use(Vuex)
Vue.use(VuexFire)

var mapGetters = Vuex.mapGetters

describe('Vuex Modules', function () {
  var firebaseRef

  beforeEach(function (done) {
    helpers.createRef(firebaseApp)
      .then(function (ref) {
        firebaseRef = ref
        done()
      })
      .catch(done)
  })

  var store
  var cartModule = {
    state: {
      items: null
    },
    getters: {
      lastItem: function (state) {
        return state.items[state.items.length - 1]
      },
      items: function (state) { return state.items }
    },
    mutations: VuexFire.moduleMutations('cart') // TODO function
  }
  beforeEach(function () {
    store = new Vuex.Store({
      modules: {
        cart: cartModule,
        user: {
          modules: {
            cart: {
              state: { items: null },
              getters: {
                userItems: function (state) { return state.items }
              },
              mutations: VuexFire.moduleMutations('user.cart')
            }
          }
        }
      },
      mutations: VuexFire.mutations
    })
  })

  it('generates a mutations object', function () {
    var cartMutations = VuexFire.moduleMutations('cart')
    var cartMutationsNames = Object.keys(cartMutations)

    expect(cartMutationsNames).to.include('cart/VUEXFIRE/objectValue')
    expect(cartMutationsNames).to.include('cart/VUEXFIRE/arrayChange')
    expect(cartMutationsNames).to.include('cart/VUEXFIRE/arrayAdd')
    expect(cartMutationsNames).to.include('cart/VUEXFIRE/arrayRemove')
    expect(cartMutationsNames).to.include('cart/VUEXFIRE/arrayMove')

    cartMutationsNames.forEach(function (m) {
      expect(cartMutations[m]).to.be.a('function')
    })
  })

  it('splits a key into a module path', function () {
    expect(utils.getModuleFromKey('items')).to.equal('')
    expect(utils.getModuleFromKey('cart.items')).to.equal('cart')
    expect(utils.getModuleFromKey('user.cart.items')).to.equal('user/cart')
  })

  it('binds an array in a submodule', function (done) {
    var vm = new Vue({
      store: store,
      computed: mapGetters(['items', 'lastItem']),
      firebase: {
        'cart.items': firebaseRef.child('items')
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
    }).$mount()

    firebaseRef.child('items').set([0, 1, 2], function () {
      expect(vm.items).to.deep.equal([
        { '.key': '0', '.value': 0 },
        { '.key': '1', '.value': 1 },
        { '.key': '2', '.value': 2 }
      ])
      firebaseRef.child('items').set([1, 2], function () {
        expect(vm.items).to.deep.equal([
          { '.key': '0', '.value': 1 },
          { '.key': '1', '.value': 2 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('0 1 1 2')
          done()
        })
      })
    })
  })

  it('binds in a nested module', function (done) {
    var vm = new Vue({
      store: store,
      computed: mapGetters({ items: 'userItems' }),
      firebase: {
        'user.cart.items': firebaseRef.child('items')
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
    }).$mount()

    firebaseRef.child('items').set([0, 1, 2], function () {
      expect(vm.items).to.deep.equal([
        { '.key': '0', '.value': 0 },
        { '.key': '1', '.value': 1 },
        { '.key': '2', '.value': 2 }
      ])
      firebaseRef.child('items').set([1, 2], function () {
        expect(vm.items).to.deep.equal([
          { '.key': '0', '.value': 1 },
          { '.key': '1', '.value': 2 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('0 1 1 2')
          done()
        })
      })
    })
  })

  it('binds and object in a module', function (done) {
    var obj = {
      first: { index: 0 },
      second: { index: 1 },
      third: { index: 2 }
    }
    var vm = new Vue({
      store: store,
      computed: mapGetters(['items']),
      firebase: {
        'cart.items': {
          source: firebaseRef.child('items'),
          asObject: true
        }
      },
      template: '<div>{{ items }}</div>'
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
