var path = require('path')

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    reporters: ['spec', 'coverage'],
    files: [
      'tests/vuefire.spec.js'
    ],
    preprocessors: {
      'tests/vuefire.spec.js': ['webpack', 'sourcemap']
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
        { type: 'html', subdir: '.' },
        { type: 'text-summary' }
      ]
    }
  })
}
