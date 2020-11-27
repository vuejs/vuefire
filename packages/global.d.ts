declare module 'firebase-mock' {
  import firebase from 'firebase/app'
  type TODO = any

  interface MockFirebaseConstructor {
    new (): MockFirebaseI
  }

  export interface MockedReference extends firebase.database.Reference {
    flush: () => void
    forceCancel: (error: any) => void
    autoFlush: () => void
  }

  interface MockFirebaseI {
    child(name: string): MockedReference
  }

  export var MockFirebase: MockFirebaseConstructor
}
