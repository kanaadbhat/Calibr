// S3 Upload utility functions
// This provides a client-side interface to the reusable S3 upload API

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

// Single unified upload function
export const uploadFile = async (
  file: File,
  config: UploadConfig,
  options?: UploadOptions
): Promise<UploadResult> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', config.metadata?.uploadType || 'file');
    formData.append('config', JSON.stringify(config));

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      signal: options?.signal,
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Upload failed');
    }

    return {
      success: true,
      fileUrl: result.fileUrl,
      fileName: result.fileName,
      fileSize: result.fileSize,
      s3Key: result.s3Key,
      message: result.message,
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
};

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