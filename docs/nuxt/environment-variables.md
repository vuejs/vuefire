# Environment Variables

Nuxt VueFire automatically picks up a few environment variables to configure Firebase from your `.env` file. These usually take precedence over other options defined in `nuxt.config.ts`. They usually try to better support the existing Firebase environment variables.

## Admin SDK

If you are doing SSR, you will need to provide the `GOOGLE_APPLICATION_CREDENTIALS` environment variable with the path to the service account file. This is usually a JSON file that you can download from the Firebase Console > Project Settings > Service Accounts > Generate new private key. 

```
GOOGLE_APPLICATION_CREDENTIALS=service-account.json
```

Make sure **to exclude this file from your version control system**.

The GOOGLE_APPLICATION_CREDENTIALS value can also be set to the content of a service account file. This can be useful when trying to deploy to for instance Vercel, where it is not possible to add files to the file system.

```
GOOGLE_APPLICATION_CREDENTIALS={ "type": "service_account", "project_id": ...} 
```

## AppCheck

If you are using AppCheck, you can specify the `FIREBASE_APPCHECK_DEBUG_TOKEN` environment variable to use a debug token in development. This is useful in **protected** CI environments or if you run multiple Firebase projects on your machine and don't want to rely on the local generation of the debug token

```
FIREBASE_APPCHECK_DEBUG_TOKEN=********-****-****-****-************
```

These can be generated on the Firebase Console > AppCheck > Apps > Manage Debug Tokens.

This variable will not be used in production unless `debug: true` is passed during a build or generate command. This allows you to still test locally using a debug token without having to worry about accidentally deploying it to production.
