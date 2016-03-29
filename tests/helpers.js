exports.invalidFirebaseRefs = [null, undefined, true, false, [], 0, 5, '', 'a', ['hi', 1]]

/* Returns a random alphabetic string of variable length */
exports.generateRandomString = function () {
  var possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var numPossibleCharacters = possibleCharacters.length

  var text = ''
  for (var i = 0; i < 10; i++) {
    text += possibleCharacters.charAt(Math.floor(Math.random() * numPossibleCharacters))
  }

  return text
}
