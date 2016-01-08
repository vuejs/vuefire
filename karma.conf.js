module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    reporters: ['progress', 'coverage'],
    files: [
      'node_modules/vue/dist/vue.js',
      'src/*.js',
      'tests/*.js'
    ],
    preprocessors: {
      'src/*.js': 'coverage'
    },
    coverageReporter: {
      reporters: [
        { type: 'html', subdir: '.' },
        { type: 'text-summary' }
      ]
    }
  })
}
