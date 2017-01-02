const rollup = require('rollup').rollup
const buble = require('rollup-plugin-buble')
const uglify = require('uglify-js')
const packageData = require('../package.json')
const { version, author, name } = packageData
// remove the email at the end
const authorName = author.replace(/\s+<.*/, '')
const moduleName = 'VuexFire'

const {
  logError,
  write
} = require('./utils')

const banner =
      '/*!\n' +
      ` * ${name} v${version}\n` +
      ` * (c) ${new Date().getFullYear()} ${authorName}\n` +
      ' * Released under the MIT License.\n' +
      ' */'

rollup({
  entry: 'src/index.js',
  plugins: [
    buble()
  ]
}).then(function (bundle) {
  var code = bundle.generate({
    format: 'umd',
    exports: 'named',
    banner,
    moduleName
  }).code
  return write(`dist/${name}.js`, code).then(function () {
    return code
  })
}).then(function (code) {
  var minified = uglify.minify(code, {
    fromString: true,
    output: {
      preamble: banner,
      ascii_only: true
    }
  }).code
  return write(`dist/${name}.min.js`, minified)
}).catch(logError)
