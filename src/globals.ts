import { FirebaseApp } from 'firebase/app'
import { App, EffectScope, effectScope } from 'vue'

// @internal
const scopeMap = new WeakMap<FirebaseApp, EffectScope>()

/**
 * Gets the VueFire global scope for the current app. Creates one if it doesn't exist.
 * @internal
 *
 * @param app - Vue App
 * @returns
 */
export function getGlobalScope(app: App, firebaseApp: FirebaseApp) {
  let scope: EffectScope | undefined
  // we use the firebaseApp as a key because we are more likely to have access to it and it's supposed to be also unique
  // per app since it contains user data.
  if (!scopeMap.has(firebaseApp)) {
    scope = effectScope(true)
    scopeMap.set(firebaseApp, scope)
    const { unmount } = app
    // dispose up the scope when the app is unmounted
    app.unmount = () => {
      unmount.call(app)
      scope!.stop()
      scopeMap.delete(firebaseApp)
    }
  }

  return scopeMap.get(firebaseApp)!
}
