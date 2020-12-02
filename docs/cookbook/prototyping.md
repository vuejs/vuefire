# Prototyping

If you are prototyping a project and you don't want or cannot have a build step with webpack, you may want to use CDN links. In order to do that, you can check the latest Firebase JS SDK version [here](https://firebase.google.com/support/releases) and include that version number in a script tag:

```html
<!-- Firebase App is always required and must be first -->
<script src="https://www.gstatic.com/firebasejs/7.7.0/firebase-app.js"></script>

<!-- Add additional services that you want to use -->
<!-- For RTDB -->
<script src="https://www.gstatic.com/firebasejs/7.7.0/firebase-database.js"></script>
<!-- For Cloud Firestore -->
<script src="https://www.gstatic.com/firebasejs/7.7.0/firebase-firestore.js"></script>
<!-- Others, vuefire do not interact with these packages -->
<script src="https://www.gstatic.com/firebasejs/7.7.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.7.0/firebase-messaging.js"></script>
<script src="https://www.gstatic.com/firebasejs/7.7.0/firebase-functions.js"></script>
```

You don't need to include all of the scripts above, only the ones you are using. Including `firedbase-app` is mandatory but most of the time, you will need one of the databases (`firebase-database.js` or `firebase-firestore.js`) and `firebase-auth.js`.

You can then include vuefire CDN, make sure to use the latest version as well:

```html
<!-- Include the non-minified version to get development warnings -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/vuefire/2.0.0-alpha.20/vuefire.js"></script>
```
