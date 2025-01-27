import { defineConfig, DefaultTheme } from 'vitepress'
import { version } from '../../package.json'
import {
  twitter,
  headTitle,
  headDescription,
  ogImage,
  ogUrl,
  contributing,
  github,
  releases,
} from './meta'

const rControl = /[\u0000-\u001f]/g
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'“”‘’<>,.?/]+/g
const rCombining = /[\u0300-\u036F]/g

/**
 * Default slugification function
 */
export const slugify = (str: string): string =>
  str
    .normalize('NFKD')
    // Remove accents
    .replace(rCombining, '')
    // Remove control characters
    .replace(rControl, '')
    // Replace special characters
    .replace(rSpecial, '-')
    // ensure it doesn't start with a number
    .replace(/^(\d)/, '_$1')

export default defineConfig({
  lang: 'en-US',
  title: headTitle,
  description: headDescription,

  markdown: {
    theme: {
      dark: 'one-dark-pro',
      light: 'github-light',
    },

    attrs: {
      leftDelimiter: '%{',
      rightDelimiter: '}%',
    },

    anchor: {
      slugify,
    },
  },

  head: [
    ['meta', { name: 'theme-color', content: '#ffca28' }],
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }],
    [
      'link',
      {
        rel: 'alternate icon',
        href: '/favicon.ico',
        type: 'image/png',
        sizes: '16x16',
      },
    ],
    [
      'meta',
      {
        name: 'author',
        content: `Eduardo San Martin Morote (@posva) and contributors`,
      },
    ],
    [
      'meta',
      {
        name: 'keywords',
        content:
          'Vue.js, Vue, Firebase, Firestore, Realtime Database, VueFire, pinia, authentication',
      },
    ],
    ['meta', { property: 'og:title', content: headTitle }],
    ['meta', { property: 'og:description', content: headDescription }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { name: 'twitter:title', content: headTitle }],
    ['meta', { name: 'twitter:description', content: headDescription }],
    ['link', { rel: 'mask-icon', href: '/logo.svg', color: '#ffffff' }],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
        sizes: '180x180',
      },
    ],
  ],

  themeConfig: {
    logo: '/logo.svg',
    editLink: {
      pattern: 'https://github.com/vuejs/vuefire/edit/main/docs/:path',
      text: 'Suggest changes to this page',
    },

    outline: [2, 3],

    socialLinks: [
      { icon: 'twitter', link: twitter },
      { icon: 'github', link: github },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright:
        'Copyright © 2016-present Eduardo San Martin Morote and VueFire contributors',
    },

    carbonAds: {
      code: 'CK7DL23N',
      placement: 'vuefirevuejsorg',
    },

    algolia: {
      appId: 'O9WVPRF35B',
      apiKey: '7f026cbac6640bcf8b3f4c5f6f592d7b',
      indexName: 'vuefire',
      // algoliaOptions: { facetFilters: ['tags:guide,api'] },
    },

    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/', activeMatch: '^/api/' },
      {
        text: `v${version}`,
        items: [
          {
            text: 'Release Notes ',
            link: releases,
          },
          {
            text: 'Contributing ',
            link: contributing,
          },
          {
            text: 'VueFire 2.x ',
            link: 'https://v2.vuefire.vuejs.org',
          },
        ],
      },
    ],

    sidebar: {
      '/': [
        //
        sidebarGuide(),
        sidebarNuxt(),
        sidebarCookbook(),
        sidebarApi(),
      ],
    },
  },
})

type SidebarGroup = DefaultTheme.SidebarItem

function sidebarGuide(): SidebarGroup {
  return {
    text: 'Guide',
    collapsed: false,
    items: [
      {
        text: 'Why VueFire',
        link: '/guide/',
      },
      {
        text: 'Getting Started',
        link: '/guide/getting-started',
      },
      {
        text: 'Realtime Data',
        link: '/guide/realtime-data',
      },
      {
        text: 'Authentication',
        link: '/guide/auth',
      },
      {
        text: 'Storage',
        link: '/guide/storage',
      },
      {
        text: 'App Check',
        link: '/guide/app-check.md',
      },
      {
        text: 'Other Firebase Services',
        link: '/guide/other-firebase-services.md',
      },
      {
        text: 'SSR',
        link: '/guide/ssr',
      },
      {
        text: 'Options API',
        link: '/guide/options-api-realtime-data',
      },
      // NOTE: hide until it works
      // {
      //   text: 'Querying the database',
      //   link: '/guide/querying',
      // },
      // {
      //   text: 'Writing to the database',
      //   link: '/guide/writing-data',
      // },
      {
        text: 'Global Options',
        link: '/guide/global-options',
      },
    ],
  }
}

function sidebarNuxt(): SidebarGroup {
  return {
    collapsed: false,
    text: 'Nuxt',
    items: [
      {
        text: 'Getting Started',
        link: '/nuxt/getting-started',
      },
      {
        text: 'Authentication',
        link: '/nuxt/auth',
      },
      {
        text: 'App Check',
        link: '/nuxt/app-check',
      },
      {
        text: 'Server Side Rendering',
        link: '/nuxt/ssr',
      },
      {
        text: 'Deployment',
        link: '/nuxt/deployment',
      },
      {
        text: 'Environment Variables',
        link: '/nuxt/environment-variables',
      },
    ],
  }
}

function sidebarCookbook(): SidebarGroup {
  return {
    collapsed: false,
    text: 'Cookbook',
    items: [
      {
        text: 'Cookbook Index',
        link: '/cookbook/',
      },
      {
        text: 'Migration from VueFire 2',
        link: '/cookbook/migration-v2-v3',
      },
      {
        text: 'Binding to existing refs',
        link: '/cookbook/subscriptions-external',
      },
    ],
  }
}

function sidebarApi(): SidebarGroup {
  return {
    text: 'API Reference',
    items: [
      { text: 'Package List', link: '/api/' },
      {
        text: 'nuxt-vuefire',
        link: '/api/modules/packages_nuxt_src_module.html',
      },
      { text: 'vuefire', link: '/api/modules/vuefire.html' },
    ],
  }
}
