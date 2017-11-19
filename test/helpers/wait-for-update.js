import Vue from 'vue'

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
  Vue
}
