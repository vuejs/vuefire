# Deployment with NuxtModule

firebase init

add firebase-admin, firebase-functions

add specific config to firebase.json

NITRO_PRESET=firebase nuxt build

cd .output/server && pnpm i

Activate app check <https://console.developers.google.com/apis/api/iamcredentials.googleapis.com/overview?project=998674887640a>

Activated secrets manager <https://cloud.google.com/functions/docs/configuring/secrets>

create secret <https://cloud.google.com/secret-manager/docs/creating-and-accessing-secrets#create>
