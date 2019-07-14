export class GeoPoint {
  _lat: number
  _long: number
  constructor (lat: number, long: number) {
    this._lat = lat
    this._long = long
  }

  get latitude () {
    return this._lat
  }
  get longitude () {
    return this._long
  }
}

export class Timestamp {
  seconds: number
  nanoseconds: number
  constructor (seconds: number, nanoseconds: number) {
    this.seconds = seconds
    this.nanoseconds = nanoseconds
  }

  toDate () {
    return new Date(this.toMillis())
  }

  toMillis () {
    return this.seconds * 1000 + this.nanoseconds / 1e6
  }
}

type TODO = any
type DataObject = Record<string, any>

export class DocumentSnapshot {
  _firestore: TODO
  _key: Key
  _document: DataObject
  exists: boolean
  constructor (firestore: TODO, key: string | Key, document: DataObject, exists?: boolean) {
    this._firestore = firestore
    this._key = new Key(key)
    this._document = document
    this.exists = !!exists
  }

  data () {
    return this._document
  }

  get id () {
    return this._key.path.lastSegment()
  }
}

export let _id = 0
export class Key {
  v: string
  constructor (v?: Key | string) {
    if (v instanceof Key) {
      this.v = v.v
    } else {
      this.v = '' + (v != null ? v : _id++)
    }
  }

  get path () {
    return {
      lastSegment: () => this.v
    }
  }
}

interface OnSuccessCallback {
  (data: DataObject): void
}

interface OnErrorCallback {
  (error: any): void
}

class CallbacksAndErrors {
  _cbId = 0
  cbs: Record<number, OnSuccessCallback> = {}
  onErrors: Record<number, OnErrorCallback> = {}

  _addCallbacks (cb: OnSuccessCallback, onError: OnErrorCallback) {
    const id = this._cbId++
    this.cbs[id] = cb
    this.onErrors[id] = onError
    return () => {
      delete this.cbs[id]
      delete this.onErrors[id]
    }
  }

  _callCallbacks (data: DataObject) {
    Object.values(this.cbs).forEach(cb => cb(data))
  }
}

interface DocumentReferenceConstructorOption {
  collection: CollectionReference
  id: string | Key
  data: DataObject
  index: number
}

export class DocumentReference extends CallbacksAndErrors {
  collection: CollectionReference
  id: Key
  data: DataObject
  index: number
  exists: boolean

  constructor ({ collection, id, data, index }: DocumentReferenceConstructorOption) {
    super()
    this.collection = collection
    this.id = new Key(id)
    this.data = data
    this.index = index
    this.exists = false
  }

  onSnapshot (cb: OnSuccessCallback, onError: OnErrorCallback) {
    if (typeof this.id === 'string') {
      debugger
    }
    setTimeout(() => {
      cb(new DocumentSnapshot(null, this.id, this.data, this.exists))
    }, 0)
    return this._addCallbacks(cb, onError)
  }

  get path () {
    return `${this.collection.name}/${this.id.v}`
  }

  async delete () {
    this.exists = false
    return this.collection._remove(this.id)
  }

  isEqual (ref: DocumentReference) {
    return this.id.v === ref.id.v
  }

  async update (data: DataObject) {
    Object.assign(this.data, data)
    this.exists = true
    this._callCallbacks(new DocumentSnapshot(null, this.id, this.data, true))
    return this.collection._modify(this.id, this.data, this)
  }

  async set (data: object) {
    this.data = { ...data }
    this.exists = true
    this._callCallbacks(new DocumentSnapshot(null, this.id, this.data, true))
    return this.collection._modify(this.id, this.data, this)
  }
}

export class CollectionReference extends CallbacksAndErrors {
  name: string
  data: Record<string, DocumentReference> = {}

  constructor (name: string) {
    super()
    this.name = name
  }

  onSnapshot (cb: OnSuccessCallback, onError: OnErrorCallback) {
    setTimeout(() => {
      // Object.keys(this.data).map((k, i) => console.log(k, 'at', i, this.data[k].data))
      cb({
        docChanges: () =>
          Object.keys(this.data).map((id, newIndex) => ({
            type: 'added',
            doc: new DocumentSnapshot(null, new Key(id), this.data[id].data),
            newIndex,
            oldIndex: -1
          }))
      })
    }, 0)
    return this._addCallbacks(cb, onError)
  }

  async add (data: DataObject) {
    const id = new Key()
    this.data[id.v] = new DocumentReference({
      collection: this,
      id,
      data,
      index: Object.keys(this.data).length
    })
    this._callCallbacks({
      docChanges: () => [
        {
          type: 'added',
          doc: new DocumentSnapshot(null, id, data),
          newIndex: Object.keys(this.data).length - 1,
          oldIndex: -1
        }
      ]
    })
    return this.data[id.v]
  }

  // used to check if it's a collection or document ref
  where () {}

  doc (id?: string | Key) {
    id = new Key(id)
    return (
      this.data[id.v] ||
      new DocumentReference({
        collection: this,
        id,
        data: {},
        index: Object.keys(this.data).length
      })
    )
  }

  async _remove (id: Key) {
    const ref = this.data[id.v]
    // not super reliant to emit a valid oldIndex
    const oldIndex = Object.keys(this.data).indexOf(id.v)
    delete this.data[id.v]
    this._callCallbacks({
      docChanges: () => [
        {
          doc: new DocumentSnapshot(null, id, ref.data),
          type: 'removed',
          oldIndex
        }
      ]
    })
    // free references
    delete ref.collection
    delete ref.data
  }

  async _modify (id: Key, data: DataObject, ref: DocumentReference) {
    let type = 'modified'
    if (!this.data[id.v]) {
      ref.index = Object.keys(this.data).length
      this.data[id.v] = ref
      type = 'added'
    }
    this._callCallbacks({
      docChanges: () => [
        {
          type,
          doc: new DocumentSnapshot(null, id, data),
          oldIndex: this.data[id.v].index,
          newIndex: this.data[id.v].index
        }
      ]
    })
  }
}

export const db = {
  _db: {} as Record<string, CollectionReference>,
  n: 0,

  collection (name?: string): CollectionReference {
    // create a collection if no name provided
    name = name || `random__${this.n++}`
    return (this._db[name] = this._db[name] || new CollectionReference(name))
  }
}
