import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export class S3Operations {
  // Delete object from S3
  static async deleteObject(key: string): Promise<void> {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(deleteCommand);
  }

  // Delete multiple objects from S3
  static async deleteMultipleObjects(keys: string[]): Promise<void> {
    const deletePromises = keys.map(key => this.deleteObject(key));
    await Promise.all(deletePromises);
  }

  // Download object from S3
  static async downloadObject(key: string): Promise<any> {
    const getCommand = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    try {
      const s3Response = await s3Client.send(getCommand);
      return s3Response;
    } catch (s3Error: any) {
      console.error("Failed to download file from S3:", s3Error);
      
      // Provide specific S3 error messages
      if (s3Error.name === 'NoSuchKey' || s3Error.$metadata?.httpStatusCode === 404) {
        throw new Error(`File was not found in S3 storage. It may have been moved or deleted.`);
      } else if (s3Error.name === 'AccessDenied' || s3Error.$metadata?.httpStatusCode === 403) {
        throw new Error("Insufficient permissions to access the file in storage.");
      } else if (s3Error.$metadata?.httpStatusCode === 500) {
        throw new Error("S3 storage service is currently unavailable. Please try again later.");
      } else {
        throw new Error(`S3 Error: ${s3Error.message || 'Unknown storage error'}`);
      }
    }
  }

  // Convert S3 response to File object
  static async convertS3ResponseToFile(s3Response: any, fileName: string, mimeType: string): Promise<File> {
    if (!s3Response.Body) {
      throw new Error("Empty file received from storage");
    }

    // Get file buffer
    const chunks: Uint8Array[] = [];
    const reader = s3Response.Body.transformToWebStream().getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Create a File object from buffer
    return new File([buffer], fileName, { type: mimeType });
  }
}

export { s3Client, S3_BUCKET_NAME };