import { Timestamp, GeoPoint } from 'firebase/firestore'
import { markRaw } from 'vue'
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
      return markRaw(new Timestamp(parsed.seconds, parsed.nanoseconds))
    }

    if ('latitude' in parsed && 'longitude' in parsed) {
      return markRaw(new GeoPoint(parsed.latitude, parsed.longitude))
    }

    return parsed
  })

  // to handle the `id` non-enumerable property
  definePayloadReducer('DocumentData', (data: any) => {
    if (data && typeof data === 'object') {
      const idProp = Object.getOwnPropertyDescriptor(data, 'id')
      // we need the non enumerable id property as it's likely used
      if (idProp && !idProp.enumerable) {
        return {
          ...data,
          id: data.id,
        }
      }
    }
  })
  definePayloadReviver(
    'DocumentData',
    (data: string | Record<string, unknown>) => {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      // preserve the non-enumerable property
      // we need to delete it first
      const idValue = parsed.id
      delete parsed.id
      return Object.defineProperty(parsed, 'id', {
        value: idValue,
      })
    }
  )
})
