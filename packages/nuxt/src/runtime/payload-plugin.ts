import {
  definePayloadPlugin,
  definePayloadReducer,
  definePayloadReviver,
} from '#app'

/**
 * Handles Firestore Timestamps and other JSONifiable objects
 */
export default definePayloadPlugin(() => {
  definePayloadReducer(
    'JSONifiable',
    (data: any) =>
      data != null &&
      typeof data.toJSON === 'function' &&
      JSON.stringify(data.toJSON())
  )
  definePayloadReviver('JSONifiable', (data: string) => JSON.parse(data))
})
