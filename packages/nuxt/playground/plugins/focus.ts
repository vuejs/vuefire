export default defineNuxtPlugin((nuxt) => {
  nuxt.vueApp.directive('focus', {
    async mounted(el) {
      await nextTick()
      el.focus()
    },
  })
})
