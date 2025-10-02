// Comprehensive S3 service - centralized S3 operations for the entire application
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

// Check if we're on the server side
const isServer = typeof window === 'undefined';

// Debug environment variables only on server
if (isServer) {
  console.log('Environment check:', {
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME
  });
}

// Configure S3 client - shared across all operations (server-side only)
let s3Client: S3Client;

if (isServer) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Validate required environment variables only on server side
if (isServer && !S3_BUCKET_NAME) {
  throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
}

if (isServer) {
  console.log('S3 Configuration:', {
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: S3_BUCKET_NAME
  });
}

// ============== TYPES & INTERFACES ==============

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  s3Key?: string;
  message?: string;
  error?: string;
}

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export interface UploadConfig {
  folderPrefix: string;
  allowedFileTypes: string[];
  maxFileSize: number;
  cleanupPrevious: boolean;
  generateUniqueFilename: boolean;
  userId: string;
  userRole?: 'candidate' | 'employer' | string;
  metadata?: Record<string, string>;
}

export interface S3DownloadResult {
  success: boolean;
  file?: File;
  buffer?: Buffer;
  error?: string;
}

// ============== CORE S3 OPERATIONS CLASS ==============

export class S3Operations {
  // Delete single object from S3
  static async deleteObject(key: string): Promise<void> {
    if (!isServer) {
      throw new Error('S3 operations can only be performed on the server side');
    }
    
    if (!S3_BUCKET_NAME) {
      throw new Error('S3 bucket name is not configured');
    }
    
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

  // Delete all objects with a specific prefix (e.g., all files for a user)
  static async deleteObjectsByPrefix(prefix: string): Promise<void> {
    try {
      // List all objects with the prefix
      const listCommand = new ListObjectsV2Command({
        Bucket: S3_BUCKET_NAME,
        Prefix: prefix,
      });

      const listResponse = await s3Client.send(listCommand);
      
      if (listResponse.Contents && listResponse.Contents.length > 0) {
        // Delete all found objects
        const deletePromises = listResponse.Contents
          .filter(obj => obj.Key)
          .map(obj => this.deleteObject(obj.Key!));

        await Promise.all(deletePromises);
      }
    } catch (error) {
      console.error("Failed to delete objects by prefix:", error);
      throw error;
    }
  }

  // Download object from S3 with enhanced error handling
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

  // Upload object directly to S3 (server-side usage)
  static async uploadObject(
    key: string, 
    buffer: Buffer, 
    contentType: string, 
    metadata?: Record<string, string>
  ): Promise<string> {
    if (!S3_BUCKET_NAME) {
      throw new Error('S3 bucket name is not configured');
    }
    
    console.log('Uploading to S3:', { bucket: S3_BUCKET_NAME, key, contentType });
    
    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata,
    });

    await s3Client.send(uploadCommand);
    
    // Return the S3 URL
    return `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  }

  // List objects with a specific prefix
  static async listObjects(prefix: string): Promise<string[]> {
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await s3Client.send(listCommand);
    return response.Contents?.map(obj => obj.Key!).filter(Boolean) || [];
  }

  // Check if object exists
  static async objectExists(key: string): Promise<boolean> {
    try {
      await this.downloadObject(key);
      return true;
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return false;
      }
      throw error; // Re-throw other errors
    }
  }

  // Get object metadata without downloading the file
  static async getObjectMetadata(key: string): Promise<Record<string, string> | null> {
    try {
      const response = await this.downloadObject(key);
      return response.Metadata || null;
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }
}

// ============== CLIENT-SIDE UPLOAD FUNCTIONS ==============

// Single unified upload function for client-side usage
export const uploadFile = async (
  file: File,
  config: UploadConfig
): Promise<UploadResult> => {
  try {
    // Validate file first
    const validation = validateFile(file, config);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename based on configuration
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = config.generateUniqueFilename 
      ? `${config.metadata?.uploadType || 'file'}_${Date.now()}.${sanitizedFileName.split('.').pop()}`
      : sanitizedFileName;

    // Create S3 key using centralized function
    const s3Key = generateS3Key(config.folderPrefix, config.userId, fileName);

    // Delete previous files if configured to do so
    if (config.cleanupPrevious) {
      try {
        const prefix = `${config.folderPrefix}/${config.userId}/`;
        await S3Operations.deleteObjectsByPrefix(prefix);
      } catch (error) {
        console.warn('Error deleting previous files:', error);
        // Continue with upload even if cleanup fails
      }
    }

    // Prepare metadata
    const metadata = {
      originalName: file.name,
      userId: config.userId,
      userRole: config.userRole || 'user',
      uploadedAt: new Date().toISOString(),
      ...config.metadata,
    };

    // Upload to S3 using centralized service
    const fileUrl = await S3Operations.uploadObject(s3Key, buffer, file.type, metadata);

    return {
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      s3Key,
      message: 'File uploaded successfully',
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
};

// ============== UTILITY FUNCTIONS ==============

// Validation helper function
export const validateFile = (file: File, config: UploadConfig): { valid: boolean; error?: string } => {
  // Check file type
  const isValidType = config.allowedFileTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });

  if (!isValidType) {
    const typeStr = config.allowedFileTypes.join(', ').replace('/*', ' files');
    return { valid: false, error: `File must be: ${typeStr}` };
  }
  
  // Check file size
  if (file.size > config.maxFileSize) {
    const maxSizeMB = Math.round(config.maxFileSize / (1024 * 1024));
    return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  
  return { valid: true };
};

// Generate S3 key helper
export const generateS3Key = (folderPrefix: string, userId: string, fileName: string): string => {
  return `${folderPrefix}/${userId}/${fileName}`;
};

// Extract file info from S3 key
export const parseS3Key = (s3Key: string): { folderPrefix: string; userId: string; fileName: string } => {
  const parts = s3Key.split('/');
  if (parts.length < 3) {
    throw new Error('Invalid S3 key format');
  }
  
  return {
    folderPrefix: parts[0],
    userId: parts[1],
    fileName: parts.slice(2).join('/'), // Handle filenames with slashes
  };
};

// Generate file URL from S3 key
export const getFileUrl = (s3Key: string): string => {
  return `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
};

// ============== EXPORTS ==============

// Export the S3 client and bucket name for advanced usage
export { s3Client, S3_BUCKET_NAME };

// High-level convenience functions for common operations
export const S3Service = {
  // Upload operations
  upload: uploadFile,
  
  // Download operations
  download: S3Operations.downloadObject,
  downloadAsFile: S3Operations.convertS3ResponseToFile,
  
  // Delete operations
  delete: S3Operations.deleteObject,
  deleteMultiple: S3Operations.deleteMultipleObjects,
  deleteByPrefix: S3Operations.deleteObjectsByPrefix,
  
  // Query operations
  exists: S3Operations.objectExists,
  list: S3Operations.listObjects,
  getMetadata: S3Operations.getObjectMetadata,
  
  // Utility functions
  validate: validateFile,
  generateKey: generateS3Key,
  parseKey: parseS3Key,
  getUrl: getFileUrl,
};