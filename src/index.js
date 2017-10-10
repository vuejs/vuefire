import { createSnapshot } from './utils'

function bindCollection({
  vm,
  key,
  collection,
}) {
  // TODO wait to get all data
  const array = vm[key] = []

  const change = {
    added: ({ newIndex, doc }) => {
      array.splice(newIndex, 0, createSnapshot(doc))
    },
    modified: ({ oldIndex, newIndex, doc }) => {
      array.splice(oldIndex, 1)
      array.splice(newIndex, 0, createSnapshot(doc))
    },
    removed: ({ oldIndex }) => {
      array.splice(oldIndex, 1)
    }
  }

  return collection.onSnapshot(({ docChanges }) => {
    // console.log('pending', metadata.hasPendingWrites)
    // docs.forEach(d => console.log('doc', d, '\n', 'data', d.data()))
    docChanges.forEach(c => {
      // console.log(c)
      change[c.type](c)
    })
  }, err => {
    console.log('onSnapshot ERR', err)
  })

}

function install (Vue, options) {
  Vue.mixin({
    created () {
      const { firestore } = this.$options
      if (!firestore) return
      Object.keys(firestore).forEach(key => {
        const ref = firestore[key]
        if (ref.add) {
          bindCollection({
            vm: this,
            key,
            collection: ref,
          })
        } else {
          // TODO
        }
      })
    }
  })
}

export default install
