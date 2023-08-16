import { consola as consolaBase } from 'consola'
export type { LogType } from 'consola'

const nuxtVueFireConsola = consolaBase.withTag('nuxt-vuefire')

export { nuxtVueFireConsola as logger }

// run this to have more levels of logging
// https://github.com/unjs/consola#log-level
// CONSOLA_LEVEL=5 nr dev

// NOTE: used to test
// nuxtVueFireConsola.trace('trace', 'i am a test')
// nuxtVueFireConsola.debug('debug', 'i am a test')
// nuxtVueFireConsola.log('log', 'i am a test')
// nuxtVueFireConsola.info('info', 'i am a test')
// nuxtVueFireConsola.success('success', 'i am a test')
// nuxtVueFireConsola.warn('warn', 'i am a test')
// nuxtVueFireConsola.error('error', 'i am a test', new Error('haha'))
