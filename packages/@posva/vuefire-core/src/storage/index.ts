import { storage } from 'firebase'
import { UploadValue } from './utils'

/**
 * Upload file to bucket
 *
 * @returns the url of the uploaded file
 * @param path
 * @param fileData
 * @param variable
 * @param picture
 */

export function upload(path: String, fileData: any, variable: String, picture: String) {
  const storageRef = storage().ref(`${path}`).put(fileData);
  storageRef.on('state_changed', snapshot => {
    // Calculate the progress of the upload
    UploadValue(snapshot);
  }, error => {
    console.log(error.message);
    // On complete
  }, () => {
    storageRef.snapshot.ref.getDownloadURL().then((url) => {
      return url
    })
  });
}



