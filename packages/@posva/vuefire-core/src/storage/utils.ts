/**
 * Calculates the upload value
 *
 * @param snapshot
 * @constructor
 * @return uploadValue as Number
 */

export function UploadValue(snapshot: any) : Number {
    return (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
}
