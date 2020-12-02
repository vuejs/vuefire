/** @typedef {import('vitepress').UserConfig} UserConfig */

/** @type {UserConfig['head']} */
const head = [['link', { rel: 'icon', href: `/logo.png` }]]

if (process.env.NODE_ENV === 'production') {
  head.push([
    'script',
    {
      src: 'https://unpkg.com/thesemetrics@latest',
      async: '',
    },
  ])
}

/** @type {UserConfig} */
const config = {
  lang: 'en-US',
  title: 'Vuefire',
  description: 'Realtime bindings between Vue/Vuex and Firebase',
  description: 'The official router for Vue.js.',

  head,

  themeConfig: {
    repo: 'vuejs/vuefire',
    docsRepo: 'vuejs/vuefire',
    docsDir: 'docs',
    docsBranch: 'v3',
    editLinks: true,

    nav: [
      {
        text: 'Guide',
        link: '/guide/index.html',
      },
      {
        text: 'API Reference',
        link: '/api/',
      },
      {
        text: 'Changelog',
        link: 'https://github.com/vuejs/vuefire/blob/v3/CHANGELOG.md',
      },
    ],

    sidebar: [
      {
        text: 'Introduction',
        link: '/introduction.html',
      },
      {
        text: 'Installation',
        link: '/installation.html',
      },
      {
        text: 'Guide',
        link: '/guide/',
        collapsable: false,
        children: [
          { text: 'Getting started', link: '/guide/' },
          {
            text: 'Realtime data',
            link: '/guide/binding-subscriptions.html',
          },
          {
            text: 'Querying the database',
            link: '/guide/querying.html',
          },
          {
            text: 'Writing to the database',
            link: '/guide/writing-data.html',
          },
          // 'binding-subscriptions',
          // 'querying',
          // 'writing-data',
          // 'upgrading-from-v1',
        ],
      },

      {
        text: 'Cookbook',
        link: '/cookbook/',
        children: [
          {
            text: 'Fast prototyping with Vuefire',
            link: '/cookbook/prototyping.html',
          },
          {
            text: 'SSR',
            link: '/cookbook/ssr.html',
          },
          {
            text: 'Using the RTDB and Firestore',
            link: '/cookbook/rtdb-and-firestore.html',
          },
          // '', 'prototyping', 'rtdb-and-firestore', 'ssr'
        ],
      },
    ],

    carbonAds: {
      carbon: 'CEBICK3I',
      custom: 'CEBICK3M',
      placement: 'routervuejsorg',
    },

    algolia: {
      apiKey: '0d5c32429ddf401270cbc9b4e24c4532',
      indexName: 'vuefire',
      // algoliaOptions: { facetFilters: ['tags:guide,api'] },
    },
  },
}

module.exports = config
