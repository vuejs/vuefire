function createDoc (doc) {
  // defaults everything to false, so no need to set
  console.log('create', doc.data())
  return Object.defineProperty(doc.data(), 'id', {
    value: doc.id,
  })
}

function bindCollection({
  vm,
  key,
  collection,
}) {
  // TODO wait to get all data
  const array = vm[key] = []

  const change = {
    added: ({ newIndex, doc }) => {
      array.splice(newIndex, 0, createDoc(doc))
    },
    modified: ({ oldIndex, newIndex, doc }) => {
      array.splice(oldIndex, 1)
      array.splice(newIndex, 0, createDoc(doc))
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
        bindCollection({
          vm: this,
          key,
          collection: firestore[key],
        })
      })
    }
  })
}

export default install
