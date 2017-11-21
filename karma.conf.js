var path = require('path')
process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'sinon-chai'],
    browsers: ['ChromeHeadless'],
    reporters: ['spec', 'coverage'],
    files: [
      'tests/vuefire.spec.js'
    ],
    preprocessors: {
      'tests/vuefire.spec.js': ['webpack', 'sourcemap']
    },
    client: {
      mocha: {
        timeout: 10000
      }
    },
    webpack: {
      devtool: '#inline-source-map',
      module: {
        loaders: [{
          include: path.resolve(__dirname, 'src/vuefire.js'),
          loader: 'istanbul-instrumenter'
        }]
      }
    },
    webpackMiddleware: {
      noInfo: true
    },
    coverageReporter: {
      reporters: [
        { type: 'lcov', subdir: '.' },
        { type: 'text-summary' }
      ]
    }
  })
}
