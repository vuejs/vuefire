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

  it('should pass', function () {
    expect(1).to.equal(1)
  })
})
