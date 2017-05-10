const rollup = require('rollup').rollup
const buble = require('rollup-plugin-buble')
const uglify = require('uglify-js')
const packageData = require('../package.json')
const mkdirp = require('mkdirp')
const { version, author, name } = packageData
// remove the email at the end
const authorName = author.replace(/\s+<.*/, '')
const moduleName = 'VuexFire'

// Make sure dist dir exists
mkdirp('dist')

const {
  logError,
  write,
} = require('./utils')

const banner =
      '/*!\n' +
      ` * ${name} v${version}\n` +
      ` * (c) ${new Date().getFullYear()} ${authorName}\n` +
      ' * Released under the MIT License.\n' +
      ' */'

const bundleOptions = {
  banner,
  exports: 'named',
  format: 'umd',
  moduleName,
}

function createBundle ({ name, format }) {
  rollup({
    entry: 'src/index.js',
    plugins: [
      buble({
        objectAssign: 'Object.assign',
      }),
    ],
  }).then(function (bundle) {
    const options = Object.assign({}, bundleOptions)
    if (format) options.format = format
    const code = bundle.generate(options).code
    if (/min$/.test(name)) {
      const minified = uglify.minify(code, {
        output: {
          preamble: banner,
          ascii_only: true,
        },
      }).code
      return write(`dist/${name}.js`, minified)
    } else {
      return write(`dist/${name}.js`, code)
    }
  }).catch(logError)
}

// Browser bundle (can be used with script)
createBundle({
  name,
})

// Commonjs bundle (preserves process.env.NODE_ENV) so
// the user can replace it in dev and prod mode
createBundle({
  name: `${name}.esm`,
  format: 'es',
})

createBundle({
  name: `${name}.common`,
  format: 'cjs',
})

// Minified version for browser
createBundle({
  name: `${name}.min`,
})
