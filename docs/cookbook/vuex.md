# Usage with Vuex

Vuex is supported but due to its nature with mutations, it's a bit more verbose to use than Pinia. It's recommended to use Pinia instead of Vuex if you can, your DX will also improve.

You must set the `strict` option to `false` in order to use Vuex with VueFire.

You can can call `useCollection()` and other composables from VueFire within your components to connect to your store:

```ts
import { doc } from 'firebase/firestore'
import { toRef } from 'vue'
import { useStore } from 'vuex'
import { useDocument } from 'vuefire'

const store = useStore()
const userDataRef = doc(firestore, 'users', userId)

const user = toRef(store.state, 'user')

useDocument(userDataRef, { target: user })
```

In this scenario, the Firebase subscription will stop when the component is unmounted. In order to keep the subscription alive after the component gets unmounted, use an `effectScope()` within an action:

<!-- TODO: I think we can find a simpler way -->
