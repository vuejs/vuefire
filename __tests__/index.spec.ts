import { mylib, ComponentImpl } from '../src'
import { mount } from '@vue/test-utils'

describe('mylib', () => {
  it('works', () => {
    expect(mylib()).toBe(true)
  })
})

describe('Component', () => {
  it('works', async () => {
    const wrapper = mount(ComponentImpl, {
      props: { data: { title: 'hi', summary: 'summary' } },
    })
    expect(wrapper.html()).toMatchInlineSnapshot(
      `"<p>Custom: false. hi - summary.</p>"`
    )
  })
})
