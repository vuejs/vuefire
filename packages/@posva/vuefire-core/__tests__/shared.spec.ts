import { walkSet } from '../src'

describe('test', () => {
  it('walkset works', () => {
    expect(walkSet({ a: { b: true } }, 'a.b', 2)).toBe(2)
  })
})
