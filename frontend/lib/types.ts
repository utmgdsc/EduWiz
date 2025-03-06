/**
 * Interface defining the contract for storage bucket operations
 * Provides methods for uploading files to a storage system
 */
interface StorageBucket {
  /**
   * Uploads a file to the storage bucket with the specified prefix
   * @param {File | Blob} file - The file or blob data to upload
   * @param {string} prefix - The folder/path prefix where the file should be stored
   * @returns {Promise<string>} A promise that resolves to the public URL of the uploaded file
   * @throws {Error} If the upload fails due to network issues or permission issues
   */
  upload: (file: File | Blob, prefix: string) => Promise<string>;
}
