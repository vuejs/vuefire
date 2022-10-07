import Theme from 'vitepress/theme'
import '../sytle/vars.css'
import { h } from 'vue'
// import Layout from './Layout.vue'
// import HomeSponsors from '../components/HomeSponsors.vue'
// import FirebaseExample from '../components/FirebaseExample.vue'
// import RtdbLogo from '../components/RtdbLogo.vue'
// import FirestoreLogo from '../components/FirestoreLogo.vue'

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      // 'home-features-after': () => h(HomeSponsors),
      // 'aside-ads-before': () => h(AsideSponsors),
    })
  },
  enhanceApp({ app, router, siteData }) {
    // app.component('HomeSponsors', HomeSponsors)
    // app.component('FirebaseExample', FirebaseExample)
    // app.component('RtdbLogo', RtdbLogo)
    // app.component('FirestoreLogo', FirestoreLogo)
    // app is the Vue 3 app instance from createApp()
    // router is VitePress' custom router (see `lib/app/router.js`)
    // siteData is a ref of current site-level metadata.
  },
}
