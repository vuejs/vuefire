const path = require('path')
const container = require('markdown-it-container')

module.exports = {
  title: 'Vuefire',
  description: 'Realtime bindings between Vue/Vuex and Firebase',
  head: [
    ['link', { rel: 'icon', href: `/logo.png` }],
    // ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
    ],
    // ['link', { rel: 'apple-touch-icon', href: `/icons/apple-touch-icon-152x152.png` }],
    // ['link', { rel: 'mask-icon', href: '/icons/safari-pinned-tab.svg', color: '#3eaf7c' }],
    // ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }],
  ],
  themeConfig: {
    repo: 'vuejs/vuefire',
    editLinks: true,
    docsDir: 'docs',
    // sidebarDepth: 2,
    // sidebar: 'auto',
    sidebar: {
      '/vuefire/': [
        {
          title: 'Vuefire',
          collapsable: false,
          children: [
            '',
            'getting-started',
            'binding-subscriptions',
            'querying',
            'writing-data',
          ],
        },
      ],
      '/vuexfire/': [
        {
          title: 'Vuexfire',
          collapsable: false,
          children: [
            '',
            'getting-started',
            'binding-subscriptions',
            'querying',
            'writing-data',
          ],
        },
      ],
      '/cookbook/': [
        {
          title: 'Cookbook',
          collapsable: false,
          children: ['', 'prototyping', 'rtdb-and-firestore'],
        },
      ],
      '/api/': [
        {
          collapsable: false,
          title: 'API Reference',
          children: ['vuefire', 'vuexfire'],
        },
      ],
    },
    // displayAllHeaders: true,
    nav: [
      {
        text: 'Vuefire',
        link: '/vuefire/',
      },
      {
        text: 'Vuexfire',
        link: '/vuexfire/',
      },
      {
        text: 'API',
        link: '/api/',
      },
      {
        text: 'Cookbook',
        link: '/cookbook/',
      },
    ],
    // #697 Provided by the official algolia team.
    // algolia: {
    //   apiKey: '3a539aab83105f01761a137c61004d85',
    //   indexName: 'vuepress'
    // },
  },
  plugins: {
    '@vuepress/back-to-top': true,
    // '@vuepress/pwa': {
    //   serviceWorker: true,
    //   updatePopup: true
    // },
    // '@vuepress/notification': true,
  },

  markdown: {
    extendMarkdown: md => {
      md.use(container, 'miniwarn', {
        render(tokens, idx) {
          const token = tokens[idx]
          // 8 === 'miniwarn'.length
          const info = token.info
            .trim()
            .slice(8)
            .trim()

          if (token.nesting === 1) {
            // opening tag
            return '<blockquote class="warning">' + info
          } else {
            // closing tag
            return '</blockquote>\n'
          }
        },
      })
    },
  },
}
