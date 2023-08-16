import { consola as consolaBase } from 'consola'
export type { LogType } from 'consola'

const vuefireConsola = consolaBase.withTag('vuefire')

export { vuefireConsola as logger }

// run this to have more levels of logging
// https://github.com/unjs/consola#log-level
// CONSOLA_LEVEL=5 nr dev

// NOTE: used to test
// vuefireConsola.trace('trace', 'i am a test')
// vuefireConsola.debug('debug', 'i am a test')
// vuefireConsola.log('log', 'i am a test')
// vuefireConsola.info('info', 'i am a test')
// vuefireConsola.success('success', 'i am a test')
// vuefireConsola.warn('warn', 'i am a test')
// vuefireConsola.error('error', 'i am a test', new Error('haha'))
