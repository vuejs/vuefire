var Vue = require('vue')
var Firebase = require('firebase')
var VueFire = require('../src/vuefire')
var helpers = require('./helpers')

Vue.use(VueFire)

var demoFirebaseUrl = 'https://' + helpers.generateRandomString() + '.firebaseio-demo.com'

describe('VueFire', function () {
  var firebaseRef

  beforeEach(function (done) {
    firebaseRef = new Firebase(demoFirebaseUrl)
    firebaseRef.remove(function (error) {
      if (error) {
        done(error)
      } else {
        firebaseRef = firebaseRef.child(helpers.generateRandomString())
        done()
      }
    })
  })

  it('throws error for invalid firebase ref', function () {
    helpers.invalidFirebaseRefs.forEach(function (ref) {
      expect(function () {
        new Vue({
          firebase: {
            items: ref
          }
        })
      }).to.throw('VueFire: invalid Firebase binding source.')
    })
  })

  it('binds array records which are objects', function (done) {
    var vm = new Vue({
      firebase: {
        items: firebaseRef
      },
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

  it('binds array records which are primitives', function (done) {
    var vm = new Vue({
      firebase: {
        items: firebaseRef
      },
      template: '<div><div v-for="item in items">{{ item[".key"] }} {{ item[".value"] }} </div></div>'
    }).$mount()
    firebaseRef.set(['first', 'second', 'third'], function () {
      expect(vm.items).to.deep.equal([
        { '.key': '0', '.value': 'first' },
        { '.key': '1', '.value': 'second' },
        { '.key': '2', '.value': 'third' }
      ])
      Vue.nextTick(function () {
        expect(vm.$el.textContent).to.contain('0 first 1 second 2 third')
        done()
      })
    })
  })

  it('binds array records which are a mix of objects and primitives', function (done) {
    var vm = new Vue({
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

  it('binds array records which are a mix of objects and primitives', function (done) {
    var vm = new Vue({
      firebase: {
        items: firebaseRef
      }
    })
    firebaseRef.set(null, function () {
      expect(vm.items).to.deep.equal([])
      done()
    })
  })

  it('binds sparse arrays', function (done) {
    var vm = new Vue({
      firebase: {
        items: firebaseRef
      }
    })
    firebaseRef.set({ 0: 'a', 2: 'b', 5: 'c' }, function () {
      expect(vm.items).to.deep.equal([
        { '.key': '0', '.value': 'a' },
        { '.key': '2', '.value': 'b' },
        { '.key': '5', '.value': 'c' }
      ])
      done()
    })
  })

  it('binds only a subset of records when using limit queries', function (done) {
    var vm = new Vue({
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
})
