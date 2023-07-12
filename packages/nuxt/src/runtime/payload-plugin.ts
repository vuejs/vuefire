import { Timestamp, GeoPoint } from 'firebase/firestore'
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
  definePayloadReviver('JSONifiable', (data: string) => {
    const parsed = JSON.parse(data)

    if ('seconds' in parsed && 'nanoseconds' in parsed) {
      return new Timestamp(parsed.seconds, parsed.nanoseconds)
    }

    if ('latitude' in parsed && 'longitude' in parsed) {
      return new GeoPoint(parsed.latitude, parsed.longitude)
    }

    return parsed
  })
})
