import { API } from "@/lib/api";

/**
 * Service for handling file uploads to an S3-compatible storage bucket
 * @implements {StorageBucket}
 */
export class S3BucketService implements StorageBucket {
  /**
   * @param bucket - The name of the S3 bucket to use
   */
  constructor(
    private bucket: string,
    private get_token: () => Promise<string>,
  ) {}

  async upload(file: Blob | File, prefix: string): Promise<string> {
    const response = await fetch(API("s3", "generate-presigned-url"), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await this.get_token()}`,
      },
      body: JSON.stringify({
        path: prefix,
        expiry: 2000,
        bucket: this.bucket,
        method: "put_object",
      }),
    });

    if (!response.ok) throw Error("Failed to generate presigned url");

    const data = await response.json();
    const fileResponse = await fetch(data.upload_url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (!fileResponse.ok) throw new Error("Unable to upload file");
    return data.public_url;
  }
}

/**
 * Default S3 configuration using environment variables with fallback values
 * Will be shifted to a separate API for temporary credentials in the future
 */
export const S3_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_S3_ENDPOINT || "http://localhost:8333",
  region: process.env.NEXT_PUBLIC_S3_REGION || "us-east-1",
  requestChecksumCalculation: "WHEN_REQUIRED",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_ID || "any",
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_KEY || "any",
  },
};
