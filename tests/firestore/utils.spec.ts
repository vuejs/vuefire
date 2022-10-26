import { DocumentData, getDoc } from 'firebase/firestore'
import { beforeEach, describe, expect, it } from 'vitest'
import { extractRefs } from '../../src/firestore/utils'
import { setupFirestoreRefs } from '../utils'

describe('Firestore utils', () => {
  const { collection, doc, setDoc, updateDoc } = setupFirestoreRefs()

  const docRef = doc()
  const collectionRef = collection()

  const docData = {
    n: 42,
    is: true,
    items: [{ text: 'foo' }],
    ref: docRef,
  }

  beforeEach(async () => {
    await setDoc(docRef, {
      // collection,
      data: {},
      index: 0,
    })
  })

  it.skip('extracts refs from documents', async () => {
    const docRef = doc<DocumentData>()
    const [noRefsDoc, refs] = extractRefs(docData, undefined, {})
    expect(noRefsDoc.ref).toBe(docRef.path)
    expect(refs).toEqual({
      ref: docRef,
    })
  })

  it('leave Date objects alone when extracting refs', () => {
    const d = new Date()
    const [doc, refs] = extractRefs(
      {
        foo: 1,
        bar: d,
      },
      undefined,
      {}
    )
    expect(doc.foo).toBe(1)
    expect(doc.bar).toBe(d)
    expect(refs).toEqual({})
  })
})
