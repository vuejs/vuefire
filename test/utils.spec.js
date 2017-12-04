import {
  createSnapshot
} from '../src/utils'
import {
  Key,
  _id,
  DocumentSnapshot
} from './helpers'

let id, doc, snapshot
beforeEach(() => {
  id = _id
  doc = new DocumentSnapshot(null, new Key(), {
    n: 42,
    is: true,
    items: [{ text: 'foo' }]
  })
  snapshot = createSnapshot(doc)
})

test('createSnapshot adds an id', () => {
  expect(snapshot.id).toBe('' + id)
})

test('id is not enumerable', () => {
  expect(Object.keys(snapshot).includes('id')).toBe(false)
})

test('contains all the data', () => {
  expect(snapshot).toEqual({
    n: 42,
    is: true,
    items: [{ text: 'foo' }]
  })
})
