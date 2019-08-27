import { walkSet } from '../src'

describe('shared tools', () => {
  it('simple walkset nested access', () => {
    expect(walkSet({ a: { b: true } }, 'a.b', 2)).toBe(2)
  })
})
