import { rtdbPlugin } from '../../src'
import { Vue } from '@posva/vuefire-test-helpers'

describe('RTDB: plugin options', () => {
  it('allows customizing $rtdbBind', () => {
    Vue.use(rtdbPlugin, { bindName: '$bind', unbindName: '$unbind' })
    expect(typeof Vue.prototype.$bind).toBe('function')
    expect(typeof Vue.prototype.$unbind).toBe('function')
  })
})
