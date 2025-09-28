import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Upload configuration interface
interface UploadConfig {
  folderPrefix: string; // e.g., 'profile-images', 'resumes'
  allowedFileTypes: string[]; // e.g., ['image/*'], ['application/pdf', 'application/msword']
  maxFileSize: number; // in bytes
  cleanupPrevious: boolean; // whether to delete previous files
  generateUniqueFilename: boolean; // whether to add timestamp to filename
  userId: string; // user ID for the upload
  userRole?: string; // user role (candidate, employer, etc.)
  metadata?: Record<string, string>; // additional S3 metadata
}

// Helper function to parse and validate upload config
function parseUploadConfig(configString: string): UploadConfig {
  try {
    const config = JSON.parse(configString) as UploadConfig;
    
    // Validate required fields
    if (!config.folderPrefix || !config.allowedFileTypes || !config.maxFileSize || !config.userId) {
      throw new Error('Missing required config fields: folderPrefix, allowedFileTypes, maxFileSize, userId');
    }
    
    // Ensure arrays and objects are properly typed
    if (!Array.isArray(config.allowedFileTypes)) {
      throw new Error('allowedFileTypes must be an array');
    }
    
    if (typeof config.maxFileSize !== 'number' || config.maxFileSize <= 0) {
      throw new Error('maxFileSize must be a positive number');
    }
    
    return config;
  } catch (error) {
    throw new Error(`Invalid upload configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Function to validate file type against allowed types
function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });
}

// Function to delete previous files for a user in a specific folder
async function deletePreviousFiles(userId: string, folderPrefix: string) {
  try {
    console.log(`Deleting previous files for user: ${userId} in folder: ${folderPrefix}`);
    
    // List all files for this user in the specified folder
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: `${folderPrefix}/${userId}/`,
    });

    const listResponse = await s3Client.send(listCommand);
    
    if (listResponse.Contents && listResponse.Contents.length > 0) {
      console.log(`Found ${listResponse.Contents.length} existing files to delete`);
      
      // Delete all existing files
      const deletePromises = listResponse.Contents
        .filter(obj => obj.Key) // Make sure key exists
        .map(obj => {
          console.log('Deleting previous file:', obj.Key);
          return s3Client.send(new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: obj.Key!,
          }));
        });

      await Promise.all(deletePromises);
      console.log(`Successfully deleted ${deletePromises.length} previous files`);
    } else {
      console.log('No previous files found to delete');
    }
  } catch (error) {
    console.error('Error deleting previous files:', error);
    // Don't throw error as this is cleanup - continue with upload
  }
}

// Function to generate filename based on configuration
function generateFileName(file: File, config: UploadConfig): string {
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  if (config.generateUniqueFilename) {
    const timestamp = Date.now();
    const fileExtension = sanitizedFileName.split('.').pop();
    return `${config.metadata?.uploadType || 'file'}_${timestamp}.${fileExtension}`;
  }
  
  return sanitizedFileName;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?._id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('uploadType') as string;
    const configString = formData.get('config') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!uploadType) {
      return NextResponse.json(
        { error: 'Upload type is required' },
        { status: 400 }
      );
    }

    if (!configString) {
      return NextResponse.json(
        { error: 'Upload configuration is required' },
        { status: 400 }
      );
    }

    // Parse and validate upload configuration
    let config: UploadConfig;
    try {
      config = parseUploadConfig(configString);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid configuration' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file, config.allowedFileTypes)) {
      const allowedTypesStr = config.allowedFileTypes.join(', ');
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${allowedTypesStr}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > config.maxFileSize) {
      const maxSizeMB = Math.round(config.maxFileSize / (1024 * 1024));
      return NextResponse.json(
        { error: `File size must be less than ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Ensure user ID matches session
    if (config.userId !== session.user._id) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid user ID' },
        { status: 403 }
      );
    }

    // Delete previous files if configured to do so
    if (config.cleanupPrevious) {
      await deletePreviousFiles(config.userId, config.folderPrefix);
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename based on configuration
    const fileName = generateFileName(file, config);

    // Create S3 key
    const s3Key = `${config.folderPrefix}/${config.userId}/${fileName}`;

    // Prepare metadata
    const metadata = {
      originalName: file.name,
      userId: config.userId,
      userRole: config.userRole || 'user',
      uploadedAt: new Date().toISOString(),
      ...config.metadata,
    };

    // Upload to S3
    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      Metadata: metadata,
    });

    await s3Client.send(uploadCommand);

    // Generate S3 URL
    const fileUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    console.log(`${uploadType} uploaded to S3:`, fileUrl);

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      s3Key,
      message: `${uploadType} uploaded successfully`,
    });

  } catch (error: any) {
    console.error('S3 upload error:', error);
    
    // Handle specific S3 errors
    if (error.name === 'CredentialsError') {
      return NextResponse.json(
        { error: 'S3 credentials error - Invalid AWS configuration' },
        { status: 500 }
      );
    } else if (error.name === 'NetworkError') {
      return NextResponse.json(
        { error: 'Network error - Unable to connect to S3' },
        { status: 500 }
      );
    } else if (error.$metadata?.httpStatusCode === 403) {
      return NextResponse.json(
        { error: 'S3 access denied - Check bucket permissions' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}