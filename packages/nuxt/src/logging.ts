export type LogType = 'debug' | 'info' | 'warn' | 'error' | 'trace'

// TODO: allow disabling logs with some env variables

export function log(type: LogType, ...args: any[]): void
export function log(...args: any[]): void
export function log(typeOrLog?: unknown, ...args: any[]): void {
  const type = isLogType(typeOrLog) ? typeOrLog : 'log'
  console[type]('[VueFire]:', ...args)
}

function isLogType(type: unknown): type is LogType {
  return (
    typeof type === 'string' &&
    (type === 'debug' ||
      type === 'info' ||
      type === 'warn' ||
      type === 'error' ||
      type === 'trace')
  )
}
