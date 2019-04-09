import { firestorePlugin } from '../src'
import { Vue } from '@posva/vuefire-test-helpers'

describe('Firestore: plugin options', () => {
  it('allows customizing $rtdbBind', () => {
    Vue.use(firestorePlugin, { bindName: '$myBind', unbindName: '$myUnbind' })
    expect(typeof Vue.prototype.$myBind).toBe('function')
    expect(typeof Vue.prototype.$myUnbind).toBe('function')
  })
})
