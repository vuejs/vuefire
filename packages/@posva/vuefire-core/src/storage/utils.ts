/**
 * Calculates the upload value
 *
 * @param snapshot
 * @constructor
 * @return uploadValue as Number
 */

export function UploadValue(snapshot: any): number {
  // Calculate the progress of upload.
  return (snapshot.bytesTransferred / snapshot.totalBytes) * 100
}
