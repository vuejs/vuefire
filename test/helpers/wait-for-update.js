import Vue from 'vue'

// Testing helper
// nextTick().then(() => {
//
// Automatically waits for nextTick
// }).then(() => {
// return a promise or value to skip the wait
// })
function oldtick () {
  const jobs = []
  let done

  const chainer = {
    then (cb) {
      jobs.push(cb)
      return chainer
    },
  }

  function shift (...args) {
    const job = jobs.shift()
    let result
    try {
      result = job(...args)
    } catch (e) {
      jobs.length = 0
      done(e)
    }

    // wait for nextTick
    if (result !== undefined) {
      if (result.then) {
        result.then(shift)
      } else {
        shift(result)
      }
    } else if (jobs.length) {
      requestAnimationFrame(() => Vue.nextTick(shift))
    }
  }

  // First time
  Vue.nextTick(() => {
    done = jobs[jobs.length - 1]
    if (done && done.toString().slice(0, 14) !== 'function (err)') {
      throw new Error('waitForUpdate chain is missing .then(done)')
    }
    shift()
  })

  return chainer
}

function tick () {
  return new Promise((resolve, reject) => {
    Vue.nextTick(resolve)
  })
}

function delay (time) {
  return new Promise(resolve => setTimeout(resolve, time))
}

export {
  tick,
  delay,
  Vue,
}
