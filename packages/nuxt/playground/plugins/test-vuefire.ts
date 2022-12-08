export default defineNuxtPlugin((nuxt) => {
  const firebaseApp = useNuxtApp().$firebaseApp
  console.log('Has firebase App', !!firebaseApp)
})
