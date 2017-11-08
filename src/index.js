import { createSnapshot, extractRefs } from './utils'

function bindCollection ({
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

function bindDocument ({
  vm,
  key,
  document,
}) {
  // TODO warning check if key exists?
  const boundRefs = Object.create(null)

  const unbind = document.onSnapshot((doc) => {
    // TODO test doc.exist
    console.log('doc data', doc)
    const [data, refs] = extractRefs(createSnapshot(doc))
    vm[key] = data
    return
    // TODO bind refs
    const d = doc.data()
    if (!boundRefs[d.path]) {
      console.log('bound ref', d.path)
      boundRefs[d.path] = d.onSnapshot((doc) => {
        console.log('ref snap', doc)
      }, err => console.log('onSnapshot ref ERR', err))
    }
  }, err => {
    console.log('onSnapshot ERR' ,err)
  })

  return () => {
    // TODO unbind all from boundRefs
    return unbind()
  }
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
          bindDocument({
            vm: this,
            key,
            document: ref,
          })
        }
      })
    }
  })
}

export default install
