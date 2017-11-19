export class DocumentSnapshot {
  constructor (firestore, key, document) {
    this._firestore = firestore;
    this._key = key;
    this._document = document;
  }

  data () {
    return this._document
  }

  get id () {
    return this._key.path.lastSegment()
  }
}

const noop = _ => null

export let id = 0
export class Key {
  constructor () {
    this.id = id++
  }

  get path () {
    return {
      lastSegment: () => this.id
    }
  }
}

class DocumentReference {
  constructor ({ collection, id, data, index }) {
    this.collection = collection
    this.id = id
    this.data = data
    this.index = index
    this.cb = this.onError = noop
  }

  onSnapshot (cb, onError) {
    this.cb = cb
    this.onError = onError
    return () => this.cb = this.onError = noop
  }


  async delete () {
    return this.collection._remove(this.id)
  }

  async update (data) {
    Object.assign(this.data, data)
    this.cb(new DocumentSnapshot(null, this.id, this.data))
    return this.collection._modify(this.id, this.data)
  }
}

class CollectionReference {
  constructor () {
    this.data = {}
    this.cb = this.onError = noop
  }

  onSnapshot (cb, onError) {
    this.cb = cb
    this.onError = onError
    return () => this.cb = this.onError = noop
  }

  async add (data) {
    const id = new Key()
    this.data[id] = new DocumentReference({
      collection: this,
      id,
      data,
      index: Object.keys(this.data).length
    })
    this.cb({
      docChanges: [{
        type: 'added',
        doc: new DocumentSnapshot(null, id, data),
        newIndex: Object.keys(this.data).length,
        oldIndex: -1,
      }]
    })
    return this.data[id]
  }

  // used to check if it's a collection or document ref
  where () {}

  doc (id) {
    id = id || new Key()
    return this.data[id] = this.data[id] || new DocumentReference({
      collection: this,
      id,
      data: {},
      index: Object.keys(this.data).length
    })
  }

  async _remove (id) {
    const ref = this.data[id]
    delete this.data[id]
    this.cb({
      docChanges: [{
        doc: new DocumentSnapshot(null, id, ref.data),
        type: 'removed',
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
        oldIndex: this.data[id].index,
        newIndex: this.data[id].index,
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
    return db[name] = db[name] || new CollectionReference()
  }
}
