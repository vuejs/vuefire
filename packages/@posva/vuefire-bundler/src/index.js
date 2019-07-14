const rollup = require('rollup').rollup
const buble = require('rollup-plugin-buble')
const resolve = require('rollup-plugin-node-resolve')
const uglify = require('uglify-js')
const mkdirp = require('mkdirp')
const { logError, write } = require('./utils')

const { pwd, rm } = require('shelljs')
const { join } = require('path')

const cwd = pwd().toString()
const packageData = require(join(cwd, 'package.json'))
const { version, author, name } = packageData
// remove the email at the end
const authorName = author.name

// Make sure dist dir exists
const distFolder = join(cwd, 'dist')
rm('-rf', distFolder)
mkdirp(distFolder)

const bundleOptions = {
  exports: 'auto',
  format: 'umd',
}

const plugins = [
  // replace({
  //   __VERSION__: version,
  //   // 'process.env.NODE_ENV': '"development"',
  // }),
  resolve({
    extensions: ['.js', '.vue', '.jsx', '.json'],
  }),
  buble({
    objectAssign: 'Object.assign',
    transforms: {
      dangerousForOf: true,
    },
  }),
]

function createBundle({ filename, format, moduleName, banner }) {
  rollup({
    input: join(cwd, 'src/index.js'),
    plugins,
  })
    .then(bundle => {
      const options = Object.assign({ banner, name: moduleName }, bundleOptions)
      if (format) options.format = format
      return bundle.generate(options)
    })
    .then(({ output }) => {
      const code = output[0].code
      if (/min$/.test(filename)) {
        const minified = uglify.minify(code, {
          output: {
            preamble: banner,
            ascii_only: true,
          },
        }).code
        return write(`${distFolder}/${filename}.js`, minified)
      } else {
        return write(`${distFolder}/${filename}.js`, code)
      }
    })
    .catch(logError)
}

module.exports = function run(moduleName) {
  const banner =
    '/*!\n' +
    ` * ${name} v${version}\n` +
    ` * (c) ${new Date().getFullYear()} ${authorName}\n` +
    ' * Released under the MIT License.\n' +
    ' */'

  // Browser bundle (can be used with script)
  createBundle({
    banner,
    filename: name,
    moduleName,
  })

  // Commonjs bundle (preserves process.env.NODE_ENV) so
  // the user can replace it in dev and prod mode
  createBundle({
    banner,
    filename: `${name}.esm`,
    format: 'es',
    moduleName,
  })

  createBundle({
    banner,
    filename: `${name}.common`,
    format: 'cjs',
    moduleName,
  })

  // Minified version for browser
  createBundle({
    banner,
    filename: `${name}.min`,
    moduleName,
  })
}
