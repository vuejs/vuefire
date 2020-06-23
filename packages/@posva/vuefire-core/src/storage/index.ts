import { storage } from 'firebase'
import { UploadValue } from './utils'

/**
 * Upload file to bucket.
 *
 * @returns the url of the uploaded file.
 * @param path
 * @param fileData
 */

export function upload(path: string, fileData: any) {
  const storageRef = storage()
    .ref(`${path}`)
    .put(fileData)
  storageRef.on(
    'state_changed',
    snapshot => {
      UploadValue(snapshot)
    },
    error => {
      console.log(error.message)
    },
    () => {
      storageRef.snapshot.ref.getDownloadURL().then(url => {
        return url
      })
    }
  )
}

/**
 * get file download link.
 *
 * @return download url.
 * @param path
 */

export function getDownloadUrl(path: string) {
  return storage()
    .ref(`${path}`)
    .getDownloadURL()
}
