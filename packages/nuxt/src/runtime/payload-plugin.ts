import { Timestamp, GeoPoint } from 'firebase/firestore'
import { markRaw } from 'vue'
import {
  definePayloadPlugin,
  definePayloadReducer,
  definePayloadReviver,
} from '#imports'

/**
 * Handles Firestore Timestamps, GeoPoint, and other types that needs special handling for serialization.
 */
export default definePayloadPlugin(() => {
  definePayloadReducer(
    'FirebaseTimestamp',
    (data: unknown) => data instanceof Timestamp && data.toJSON()
  )
  definePayloadReviver(
    'FirebaseTimestamp',
    (data: ReturnType<Timestamp['toJSON']>) => {
      return markRaw(new Timestamp(data.seconds, data.nanoseconds))
    }
  )

  definePayloadReducer(
    'FirebaseGeoPoint',
    (data: unknown) => data instanceof GeoPoint && data.toJSON()
  )
  definePayloadReviver(
    'FirebaseGeoPoint',
    (data: ReturnType<GeoPoint['toJSON']>) => {
      return markRaw(new GeoPoint(data.latitude, data.longitude))
    }
  )

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
