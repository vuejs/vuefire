import test from 'ava'
import {
  createSnapshot
} from '../src/utils'
import {
  Key,
  _id,
  DocumentSnapshot
} from './helpers'

test.beforeEach(t => {
  t.context.id = _id
  t.context.doc = new DocumentSnapshot(null, new Key(), {
    n: 42,
    is: true,
    items: [{ text: 'foo' }]
  })
  t.context.snapshot = createSnapshot(t.context.doc)
})

test('createSnapshot adds an id', t => {
  t.is(t.context.snapshot.id, '' + t.context.id)
})

test('id is not enumerable', t => {
  t.false(Object.keys(t.context.snapshot).includes('id'))
})

test('contains all the data', t => {
  t.deepEqual(t.context.snapshot, {
    n: 42,
    is: true,
    items: [{ text: 'foo' }]
  })
})
