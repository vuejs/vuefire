/* Returns a random alphabetic string of variable length */
exports.generateRandomString = function () {
  const possibleCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const numPossibleCharacters = possibleCharacters.length

  var text = ''
  for (var i = 0; i < 10; i++) {
    text += possibleCharacters.charAt(Math.floor(Math.random() * numPossibleCharacters))
  }

  return text
}
