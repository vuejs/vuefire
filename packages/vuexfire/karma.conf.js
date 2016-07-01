var path = require('path')

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'sinon-chai'],
    browsers: ['PhantomJS'],
    reporters: ['spec', 'coverage'],
    files: [
      {
        pattern: 'test/*.spec.js',
        watched: false,
        included: true,
        served: true
      }
    ],
    preprocessors: {
      'test/*.spec.js': ['webpack', 'sourcemap']
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
          test: /\.js$/,
          include: path.resolve(__dirname, 'src'),
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
