export class DocumentSnapshot {
  constructor (firestore, key, document, exists) {
    this._firestore = firestore
    this._key = new Key(key)
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

export let _id = 0
export class Key {
  constructor (v) {
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

class callbacksAndErrors {
  constructor () {
    this._cbId = 0
    this.cbs = {}
    this.onErrors = {}
  }

  _addCallbacks (cb, onError) {
    const id = this._cbId++
    this.cbs[id] = cb
    this.onErrors[id] = onError
    return () => {
      delete this.cbs[id]
      delete this.onErrors[id]
    }
  }

  _callCallbacks (data) {
    Object.values(this.cbs).forEach(
      cb => cb(data)
    )
  }
}

export class DocumentReference extends callbacksAndErrors {
  constructor ({ collection, id, data, index }) {
    super()
    this.collection = collection
    this.id = new Key(id)
    this.data = data
    this.index = index
    this.exists = false
  }

  onSnapshot (cb, onError) {
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

  isEqual (ref) {
    return this.id.v === ref.id.v
  }

  async update (data) {
    Object.assign(this.data, data)
    this.exists = true
    this._callCallbacks(new DocumentSnapshot(null, this.id, this.data, true))
    return this.collection._modify(this.id, this.data, this)
  }

  async set (data) {
    this.data = { ...data }
    this.exists = true
    this._callCallbacks(new DocumentSnapshot(null, this.id, this.data, true))
    return this.collection._modify(this.id, this.data, this)
  }
}

class CollectionReference extends callbacksAndErrors {
  constructor (name) {
    super()
    this.data = {}
    this.name = name
  }

  onSnapshot (cb, onError) {
    setTimeout(() => {
      // Object.keys(this.data).map((k, i) => console.log(k, 'at', i, this.data[k].data))
      cb({
        docChanges: Object.keys(this.data).map((id, newIndex) => ({
          type: 'added',
          doc: new DocumentSnapshot(null, new Key(id), this.data[id].data),
          newIndex,
          oldIndex: -1
        }))
      })
    }, 0)
    return this._addCallbacks(cb, onError)
  }

  async add (data) {
    const id = new Key()
    this.data[id.v] = new DocumentReference({
      collection: this,
      id,
      data,
      index: Object.keys(this.data).length
    })
    this._callCallbacks({
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
    id = new Key(id)
    return this.data[id.v] || new DocumentReference({
      collection: this,
      id,
      data: {},
      index: Object.keys(this.data).length
    })
  }

  async _remove (id) {
    const ref = this.data[id.v]
    delete this.data[id.v]
    this._callCallbacks({
      docChanges: [{
        doc: new DocumentSnapshot(null, id, ref.data),
        type: 'removed'
      }]
    })
    ref.collection = null
    ref.data = null
  }

  async _modify (id, data, ref) {
    let type = 'modified'
    if (!this.data[id.v]) {
      ref.index = Object.keys(this.data).length
      this.data[id.v] = ref
      type = 'added'
    }
    this._callCallbacks({
      docChanges: [{
        type,
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
