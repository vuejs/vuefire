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
  // to handle the `id` non-enumerable property
  definePayloadReducer(
    'DocumentData',
    (data: any) =>
      data &&
      typeof data === 'object' &&
      'id' in data &&
      JSON.stringify({
        id: data.id,
        ...data,
      })
  )
  definePayloadReviver('DocumentData', (data: string) => {
    const parsed = JSON.parse(data)
    // preserve the non-enumerable property
    // we need to delete it first
    delete parsed.id
    return Object.defineProperty(parsed, 'id', {
      value: parsed.id,
    })
  })
})
