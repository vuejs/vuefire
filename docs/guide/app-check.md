# Firebase App Check

[Firebase App Check](https://firebase.google.com/docs/app-check#web) helps protect your API resources from abuse by preventing unauthorized clients from accessing your backend resources. It works with both Firebase services, Google Cloud services, and your own APIs to keep your resources safe.

## Installation

Start by adding the `VueFireAppCheck` module to the `VueFire` plugin:

```ts
import { VueFire, VueFireAuth } from 'vuefire'
app.use(VueFire, {
  firebaseApp: createFirebaseApp(),
  modules: [
    // ... other modules
    VueFireAppCheck({
      // app check options
    }),
  ],
})
```

In order to use App Check you need to enable it in the Firebase Console > App Check. You also need to setup [a reCAPTCHA provider](https://firebase.google.com/docs/app-check#web), then provide it in the `VueFireAppCheck` module:

```ts{2,9}
import { VueFire, VueFireAuth } from 'vuefire'
import { ReCaptchaV3Provider } from 'firebase/app-check'

app.use(VueFire, {
  firebaseApp: createFirebaseApp(),
  modules: [
    // ... other modules
    VueFireAppCheck({
      provider: new ReCaptchaV3Provider('...')
      isTokenAutoRefreshEnabled: true,
    }),
  ],
})
```

During development, it might be convenient to use a debug token by setting `debug` to `true`. You can then add it to your debug tokens in the Firebase Console > App Check > Apps > Manage Debug Tokens.

```ts{10-11}
import { VueFire, VueFireAuth } from 'vuefire'
import { ReCaptchaV3Provider } from 'firebase/app-check'

app.use(VueFire, {
  firebaseApp: createFirebaseApp(),
  modules: [
    // ... other modules
    VueFireAppCheck({
      provider: new ReCaptchaV3Provider('...')
      // Only use debug during development
      debug: process.env.NODE_ENV !== 'production',
      isTokenAutoRefreshEnabled: true,
    }),
  ],
})
```
