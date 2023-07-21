# Environment Variables

Nuxt VueFire automatically picks up a few environment variables to configure Firebase from your `.env` file. These usually take precedence over other options defined in `nuxt.config.ts`. They usually try to better support the existing Firebase environment variables.

## Admin SDK

If you are doing SSR, you will need to provide the `GOOGLE_APPLICATION_CREDENTIALS` environment variable with the path to the service account file. This is usually a JSON file that you can download from the Firebase Console > Project Settings > Service Accounts > Generate new private key.

```
GOOGLE_APPLICATION_CREDENTIALS=service-account.json
```

Make sure **to exclude this file from your version control system**.

## AppCheck

If you are using AppCheck, you can specify the `FIREBASE_APPCHECK_DEBUG_TOKEN` environment variable to use a debug token in development. This is useful in **protected** CI environments or if you run multiple Firebase projects on your machine and don't want to rely on the local generation of the debug token

```
FIREBASE_APPCHECK_DEBUG_TOKEN=********-****-****-****-************
```

These can be generated on the Firebase Console > AppCheck > Apps > Manage Debug Tokens.
