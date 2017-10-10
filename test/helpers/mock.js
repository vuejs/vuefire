import { DocumentSnapshot } from 'firebase/firestore/api/database'

DocumentSnapshot.prototype.data = function () {
  return this._document
}

let id = 0
class Key {
  constructor () {
    this.id = id++
  }

  get path () {
    return {
      lastSegment: () => this.id
    }
  }
}

export const collection = {
  data: [],
  onSnapshot (cb, onError) {
    this.cb = cb
    this.onError = onError
  },

  add (item) {
    this.data.push(item)
    this.cb({
      docChanges: [{
        doc: new DocumentSnapshot(null, new Key(), item), // TODO docsnapshot
        newIndex: this.data.length - 1,
        oldIndex: -1,
        type: 'added',
      }]
    })
  }
}
