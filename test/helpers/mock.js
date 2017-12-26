export class DocumentSnapshot {
  constructor (firestore, key, document, exists) {
    this._firestore = firestore
    this._key = key
    this._document = document
    this.exists = exists
  }

  data () {
    return this._document
  }

  get id () {
    return this._key.path.lastSegment()
  }
}

const noop = _ => null

export let _id = 0
export class Key {
  constructor (v) {
    this.v = '' + (v != null ? v : _id++)
  }

  get path () {
    return {
      lastSegment: () => this.v
    }
  }
}

export class DocumentReference {
  constructor ({ collection, id, data, index }) {
    this.collection = collection
    this.id = id
    this.data = data
    this.index = index
    this.exists = false
    this.cb = this.onError = noop
  }

  onSnapshot (cb, onError) {
    this.cb = cb
    this.onError = onError
    // TODO timeout a cb
    setTimeout(() => {
      this.cb(new DocumentSnapshot(null, this.id, this.data, this.exists))
    }, 0)
    return () => {
      this.cb = this.onError = noop
    }
  }

  get path () {
    return `${this.collection.name}/${this.id.v}`
  }

  async delete () {
    this.exists = false
    return this.collection._remove(this.id)
  }

  isEqual (ref) {
    return this.id.v === ref.id.v
  }

  async update (data) {
    Object.assign(this.data, data)
    this.exists = true
    this.cb(new DocumentSnapshot(null, this.id, this.data, true))
    return this.collection._modify(this.id, this.data)
  }

  async set (data) {
    this.data = { ...data }
    this.exists = true
    this.cb(new DocumentSnapshot(null, this.id, this.data, true))
    return this.collection._modify(this.id, this.data)
  }
}

class CollectionReference {
  constructor (name) {
    this.data = {}
    this.name = name
    this.cb = this.onError = noop
  }

  onSnapshot (cb, onError) {
    this.cb = cb
    this.onError = onError
    setTimeout(() => {
      // Object.keys(this.data).map((k, i) => console.log(k, 'at', i, this.data[k].data))
      this.cb({
        docChanges: Object.keys(this.data).map((id, newIndex) => ({
          type: 'added',
          doc: new DocumentSnapshot(null, new Key(id), this.data[id].data),
          newIndex,
          oldIndex: -1
        }))
      })
    }, 0)
    return () => {
      this.cb = this.onError = noop
    }
  }

  async add (data) {
    const id = new Key()
    this.data[id.v] = new DocumentReference({
      collection: this,
      id,
      data,
      index: Object.keys(this.data).length
    })
    this.cb({
      docChanges: [{
        type: 'added',
        doc: new DocumentSnapshot(null, id, data),
        newIndex: Object.keys(this.data).length - 1,
        oldIndex: -1
      }]
    })
    return this.data[id.v]
  }

  // used to check if it's a collection or document ref
  where () {}

  doc (id) {
    id = id || new Key()
    return (this.data[id.v] = this.data[id.v] || new DocumentReference({
      collection: this,
      id,
      data: {},
      index: Object.keys(this.data).length
    }))
  }

  async _remove (id) {
    const ref = this.data[id.v]
    delete this.data[id.v]
    this.cb({
      docChanges: [{
        doc: new DocumentSnapshot(null, id, ref.data),
        type: 'removed'
      }]
    })
    ref.collection = null
    ref.data = null
  }

  async _modify (id, data) {
    this.cb({
      docChanges: [{
        type: 'modified',
        doc: new DocumentSnapshot(null, id, data),
        oldIndex: this.data[id.v].index,
        newIndex: this.data[id.v].index
      }]
    })
  }
}

export const db = {
  db: {},
  n: 0,

  collection (name) {
    // create a collection if no name provided
    name = name || `random__${this.n++}`
    return (db[name] = db[name] || new CollectionReference(name))
  }
}
