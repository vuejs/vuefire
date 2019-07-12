# Upgrading from Vuefire v1.x to v2.0

In 2017, _Firebase_ introduced _Firestore_. To support the new realtime database, a [new version was released as an alpha](https://github.com/vuejs/vuefire/releases/tag/2.0.0-alpha.0) on November 2017. At first, this version was supposed to **only support Firestore**, but with time we realised, the RTDB wasn't being deprecated, so we added **support for RTDB alongside Firestore** to the v2 of Vuefire. Because of that, there were some breaking changes during the alpha itself and the exported module format has totally changed.

If you partially followed, the best place to check for the few breaking changes is [the changelog](https://github.com/vuejs/vuefire/blob/master/CHANGELOG.md)

If you didn't follow during the alpha releases, **no worries**, you can easily catch up and use the latest version of Vuefire. Follow ahead!

## Renamed import for the _RTDB_

Because we support both _RTDB_ and _Firestore_, there are now named exports instead of one single _default_ export. The injected methods `$bind` and `$unbind` are now reserved by default to _Firestore_, but [this can also be customized](https://vuefire.vuejs.org/api/vuefire.html#rtdbplugin).

```diff
import Vue from 'vue'
- import VueFire from 'vuefire'
+ import { rtdbPlugin as VueFire } from 'vuefire'

// explicit installation required in module environments
Vue.use(VueFire)
```

## Changes to `$bindAsArray`/`$bindAsObject` and `$unbind`

There are few changes here but it's all for the best:

- Declaring bound properties in `data`
- Using one single function to bind instead of two
- Having Promises instead of callbacks

So hang on for a moment, I can assure you it will be better:

### Declaring bound properties in `data`

Previously, declaring properties in the `firebase` option was enough. Now it's necessary to declare them in the `data` option:

```diff
{
+  data: {
+    anArray: [],
+    anObject: null
+  },
+
  firebase: {
    anArray: db.ref('url/to/my/collection').limitToLast(25)
    anObject: {
      source: db.ref('url/to/my/object'),
      asObject: true,
      cancelCallback,
      readyCallback
    }
  }
}
```

Any property you want to be bound as an array should be intiliazed to an _Array_.
Any property you want to be bound as an Object should be intiliazed as an _Object_.

Because the type is automatic, the object syntax is not supported anymore. So if you need to call _cancelCallback_ or _readyCallback_, you will have to use the programmatic API:

```diff
{
  data: {
    anArray: [],
    anObject: null
  },

  firebase: {
    anArray: db.ref('url/to/my/collection').limitToLast(25)
-    anObject: {
-      source: db.ref('url/to/my/object'),
-      asObject: true,
-      cancelCallback,
-      readyCallback
-    }
-  }
+  },
+
+  created () {
+    this.$bindAsObject(db.ref('url/to/my/object'), cancelCallback, readyCallback)
+  }
}
```

But this is not exactly it, we need to rename that _programmatic_ call.

### Unifiying `$bindAsArray` and `$bindAsObject` and using Promises

Previously you would call `$bindAsArray` and `$bindAsObject` depending on what you wanted to bind. Now there is only one `$rtdbBind` (which can be renamed to `$bind`, see the tip below).

```diff
{
  data: {
    anArray: [],
    anObject: null
  },

  firebase: {
    anArray: db.ref('url/to/my/collection').limitToLast(25)
  },

  created () {
-    this.$bindAsObject(db.ref('url/to/my/object'), cancelCallback, readyCallback)
+    // you could also use the async/await syntax with a try/catch block
+    this.$rtdbBind(db.ref('url/to/my/object')
+      .then(readyCallback)
+      .catch(cancelCallback)
  }
}
```

:::tip
Note: you can pass an options object with `{ bindName: '$bind', unbindName: '$unbind' }` to `Vue.use(VueFire)` to keep a shorter name for binding instead of `$rtdbBind` and `$rtdbUnbind`.
:::

🎉 That's it! Your app should be running again! If you found things missing in this small guide, feel free to open an Issue or a Pull Request [on Github](https://github.com/vuejs/vuefire)

You should checkout [the guide](./), there are a few code snippets that may come in handy!
