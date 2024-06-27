import { describe, expect, it } from 'vitest'
import { parseTenantFromFirebaseJwt } from '../../src'

describe('auth/parseTenantFromFirebaseJwt', () => {
  it('should return null if supplied jwt is null', () => {
    const sut = null

    const result = parseTenantFromFirebaseJwt(sut)

    expect(result).toBeNull()
  })

  it('should return null if supplied jwt is an empty string', () => {
    const sut = ''

    const result = parseTenantFromFirebaseJwt(sut)

    expect(result).toBeNull()
  })

  it('should return null if supplied jwt is an invalid jwt', () => {
    const sut = 'a.b.c'

    const result = parseTenantFromFirebaseJwt(sut)

    expect(result).toBeNull()
  })

  it('should return null if supplied jwt does not have the right structure', () => {
    // {
    //  "tenant": "test"
    // }
    const sut = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnQiOiJ0ZXN0In0'

    const result = parseTenantFromFirebaseJwt(sut)

    expect(result).toBeNull()
  })

  it('should return payload tenant if supplied jwt is valid but has no signature', () => {
    // {
    //     "firebase": {
    //         "tenant": "test"
    //     }
    // }
    const sut =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJmaXJlYmFzZSI6eyJ0ZW5hbnQiOiJ0ZXN0In19'

    const result = parseTenantFromFirebaseJwt(sut)

    expect(result).toEqual('test')
  })
})
