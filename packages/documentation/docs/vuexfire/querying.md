# Querying the database

So far we have used references to documents and collections and feed them to Vuexfire to get a in-sync local version of them but you can also pass queries. This is pretty much transparent from Vuexfire perspective but here are some examples that you may find useful. If you need to check further, check Firebase documentation as there isn't any filtering or sorting feature in Vuexfire, it all comes from Firebase.

## One time read

If you don't care about having the data updated in real time whenever you modify or when you need to fetch some data that is only used once, you can use the native Firebase JS SDK, that's right, you don't need Vuexfire at all for that:

<FirebaseExample>

```js
// retrieve a collection
db.ref('documents').once('value', snapshot => {
  const documents = snapshot.val()
  // do something with documents
})

// retrieve a document
db.ref('documents/' + documentId).once('value', snapshot => {
  const document = snapshot.val()
  // do something with document
})
```

```js
// retrieve a collection
db.collection('documents')
  .get()
  .then(querySnapshot => {
    const documents = querySnapshot.docs.map(doc => doc.data())
    // do something with documents
  })

// retrieve a document
db.collection('documents')
  .doc(documentId)
  .get()
  .then(snapshot => {
    const document = snapshot.data()
    // do something with document
  })
```

</FirebaseExample>

To go further, check Firebase documentation:

- [RTDB: Read data once](https://firebase.google.com/docs/database/web/read-and-write#read_data_once)
- [Cloudstore: Get a document](https://firebase.google.com/docs/firestore/query-data/get-data#get_a_document)

## Sorting

RTDB and Cloudstore do not include the same set of features regarding sorting but here is a basic example of sorting a collection of `documents` by the date of creation stored as `createdAt`:

<FirebaseExample>

```js
{
  // omitting the rest of store options for simplicity reasons
  actions: {
    bindDocuments: firebaseAction(({ bindFirebaseRef }) => {
      return bindFirebaseRef(
        'documents',
        db.ref('documents').orderByChild('createdAt')
      )
    })
  }
}
```

```js
{
  // omitting the rest of store options for simplicity reasons
  actions: {
    bindDocuments: firestoreAction(({ bindFirestoreRef }) => {
      return bindFirestoreRef(
        'documents',
        db.collection('documents').orderBy('createdAt', 'desc')
      )
    })
  }
}
```

</FirebaseExample>

To go further, check Firebase documentation:

- [RTDB: Sorting and filtering data](https://firebase.google.com/docs/database/web/lists-of-data#sorting_and_filtering_data)
- [Order and limit data with Cloud Firestore](https://firebase.google.com/docs/firestore/query-data/order-limit-data)

## Filtering

Cloudstore has many more features regarding filtering than RTDB but here is a basic filtering using one field with both databases:

<FirebaseExample>

```js
// only get documents with more than 200 words
// we need to order by a field in order to use it for a filter
db.ref('documents')
  .orderByChild('wordCount')
  .startAt(200)
```

```js
// only get documents with more than 200 words
// the orderBy is optional
db.collection('documents')
  .where('wordCount', '>', 200)
  .orderBy('wordCount')
```

</FirebaseExample>

To go further, check Firebase documentation:

- [RTDB: Sorting and filtering data](https://firebase.google.com/docs/database/web/lists-of-data#sorting_and_filtering_data) and [`equalTo` reference](https://firebase.google.com/docs/reference/js/firebase.database.Reference#equalTo). You should also check `startAt` and `endAt` in the same page.
- [Perform simple and compound queries in Cloud Firestore](https://firebase.google.com/docs/firestore/query-data/queries)
