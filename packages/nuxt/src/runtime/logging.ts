export type LogType = 'debug' | 'info' | 'warn' | 'error' | 'trace' | 'log'

// TODO: allow disabling logs with some env variables

export function log(type: LogType, ...args: any[]): void
export function log(...args: any[]): void
export function log(...args: unknown[]): void {
  const [typeOrLog, ...rest] = args
  if (isLogType(typeOrLog)) {
    console[typeOrLog]('[nuxt-vuefire]:', ...rest)
  } else {
    console.log('[nuxt-vuefire]:', ...args)
  }
}

function isLogType(logType: unknown): logType is LogType {
  return (
    logType === 'debug' ||
    logType === 'info' ||
    logType === 'warn' ||
    logType === 'error' ||
    logType === 'trace'
  )
}
