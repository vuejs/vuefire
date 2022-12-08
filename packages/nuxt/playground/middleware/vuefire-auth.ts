import { getCurrentUser } from 'vuefire'
export default defineNuxtRouteMiddleware(async (to, from) => {
  const app = useNuxtApp().$firebaseApp
  // TODO: handle
  if (process.server) {
    return
  }
  const user = await getCurrentUser(app.name)
  console.log('user', user)

  if (!user) {
    return navigateTo('/authentication')
  }
})
