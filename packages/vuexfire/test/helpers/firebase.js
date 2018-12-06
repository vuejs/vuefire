var firebase = require('firebase')

exports.invalidFirebaseRefs = [null, undefined, true, false, [], 0, 5, '', 'a', ['hi', 1]]

/* Returns a random alphabetic string of variable length */
exports.generateRandomString = function generateRandomString () {
  const possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const numPossibleCharacters = possibleCharacters.length

  var text = ''
  for (var i = 0; i < 10; i++) {
    text += possibleCharacters.charAt(Math.floor(Math.random() * numPossibleCharacters))
  }

  return text
}

exports.createFirebaseApp = function createFirebaseApp () {
  return firebase.initializeApp({
    apiKey: 'AIzaSyC3eBV8N95k_K67GTfPqf67Mk1P-IKcYng',
    authDomain: 'oss-test.firebaseapp.com',
    databaseURL: 'https://oss-test.firebaseio.com',
    storageBucket: 'oss-test.appspot.com'
  })
}

exports.createRef = function createRef (firebaseApp) {
  const firebaseRef = firebaseApp.database().ref().child('vuexfire')
  return new Promise(function (resolve, reject) {
    firebaseRef.remove(function (error) {
      if (error) {
        reject(error)
      } else {
        resolve(firebaseRef.child(exports.generateRandomString()))
      }
    })
  })
}
