declare module 'firebase-mock' {
  import { database } from 'firebase'

  type TODO = any

  interface MockFirebaseConstructor {
    new (): MockFirebaseI
  }

  export interface MockedReference extends database.Reference {
    flush: () => void
    forceCancel: (error: any) => void
    autoFlush: () => void
  }

  interface MockFirebaseI {
    child(name: string): MockedReference
  }

  export var MockFirebase: MockFirebaseConstructor
}
