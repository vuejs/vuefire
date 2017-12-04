import Vue from 'vue'

Vue.config.productionTip = false

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
