export type LogType = 'debug' | 'info' | 'warn' | 'error' | 'trace'

// TODO: allow disabling logs with some env variables

export function log(type: LogType, ...args: any[]): void
export function log(...args: any[]): void
export function log(typeOrLog?: unknown, ...args: any[]): void {
  const type = typeof typeOrLog === 'string' ? (typeOrLog as LogType) : 'log'
  console[type]('[VueFire]:', ...args)
}
