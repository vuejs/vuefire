module.exports = {
  invalidFirebaseRefs: [null, undefined, true, false, [], 0, 5, '', 'a', ['hi', 1]],
  invalidBindVars: ['', 1, true, false, [], {}, [1, 2], {a: 1}, null, undefined, 'te.st', 'te$st', 'te[st', 'te]st', 'te#st', 'te/st', 'a#i]$da[s', 'te/nst', 'te/rst', 'te/u0000st', 'te/u0015st', 'te/007Fst', Array(800).join('a')],

  /* Returns a random alphabetic string of variable length */
  generateRandomString: function () {
    var possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var numPossibleCharacters = possibleCharacters.length

    var text = ''
    for (var i = 0; i < 10; i++) {
      text += possibleCharacters.charAt(Math.floor(Math.random() * numPossibleCharacters))
    }

    return text
  }
}
