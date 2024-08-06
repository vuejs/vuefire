# Environment Variables

Nuxt VueFire automatically picks up a few environment variables to configure Firebase from your `.env` file. These usually take precedence over other options defined in `nuxt.config.ts`. They usually try to support the existing Firebase environment variables better.

Since VueFire config is treated as _Public Runtime Config_, it can also be overridden with [env variables by following the Nuxt convention](https://nuxt.com/docs/guide/going-further/runtime-config#environment-variables). For example, an environment variable named `NUXT_PUBLIC_VUEFIRE_CONFIG_API_KEY=xyz` will override the `config.apiKey`.
Note you still need to provide empty string values to each `config` property that is defined this way.

## Admin SDK

During development, if you are doing SSR, you must provide the `GOOGLE_APPLICATION_CREDENTIALS` environment variable with the path to the service account file. This is usually a JSON file you can download from the Firebase Console > Project Settings > Service Accounts > Generate new private key.

```
GOOGLE_APPLICATION_CREDENTIALS=service-account.json
```

Ensure **to exclude the `.env` and `service-account.json` files from your version control system**. This variable will be automatically set on Firebase and Google Cloud deployments.

::: tip

When deploying to something other than Firebase or Google Cloud, the `GOOGLE_APPLICATION_CREDENTIALS` environment variable must be set manually. Instead of setting it to the path of the service account file, you can set it to the content of the file itself. Note it will have to fit in **one single line**:

```
GOOGLE_APPLICATION_CREDENTIALS='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n[redacted]\n-----END PRIVATE KEY-----\n"}'
```

:::

## AppCheck

If you are using AppCheck, you can specify the `FIREBASE_APPCHECK_DEBUG_TOKEN` environment variable to use a debug token in development. This is useful in **protected** CI environments or if you run multiple Firebase projects on your machine and don't want to rely on the local generation of the debug token.

```
FIREBASE_APPCHECK_DEBUG_TOKEN=********-****-****-****-************
```

These can be generated on the Firebase Console > AppCheck > Apps > Manage Debug Tokens.

This variable will not be used in production unless `debug: true` is passed during a build or generate command. This allows you to still test locally using a debug token without worrying about accidentally deploying it to production.

## Debugging utilities

You can activate these while developing or building locally by setting them before running the command:

```bash
VUEFIRE_APPCHECK_DEBUG=true VUEFIRE_EMULATORS=true pnpm run build
```

- `VUEFIRE_APPCHECK_DEBUG=true` will activate the AppCheck debug even in production.
- `VUEFIRE_EMULATORS=true` will activate the Firebase Emulators even in production.
