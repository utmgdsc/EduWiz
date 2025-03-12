import { S3Client, PutObjectCommand, S3ClientConfig } from "@aws-sdk/client-s3";

/**
 * Service for handling file uploads to an S3-compatible storage bucket
 * @implements {StorageBucket}
 */
export class S3BucketService implements StorageBucket {
  private s3: S3Client;
  private config: S3ClientConfig;
  private bucket: string;

  /**
   * Creates a new S3BucketService instance
   * @param s3 - The AWS SDK S3 client instance
   * @param config - The S3 client configuration
   * @param bucket - The name of the S3 bucket to use
   */
  constructor(s3: S3Client, config: S3ClientConfig, bucket: string) {
    this.s3 = s3;
    this.config = config;
    this.bucket = bucket;
  }

  /**
   * Uploads a file to the S3 bucket with the specified prefix
   * This method will be changed to receive presigned URLs from a separate API for security purposes
   * @param file - The file to upload
   * @param prefix - The folder/prefix path where the file should be stored
   * @returns {Promise<string>} The URL of the uploaded file
   */
  async upload(file: Blob | File, prefix: string): Promise<string> {
    const key = this.getUniqueKey();
    const path = `${prefix}/${key}`;
    const command = new PutObjectCommand({
      Body: file,
      Key: path,
      Bucket: this.bucket,
      ContentType: file.type,
      ContentLength: file.size,
    });
    await this.s3.send(command);
    return `${this.config.endpoint}/${this.bucket}/${path}`;
  }

  /**
   * Generates a unique key for the file using timestamp and random string
   * @returns A unique identifier string
   * @private
   */
  private getUniqueKey(): string {
    return `${Date.now()}-${(Math.random() + 1).toString(36).substring(7)}`;
  }

  /**
   * Factory method to create an S3BucketService from configuration
   */
  static fromConfig(config: S3ClientConfig, bucket: string) {
    return new S3BucketService(new S3Client(config), config, bucket);
  }
}

/**
 * Default S3 configuration using environment variables with fallback values
 * Will be shifted to a separate API for temporary credentials in the future
 */
export const S3_CONFIG: S3ClientConfig = {
  endpoint: process.env.NEXT_PUBLIC_S3_ENDPOINT || "http://localhost:8333",
  region: process.env.NEXT_PUBLIC_S3_REGION || "us-east-1",
  requestChecksumCalculation: "WHEN_REQUIRED",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_ID || "any",
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_KEY || "any",
  },
};
