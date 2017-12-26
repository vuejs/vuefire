import Vue from 'vue'

Vue.config.productionTip = false
export { Vue }

export * from './mock'

export function spyUnbind (ref) {
  const spy = jest.fn()
  const onSnapshot = ref.onSnapshot.bind(ref)
  ref.onSnapshot = fn => {
    const unbind = onSnapshot(fn)
    return () => {
      spy()
      unbind()
    }
  }
  return spy
}

export function spyOnSnapshot (ref) {
  const onSnapshot = ref.onSnapshot.bind(ref)
  return (ref.onSnapshot = jest.fn((...args) => onSnapshot(...args)))
}

export function spyOnSnapshotCallback (ref) {
  const onSnapshot = ref.onSnapshot.bind(ref)
  const spy = jest.fn()
  ref.onSnapshot = fn => onSnapshot((...args) => {
    spy()
    fn(...args)
  })
  return spy
}

// This makes sure some tests fail by delaying callbacks
export function delayUpdate (ref, time = 0) {
  const onSnapshot = ref.onSnapshot.bind(ref)
  ref.onSnapshot = fn => onSnapshot(async (...args) => {
    await delay(time)
    fn(...args)
  })
}

export function tick () {
  return new Promise((resolve, reject) => {
    Vue.nextTick(resolve)
  })
}

export function delay (time) {
  return new Promise(resolve => setTimeout(resolve, time))
}
