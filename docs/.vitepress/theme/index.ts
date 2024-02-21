import { h } from 'vue'
import { type Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import '../style/vars.css'
// import Layout from './Layout.vue'
// import HomeSponsors from '../components/HomeSponsors.vue'
import AsideSponsors from './components/AsideSponsors.vue'
import FirebaseExample from '../components/FirebaseExample.vue'
import RtdbLogo from '../components/RtdbLogo.vue'
import FirestoreLogo from '../components/FirestoreLogo.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 'home-features-after': () => h(HomeSponsors),
      // 'aside-ads-before': () => h(AsideSponsors),
    })
  },
  enhanceApp({ app }) {
    // app.component('HomeSponsors', HomeSponsors)
    app.component('FirebaseExample', FirebaseExample)
    app.component('RtdbLogo', RtdbLogo)
    app.component('FirestoreLogo', FirestoreLogo)
  },
} satisfies Theme
