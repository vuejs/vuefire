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

describe('Array binding', function () {
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

  it('binds an array of objects', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
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
      computed: computed,
      firebase: {items: firebaseRef},
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
    }).$mount()
    firebaseRef.set([0, 1, 2], function () {
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

  it('binds an array mixed with objects and primitives', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} {{ item.index}}</div></div>'
    }).$mount()
    firebaseRef.set({
      0: 'first',
      1: 'second',
      third: { index: 2 }
    }, function () {
      expect(vm.items).to.deep.equal([
        { '.key': '0', '.value': 'first' },
        { '.key': '1', '.value': 'second' },
        { '.key': 'third', index: 2 }
      ])
      Vue.nextTick(function () {
        expect(vm.$el.textContent).to.contain('0 first 1 second third  2')
        done()
      })
    })
  })

  it('binds an empty array by default', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef
      }
    })
    firebaseRef.set(null, function () {
      expect(vm.items).to.deep.equal([])
      done()
    })
  })

  it('binds only a subset of records when using limit queries', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef.limitToLast(2)
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
    }).$mount()
    firebaseRef.set({ a: 1, b: 2, c: 3 }, function () {
      expect(vm.items).to.deep.equal([
        { '.key': 'b', '.value': 2 },
        { '.key': 'c', '.value': 3 }
      ])
      Vue.nextTick(function () {
        expect(vm.$el.textContent).to.contain('b 2 c 3')
        done()
      })
    })
  })

  it('removes records when they fall outside of a limit query', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef.limitToLast(2)
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
    }).$mount()
    firebaseRef.set({ a: 1, b: 2, c: 3 }, function () {
      firebaseRef.child('d').set(4, function () {
        expect(vm.items).to.deep.equal([
          { '.key': 'c', '.value': 3 },
          { '.key': 'd', '.value': 4 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('c 3 d 4')
          done()
        })
      })
    })
  })

  it('adds a new record when an existing record in the limit query is removed', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef.limitToLast(2)
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
    }).$mount()
    firebaseRef.set({ a: 1, b: 2, c: 3 }, function () {
      firebaseRef.child('b').remove(function () {
        expect(vm.items).to.deep.equal([
          { '.key': 'a', '.value': 1 },
          { '.key': 'c', '.value': 3 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('a 1 c 3')
          done()
        })
      })
    })
  })

  it('binds records in the correct order when using ordered queries', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef.orderByValue()
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
    }).$mount()
    firebaseRef.set({ a: 2, b: 1, c: 3 }, function () {
      expect(vm.items).to.deep.equal([
        { '.key': 'b', '.value': 1 },
        { '.key': 'a', '.value': 2 },
        { '.key': 'c', '.value': 3 }
      ])
      Vue.nextTick(function () {
        expect(vm.$el.textContent).to.contain('b 1 a 2 c 3')
        done()
      })
    })
  })

  it('binds multiple Firebase references to state variables at the same time', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        bindVar0: firebaseRef.child('items0'),
        bindVar1: firebaseRef.child('items1')
      },
      template:
      '<div>' +
        '<div v-for="item in bindVar0">{{ item[".key"] }} {{ item.index }} </div>' +
        '<div v-for="item in bindVar1">{{ item[".key"] }} {{ item[".value"] }} </div>' +
        '</div>'
    }).$mount()
    firebaseRef.set({
      items0: {
        first: { index: 0 },
        second: { index: 1 },
        third: { index: 2 }
      },
      items1: ['first', 'second', 'third']
    }, function () {
      expect(vm.bindVar0).to.deep.equal([
        { '.key': 'first', index: 0 },
        { '.key': 'second', index: 1 },
        { '.key': 'third', index: 2 }
      ])

      expect(vm.bindVar1).to.deep.equal([
        { '.key': '0', '.value': 'first' },
        { '.key': '1', '.value': 'second' },
        { '.key': '2', '.value': 'third' }
      ])
      Vue.nextTick(function () {
        expect(vm.$el.textContent).to.contain('first 0 second 1 third 2')
        expect(vm.$el.textContent).to.contain('0 first 1 second 2 third')
        done()
      })
    })
  })

  it('updates an array record when its value changes', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] || item.foo }} </div></div>'
    }).$mount()
    firebaseRef.set({ a: 1, b: 2, c: 3 }, function () {
      firebaseRef.child('b').set({ foo: 'bar' }, function () {
        expect(vm.items).to.deep.equal([
          { '.key': 'a', '.value': 1 },
          { '.key': 'b', foo: 'bar' },
          { '.key': 'c', '.value': 3 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('a 1 b bar c 3')
          done()
        })
      })
    })
  })

  it('removes an array record when it is deleted', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
    }).$mount()
    firebaseRef.set({ a: 1, b: 2, c: 3 }, function () {
      firebaseRef.child('b').remove(function () {
        expect(vm.items).to.deep.equal([
          { '.key': 'a', '.value': 1 },
          { '.key': 'c', '.value': 3 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('a 1 c 3')
          done()
        })
      })
    })
  })

  it('moves an array record when its order changes (moved to start of array) [orderByValue()]', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef.orderByValue()
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
    }).$mount()
    firebaseRef.set({ a: 2, b: 3, c: 2 }, function () {
      firebaseRef.child('b').set(1, function () {
        expect(vm.items).to.deep.equal([
          { '.key': 'b', '.value': 1 },
          { '.key': 'a', '.value': 2 },
          { '.key': 'c', '.value': 2 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('b 1 a 2 c 2')
          done()
        })
      })
    })
  })

  it('moves an array record when its order changes (moved to middle of array) [orderByValue()]', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef.orderByValue()
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
    }).$mount()
    firebaseRef.set({ a: 2, b: 1, c: 4 }, function () {
      expect(vm.items).to.deep.equal([
        { '.key': 'b', '.value': 1 },
        { '.key': 'a', '.value': 2 },
        { '.key': 'c', '.value': 4 }
      ])
      firebaseRef.child('b').set(3, function () {
        expect(vm.items).to.deep.equal([
          { '.key': 'a', '.value': 2 },
          { '.key': 'b', '.value': 3 },
          { '.key': 'c', '.value': 4 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('a 2 b 3 c 4')
          done()
        })
      })
    })
  })

  it('moves an array record when it\'s order changes (moved to end of array) [orderByValue()]', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef.orderByValue()
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
    }).$mount()
    firebaseRef.set({ a: 2, b: 1, c: 3 }, function () {
      firebaseRef.child('b').set(4, function () {
        expect(vm.items).to.deep.equal([
          { '.key': 'a', '.value': 2 },
          { '.key': 'c', '.value': 3 },
          { '.key': 'b', '.value': 4 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('a 2 c 3 b 4')
          done()
        })
      })
    })
  })

  it('moves an array record when it\'s order changes (moved to start of array) [orderByChild()]', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef.orderByChild('value')
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item.value }} </div></div>'
    }).$mount()
    firebaseRef.set({
      a: { value: 2 },
      b: { value: 3 },
      c: { value: 2 }
    }, function () {
      firebaseRef.child('b').set({ value: 1 }, function () {
        expect(vm.items).to.deep.equal([
          { '.key': 'b', value: 1 },
          { '.key': 'a', value: 2 },
          { '.key': 'c', value: 2 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('b 1 a 2 c 2')
          done()
        })
      })
    })
  })

  it('moves an array record when it\'s order changes (moved to middle of array) [orderByChild()]', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef.orderByChild('value')
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item.value }} </div></div>'
    }).$mount()
    firebaseRef.set({
      a: { value: 2 },
      b: { value: 1 },
      c: { value: 4 }
    }, function () {
      firebaseRef.child('b').set({ value: 3 }, function () {
        expect(vm.items).to.deep.equal([
          { '.key': 'a', value: 2 },
          { '.key': 'b', value: 3 },
          { '.key': 'c', value: 4 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('a 2 b 3 c 4')
          done()
        })
      })
    })
  })

  it('moves an array record when it\'s order changes (moved to end of array) [orderByChild()]', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef.orderByChild('value')
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item.value }} </div></div>'
    }).$mount()
    firebaseRef.set({
      a: { value: 2 },
      b: { value: 1 },
      c: { value: 3 }
    }, function () {
      firebaseRef.child('b').set({ value: 4 }, function () {
        expect(vm.items).to.deep.equal([
          { '.key': 'a', value: 2 },
          { '.key': 'c', value: 3 },
          { '.key': 'b', value: 4 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('a 2 c 3 b 4')
          done()
        })
      })
    })
  })

  it('works with orderByKey() queries', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      firebase: {
        items: firebaseRef.orderByKey()
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
    }).$mount()
    firebaseRef.set({ b: 2, c: 1, d: 3 }, function () {
      firebaseRef.update({ a: 4, d: 4, e: 0 }, function () {
        expect(vm.items).to.deep.equal([
          { '.key': 'a', '.value': 4 },
          { '.key': 'b', '.value': 2 },
          { '.key': 'c', '.value': 1 },
          { '.key': 'd', '.value': 4 },
          { '.key': 'e', '.value': 0 }
        ])
        Vue.nextTick(function () {
          expect(vm.$el.textContent).to.contain('a 4 b 2 c 1 d 4 e 0')
          done()
        })
      })
    })
  })

  it('bind using $bindAsArray', function (done) {
    var vm = new Vue({
      store: store,
      computed: computed,
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item.index }} </div></div>',
      created: function () {
        this.$bindAsArray('items', firebaseRef)
      }
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

  it('bind using $bindAsArray after $unbind', function (done) {
    var refItems = firebaseRef.child('items')
    var refOther = firebaseRef.child('other')
    var vm = new Vue({
      store: store,
      computed: computed,
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item.index }} </div></div>',
      created: function () {
        this.$bindAsArray('items', refItems)
      }
    }).$mount()
    refItems.set({
      first: { index: 0 },
      second: { index: 1 },
      third: { index: 2 }
    }, function () {
      expect(vm.items).to.deep.equal([
        { '.key': 'first', index: 0 },
        { '.key': 'second', index: 1 },
        { '.key': 'third', index: 2 }
      ])
      vm.$unbind('items')
      vm.$bindAsArray('items', refOther)
      refOther.set({
        a: { index: 0 },
        b: { index: 1 },
        c: { index: 2 }
      }, function () {
        expect(vm.items).to.deep.equal([
          { '.key': 'a', index: 0 },
          { '.key': 'b', index: 1 },
          { '.key': 'c', index: 2 }
        ])
        done()
      })
    })
  })
})
