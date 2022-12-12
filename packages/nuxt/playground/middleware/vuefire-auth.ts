export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = await getCurrentUser()

  console.log('got user in middleware', user?.uid)

  if (!user) {
    return navigateTo('/authentication')
  }
})
