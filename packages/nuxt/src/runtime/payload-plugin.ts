import { Timestamp, GeoPoint } from 'firebase/firestore'
import { markRaw } from 'vue'
import {
  definePayloadPlugin,
  definePayloadReducer,
  definePayloadReviver,
} from '#app'

/**
 * Handles Firestore Timestamps, GeoPoint, and other types that needs special handling for serialization.
 */
export default definePayloadPlugin(() => {
  definePayloadReducer(
    'FirebaseTimestamp',
    (data: unknown) =>
      data instanceof Timestamp && JSON.stringify(data.toJSON())
  )
  definePayloadReviver('FirebaseTimestamp', (data: string) => {
    const parsed = JSON.parse(data)
    return markRaw(new Timestamp(parsed.seconds, parsed.nanoseconds))
  })

  definePayloadReducer(
    'FirebaseGeoPoint',
    (data: unknown) => data instanceof GeoPoint && JSON.stringify(data.toJSON())
  )
  definePayloadReviver('FirebaseGeoPoint', (data: string) => {
    const parsed = JSON.parse(data)
    return markRaw(new GeoPoint(parsed.latitude, parsed.longitude))
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
