# Writing to the database

As said in the introduction, Vuexfire **does not** handle writing data back to Firebase because you can directly use the Firebase JS SDK to precisely update whatever you need. Here are some examples on how to create, update and remove documents but make sure to refer to the official documentation to fo further:

The main point here is wrapping writes in actions. This is not mandatory but can vastly improve your testing experience as you may not need to mock Firebase database at all if you mock your Store in components with something like [vuex-mock-store](https://github.com/posva/vuex-mock-store).

## Updates to collection and documents

There are two ways to update a document `set` and `update`. The first will replace the whole document (as a PUT in HTTP) while the later will keep the original document and overwrite values (as a PATCH in HTTP).

:::tip
In the following examples, `user` is a user bound to a Firebase document using Vuexfire while `conferences` is a list of conferences bound to a Firebase collection using Vuexfire.

We are also omitting the whole store declaration but still calling `firestoreAction`/`firebaseAction` to create the action. Note we need to pass the returned function as an action for it to be useful.
:::

### Replacing a document

If we want to update the whole user we can use `set`:

<FirebaseExample>

```js
firebaseAction(({ state }) => {
  // we first create a copy that excludes `.key`
  // this exclusion is automatic because `.key` is non-enumerable
  const user = { ...state.user }
  user.lastName = newLastName

  // return the promise so we can await this action
  return db
    .ref('users/' + this.user['.key'])
    .set(user)
    .then(() => {
      console.log('user updated!')
    })
})
```

```js
firestoreAction(({ state }) => {
  // we first create a copy that excludes `id`
  // this exclusion is automatic because `id` is non-enumerable
  const user = { ...state.user }
  user.lastName = newLastName

  // return the promise so we can await this action
  return db
    .collection('users')
    .doc(this.user.id)
    .set(user)
    .then(() => {
      console.log('user updated!')
    })
})
```

</FirebaseExample>

:::tip
If you await the promise returned by the write, your state will be up to date (if the write succeeds)
:::

### Updating a document

You can achieve a similar thing by calling `update` with `lastName` instead:

<FirebaseExample>

```js
firebaseAction(({ state }) => {
  db.collection('users')
    .doc(state.user['.key'])
    .update({ lastName: newLastName })
    .then(() => {
      console.log('user updated!')
    })
})
```

```js
firestoreAction(({ state }) => {
  db.collection('users')
    .doc(state.user.id)
    .set({ lastName: newLastName })
    .then(() => {
      console.log('user updated!')
    })
})
```

</FirebaseExample>

### Removing a document

You can remove documents by calling `remove` on their reference:

<FirebaseExample>

```js
firebaseAction((context, cityId) => {
  db.ref('cities/' + cityId).remove()
})
```

```js
firestoreAction((context, cityId) => {
  db.collection('cities')
    .doc(cityId)
    .remove()
})
```

</FirebaseExample>

### Adding documents to a collection

You can add documents to collections by calling `push`/`add` on a collection reference:

<FirebaseExample>

```js
firebaseAction(context => {
  // return the promise so we can await the write
  return db.ref('cities').push({
    name: 'Fuengirola',
    slogan: 'Un sol de ciudad',
  })
})
```

```js
firestoreAction(context => {
  // return the promise so we can await the write
  return db.collection('cities').add({
    name: 'Fuengirola',
    slogan: 'Un sol de ciudad',
  })
})
```

</FirebaseExample>

- [RTDB: Updating or deleting data](https://firebase.google.com/docs/database/web/read-and-write#updating_or_deleting_data)
- [RTDB: Reading and writing lists](https://firebase.google.com/docs/database/web/lists-of-data#reading_and_writing_lists)
- [Add data to Cloud Firestore](https://firebase.google.com/docs/firestore/manage-data/add-data)

## References

> References are only supported by Cloud Firestore

To write a reference to a document, you pass the actual reference object:

<FirebaseExample disable="0">

```js
// References do not exist in RTDB
```

```js
db.collection('books').add({
  name: '1984',
  author: db.collection('authors').doc('george-orwell'),
})
```

</FirebaseExample>

## Geopoints

> Geopoints are only supported by Cloud Firestore
> Refer to [Plugin installation](./getting-started.md#plugin) to retrieve the `Geopoint` class

<FirebaseExample disable="0">

```js
// Geopoints do not exist in RTDB
```

```js
import { GeoPoint } from './db'

// add Paris to the list of cities and wait for the operation
// to be finished
await db.collection('cities').add({
  name: 'Paris',
  location: new GeoPoint(48.8588377, 2.2770206),
})
```

</FirebaseExample>

## Timestamps

> Timestamps are only supported by Cloud Firestore
> Refer to [Plugin installation](./getting-started.md#plugin) to retrieve the `Timestamp` class

<FirebaseExample disable="0">

```js
// Timestamps do not exist in RTDB
```

```js
import { Timestamp } from './db'

// Add "La prise de la Bastille" to a list of events
// and wait for th operation to be finished
await db.collection('events').add({
  name: 'Prise de la Bastille',
  date: Timestamp.fromDate(new Date('1789-07-14')),
})
```

</FirebaseExample>

## Current Timestamp

When you need the current time at creation or update, you need to pass a special value to tell Firebase to use the server value instead

<FirebaseExample>

```js
await db.ref('documents').push({
  name: 'A document',
  createdAt: firebase.database.ServerValue.TIMESTAMP,
})
```

```js
import { Timestamp } from './db'

await db.collection('documents').add({
  name: 'A document',
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
})
```

</FirebaseExample>
