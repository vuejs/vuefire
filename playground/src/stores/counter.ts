import { ref, computed } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { doc, setDoc, updateDoc } from 'firebase/firestore'
import { useFirestore } from '@/firebase'
import { useDocument } from 'vuefire'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)

  const db = useFirestore()

  const countRef = doc(db, 'playground', 'pinia-counter').withConverter<number>(
    {
      toFirestore(n) {
        return { n }
      },
      fromFirestore(snapshot) {
        return snapshot.data().n as number
      },
    }
  )

  useDocument(countRef, {
    target: count,
  })

  async function increment() {
    await setDoc(countRef, count.value + 1)
  }

  return { count, doubleCount, increment }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot))
}
