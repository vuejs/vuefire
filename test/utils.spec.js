import {
  createSnapshot,
  extractRefs
} from '../src/utils'
import {
  Key,
  db,
  _id,
  DocumentReference,
  DocumentSnapshot
} from './helpers'

let id, doc, snapshot, collection, docRef
beforeEach(() => {
  collection = db.collection()
  docRef = new DocumentReference({
    collection,
    id: new Key(),
    data: {},
    index: 0
  })
  id = _id
  doc = new DocumentSnapshot(null, new Key(), {
    n: 42,
    is: true,
    items: [{ text: 'foo' }],
    ref: docRef
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
    items: [{ text: 'foo' }],
    ref: docRef
  })
})

test('extract refs from document', () => {
  const [noRefsDoc, refs] = extractRefs(doc.data())
  expect(noRefsDoc.ref).toEqual(docRef.path)
  expect(refs).toEqual({
    ref: docRef
  })
})

test('extract object nested refs from document', () => {
  const [noRefsDoc, refs] = extractRefs({
    obj: {
      ref: docRef
    }
  })
  expect(noRefsDoc.obj.ref).toEqual(docRef.path)
  expect(refs).toEqual({
    'obj.ref': docRef
  })
})

test('extract deep object nested refs from document', () => {
  const [noRefsDoc, refs] = extractRefs({
    obj: {
      nested: {
        ref: docRef
      }
    }
  })
  expect(noRefsDoc.obj.nested.ref).toEqual(docRef.path)
  expect(refs).toEqual({
    'obj.nested.ref': docRef
  })
})
