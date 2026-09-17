import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bindCollection } from '../../src/firestore/bind'
import { ops } from '../../src/firestore/useFirestoreRef'

const snapshots = vi.hoisted(() => {
  type Listener = (snapshot: unknown) => void

  return {
    collections: [] as Listener[],
    documents: new Map<string, Listener[]>(),
  }
})

vi.mock('firebase/firestore', () => {
  class Timestamp {}
  class GeoPoint {}

  return {
    Timestamp,
    GeoPoint,
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    onSnapshot: (
      source: { path: string; type: string },
      next: (snapshot: unknown) => void
    ) => {
      const listeners =
        source.type === 'document'
          ? snapshots.documents.get(source.path) || []
          : snapshots.collections

      listeners.push(next)
      if (source.type === 'document') {
        snapshots.documents.set(source.path, listeners)
      }

      return () => {
        const index = listeners.indexOf(next)
        if (index >= 0) listeners.splice(index, 1)
      }
    },
  }
})

function documentReference(path: string) {
  return {
    type: 'document',
    path,
    converter: null,
    withConverter(converter: unknown) {
      return { ...this, converter }
    },
  }
}

const collectionReference = {
  type: 'collection',
  path: 'messages',
}

function emitCollection(
  changes: Array<{
    type: string
    oldIndex: number
    newIndex: number
    doc: { id: string; data: () => Record<string, unknown> }
  }>
) {
  const snapshot = {
    docChanges: () => changes,
  }
  Array.from(snapshots.collections).forEach((listener) => listener(snapshot))
}

function emitDocument(path: string, data: Record<string, unknown>) {
  const snapshot = {
    exists: () => true,
    data: () => data,
  }
  const listeners = snapshots.documents.get(path)
  if (listeners) Array.from(listeners).forEach((listener) => listener(snapshot))
}

function messageChange(
  type: string,
  data: Record<string, unknown>,
  { id = 'message-1', oldIndex = 0, newIndex = 0 } = {}
) {
  return {
    type,
    oldIndex: type === 'added' ? -1 : oldIndex,
    newIndex,
    doc: { id, data: () => data },
  }
}

function bindMessages({ wait = true }: { wait?: boolean } = {}) {
  const target = ref<unknown[]>([])
  let resolveBinding!: (value: unknown) => void
  let rejectBinding!: (reason: unknown) => void
  let resolvedWith: unknown
  // without `wait`, the bound array is the one passed to the resolve callback:
  // the test target ref is not the one vuefire keeps writing into
  let boundArray: unknown[] | undefined
  const promise = new Promise((resolve, reject) => {
    resolveBinding = (value) => {
      resolvedWith ??= JSON.parse(JSON.stringify(value))
      boundArray ??= value as unknown[]
      resolve(value)
    }
    rejectBinding = reject
  })

  const stop = bindCollection(
    target,
    collectionReference as never,
    ops,
    resolveBinding,
    rejectBinding,
    { maxRefDepth: 2, wait }
  )

  return {
    promise,
    stop,
    target,
    resolvedWith: () => resolvedWith,
    boundArray: () => boundArray ?? target.value,
  }
}

describe('Firestore nested reference lifecycle', () => {
  beforeEach(() => {
    snapshots.collections.length = 0
    snapshots.documents.clear()
  })

  it('resolves when a reference path changes during the initial snapshot', async () => {
    const { promise, stop, target } = bindMessages()

    emitCollection([
      messageChange('added', {
        sender: documentReference('agents/a1'),
        updatedBy: documentReference('members/m1'),
      }),
    ])
    emitDocument('agents/a1', { name: 'Ada' })

    emitCollection([
      messageChange('modified', {
        sender: documentReference('agents/a1'),
        updatedBy: documentReference('members/m2'),
      }),
    ])
    emitDocument('members/m2', { name: 'Bob' })

    await promise
    expect(target.value).toHaveLength(1)
    stop()
  })

  it('resolves when a document is removed before its references', async () => {
    const { promise, stop, target } = bindMessages()

    const data = { sender: documentReference('agents/a1') }
    emitCollection([messageChange('added', data)])
    emitCollection([messageChange('removed', data)])

    await promise
    expect(target.value).toHaveLength(0)
    stop()
  })

  it('resolves when a reference disappears during the initial snapshot', async () => {
    const { promise, stop, target } = bindMessages()

    emitCollection([
      messageChange('added', {
        sender: documentReference('agents/a1'),
        summary: documentReference('summaries/s1'),
      }),
    ])
    emitDocument('agents/a1', { name: 'Ada' })

    emitCollection([
      messageChange('modified', {
        sender: documentReference('agents/a1'),
      }),
    ])

    await promise
    expect(target.value).toEqual([{ sender: { name: 'Ada' } }])
    stop()
  })

  it('rebinds nested references when a collection document moves', async () => {
    const { promise, stop, target } = bindMessages()

    emitCollection([
      messageChange(
        'added',
        { sender: documentReference('agents/a1') },
        { id: 'message-1', newIndex: 0 }
      ),
      messageChange(
        'added',
        { sender: documentReference('agents/a2') },
        { id: 'message-2', newIndex: 1 }
      ),
    ])
    emitDocument('agents/a1', {
      name: 'Ada',
      createdBy: documentReference('members/m1'),
    })
    emitDocument('agents/a2', {
      name: 'Bob',
      createdBy: documentReference('members/m2'),
    })
    emitDocument('members/m1', { name: 'Alice' })
    emitDocument('members/m2', { name: 'Bruno' })
    await promise

    emitCollection([
      messageChange(
        'modified',
        { sender: documentReference('agents/a1') },
        { id: 'message-1', oldIndex: 0, newIndex: 1 }
      ),
    ])
    expect(target.value[1]).toEqual({
      sender: { name: 'Ada', createdBy: { name: 'Alice' } },
    })

    emitDocument('agents/a1', {
      name: 'Ada moved',
      createdBy: documentReference('members/m3'),
    })
    emitDocument('members/m3', { name: 'Charlie' })

    expect(target.value).toEqual([
      {
        sender: { name: 'Bob', createdBy: { name: 'Bruno' } },
      },
      {
        sender: { name: 'Ada moved', createdBy: { name: 'Charlie' } },
      },
    ])
    stop()
  })

  it('does not resolve early when a document is removed after resolving', async () => {
    const { promise, stop, resolvedWith } = bindMessages()

    emitCollection([
      messageChange(
        'added',
        { sender: documentReference('agents/a1') },
        { id: 'message-1', newIndex: 0 }
      ),
      messageChange(
        'added',
        { sender: documentReference('agents/a2') },
        { id: 'message-2', newIndex: 1 }
      ),
    ])
    emitDocument('agents/a2', { name: 'Bob' })
    emitCollection([
      messageChange(
        'removed',
        { sender: documentReference('agents/a2') },
        { id: 'message-2', oldIndex: 1 }
      ),
    ])
    emitDocument('agents/a1', { name: 'Ada' })

    await promise
    expect(resolvedWith()).toEqual([{ sender: { name: 'Ada' } }])
    stop()
  })

  it('restores resolved parent data before a nested listener writes', async () => {
    const { promise, stop, target } = bindMessages()

    emitCollection([
      messageChange('added', {
        sender: documentReference('agents/a1'),
      }),
    ])
    emitDocument('agents/a1', {
      name: 'Ada',
      createdBy: documentReference('members/m1'),
    })
    emitDocument('members/m1', { name: 'Alice' })
    await promise

    const message = target.value[0] as { sender: unknown }
    message.sender = 'agents/a1'
    expect(() =>
      emitDocument('members/m1', { name: 'Alice updated' })
    ).not.toThrow()
    expect(message.sender).toEqual({
      name: 'Ada',
      createdBy: { name: 'Alice updated' },
    })
    stop()
  })

  describe('siblings shifted while pending', () => {
    it('keeps a pending row bound when a document is added before it', async () => {
      const { promise, stop, target } = bindMessages()

      emitCollection([
        messageChange(
          'added',
          { sender: documentReference('agents/a2') },
          { id: 'message-2', newIndex: 0 }
        ),
      ])

      emitCollection([
        messageChange(
          'added',
          { sender: documentReference('agents/a1') },
          { id: 'message-1', newIndex: 0 }
        ),
      ])

      emitDocument('agents/a1', { name: 'Ada' })
      emitDocument('agents/a2', { name: 'Bob' })

      await promise
      expect(target.value).toEqual([
        { sender: { name: 'Ada' } },
        { sender: { name: 'Bob' } },
      ])
      stop()
    })

    it('keeps a pending row bound when a document is added before it without wait', async () => {
      const { promise, stop, boundArray } = bindMessages({ wait: false })

      emitCollection([
        messageChange(
          'added',
          { sender: documentReference('agents/a2') },
          { id: 'message-2', newIndex: 0 }
        ),
      ])

      emitCollection([
        messageChange(
          'added',
          { sender: documentReference('agents/a1') },
          { id: 'message-1', newIndex: 0 }
        ),
      ])

      emitDocument('agents/a1', { name: 'Ada' })
      emitDocument('agents/a2', { name: 'Bob' })

      await promise
      expect(boundArray()).toEqual([
        { sender: { name: 'Ada' } },
        { sender: { name: 'Bob' } },
      ])
      stop()
    })

    it('keeps a pending row bound when a document before it is removed', async () => {
      const { promise, stop, target } = bindMessages()

      emitCollection([
        messageChange(
          'added',
          { sender: documentReference('agents/a1') },
          { id: 'message-1', newIndex: 0 }
        ),
        messageChange(
          'added',
          { sender: documentReference('agents/a2') },
          { id: 'message-2', newIndex: 1 }
        ),
      ])
      emitDocument('agents/a1', { name: 'Ada' })

      emitCollection([
        messageChange(
          'removed',
          { sender: documentReference('agents/a1') },
          { id: 'message-1', oldIndex: 0 }
        ),
      ])
      emitDocument('agents/a2', { name: 'Bob' })

      await promise
      expect(target.value).toEqual([{ sender: { name: 'Bob' } }])
      stop()
    })

    it('keeps a pending row bound when a document before it is removed without wait', async () => {
      const { promise, stop, boundArray } = bindMessages({ wait: false })

      emitCollection([
        messageChange(
          'added',
          { sender: documentReference('agents/a1') },
          { id: 'message-1', newIndex: 0 }
        ),
        messageChange(
          'added',
          { sender: documentReference('agents/a2') },
          { id: 'message-2', newIndex: 1 }
        ),
      ])
      emitDocument('agents/a1', { name: 'Ada' })

      emitCollection([
        messageChange(
          'removed',
          { sender: documentReference('agents/a1') },
          { id: 'message-1', oldIndex: 0 }
        ),
      ])
      emitDocument('agents/a2', { name: 'Bob' })

      await promise
      expect(boundArray()).toEqual([{ sender: { name: 'Bob' } }])
      stop()
    })

    it('keeps a pending row bound when another document moves across it', async () => {
      const { promise, stop, target } = bindMessages()

      emitCollection([
        messageChange(
          'added',
          { sender: documentReference('agents/a1') },
          { id: 'message-1', newIndex: 0 }
        ),
        messageChange(
          'added',
          { sender: documentReference('agents/a2') },
          { id: 'message-2', newIndex: 1 }
        ),
      ])
      emitDocument('agents/a1', { name: 'Ada' })
      emitDocument('agents/a2', { name: 'Bob' })
      await promise

      // message-1 points at a document that has not been received yet
      emitCollection([
        messageChange(
          'modified',
          { sender: documentReference('agents/a3') },
          { id: 'message-1', oldIndex: 0, newIndex: 0 }
        ),
      ])

      // message-2 moves before it, shifting the still pending message-1
      emitCollection([
        messageChange(
          'modified',
          { sender: documentReference('agents/a2') },
          { id: 'message-2', oldIndex: 1, newIndex: 0 }
        ),
      ])

      emitDocument('agents/a3', { name: 'Charlie' })

      expect(target.value).toEqual([
        { sender: { name: 'Bob' } },
        { sender: { name: 'Charlie' } },
      ])
      stop()
    })

    it('keeps a pending row bound when two documents are added before it at once', async () => {
      const { promise, stop, target } = bindMessages()

      emitCollection([
        messageChange(
          'added',
          { sender: documentReference('agents/a3') },
          { id: 'message-3', newIndex: 0 }
        ),
      ])

      emitCollection([
        messageChange(
          'added',
          { sender: documentReference('agents/a1') },
          { id: 'message-1', newIndex: 0 }
        ),
        messageChange(
          'added',
          { sender: documentReference('agents/a2') },
          { id: 'message-2', newIndex: 1 }
        ),
      ])

      emitDocument('agents/a1', { name: 'Ada' })
      emitDocument('agents/a2', { name: 'Bob' })
      emitDocument('agents/a3', { name: 'Charlie' })

      await promise
      expect(target.value).toEqual([
        { sender: { name: 'Ada' } },
        { sender: { name: 'Bob' } },
        { sender: { name: 'Charlie' } },
      ])
      stop()
    })
  })
})
