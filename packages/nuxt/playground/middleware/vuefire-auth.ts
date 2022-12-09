import { getCurrentUser } from 'vuefire'
export default defineNuxtRouteMiddleware(async (to, from) => {
  const app = useNuxtApp().$firebaseApp
  console.log('app name', app.name)
  const user = await getCurrentUser(app.name)

  if (!user) {
    return navigateTo('/authentication')
  }
})
