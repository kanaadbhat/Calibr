"use server";

import { uploadFile, validateFile, UploadConfig } from "@/lib/s3Service";
import { parseAndSaveResume } from "./resume-parsing";
import { requireAuth } from "../lib/validation";
import { 
  createErrorResponse, 
  createSuccessResponse, 
  safeAction,
  logAction,
  logError,
  logSuccess
} from "../lib/action-helpers";

// Server action for profile image upload
export async function uploadProfileImage(formData: FormData): Promise<{
  success: boolean;
  fileUrl?: string;
  s3Key?: string;
  message?: string;
  error?: string;
}> {
  return safeAction(async () => {
    // Check authentication using helper
    const userId = await requireAuth();

    const file = formData.get('file') as File;
    if (!file) {
      return createErrorResponse("No file provided");
    }

    // Profile image upload configuration
    const profileImageConfig: UploadConfig = {
      folderPrefix: 'profile-images',
      allowedFileTypes: ['image/*'],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      cleanupPrevious: true,
      generateUniqueFilename: true,
      userId: userId,
      userRole: 'candidate',
      metadata: {
        uploadType: 'profile-image',
        uploadedAt: new Date().toISOString(),
      },
    };

    // Validate file on server
    const validation = validateFile(file, profileImageConfig);
    if (!validation.valid) {
      return createErrorResponse("File validation failed", validation.error);
    }

    // Upload file
    const uploadResult = await uploadFile(file, profileImageConfig);
    
    if (!uploadResult.success) {
      return createErrorResponse("Upload failed", uploadResult.error);
    }

    return createSuccessResponse("Profile image uploaded successfully", {
      fileUrl: uploadResult.fileUrl,
      s3Key: uploadResult.s3Key,
    });
  }, "Failed to upload profile image");
}

// Server action for resume upload
export async function uploadResume(formData: FormData): Promise<{
  success: boolean;
  fileUrl?: string;
  s3Key?: string;
  fileName?: string;
  fileSize?: number;
  message?: string;
  error?: string;
  resumeId?: string;
  processingDetails?: string;
}> {
  logAction("🚀", "Starting resume upload process...");
  
  return safeAction(async () => {
    // Check authentication using helper
    logAction("🔐", "Checking authentication...");
    const userId = await requireAuth();
    logSuccess(`Authentication successful for user: ${userId}`);

    const file = formData.get('file') as File;
    if (!file) {
      logError("No file provided in FormData");
      return createErrorResponse("No file provided");
    }
    logAction("📄", `File received: ${file.name} (${file.size} bytes, ${file.type})`);

    // Resume upload configuration
    const resumeConfig: UploadConfig = {
      folderPrefix: 'resumes',
      allowedFileTypes: [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'text/plain'
      ],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      cleanupPrevious: false,
      generateUniqueFilename: false,
      userId: userId,
      userRole: 'candidate',
      metadata: {
        uploadType: 'resume',
        uploadedAt: new Date().toISOString(),
      },
    };

    // Validate file on server
    logAction("🔍", "Validating file...");
    const validation = validateFile(file, resumeConfig);
    if (!validation.valid) {
      logError(`File validation failed: ${validation.error}`);
      return createErrorResponse("File validation failed", validation.error);
    }
    logSuccess("File validation passed");

    // Upload file to S3
    logAction("☁️", "Uploading file to S3...");
    const uploadResult = await uploadFile(file, resumeConfig);
    
    if (!uploadResult.success) {
      logError(`S3 upload failed: ${uploadResult.error}`);
      return createErrorResponse("S3 upload failed", uploadResult.error);
    }
    logSuccess(`S3 upload successful: ${uploadResult.fileUrl}`);
    logAction("📍", `S3 Key: ${uploadResult.s3Key}`);

    // Parse and save resume to database
    logAction("🧠", "Starting resume parsing and database save...");
    const parseResult = await parseAndSaveResume(
      uploadResult.fileUrl!,
      uploadResult.fileName || file.name,
      uploadResult.fileSize || file.size,
      uploadResult.s3Key!
    );

    if (!parseResult.success) {
      logError(`Resume parsing/saving failed: ${parseResult.error}`);
      // Even if parsing fails, S3 upload was successful
      return {
        success: true,
        fileUrl: uploadResult.fileUrl,
        s3Key: uploadResult.s3Key,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        message: `Resume uploaded to S3 successfully, but processing failed: ${parseResult.error}`,
        error: parseResult.error,
        processingDetails: `S3 upload successful, but resume processing failed: ${parseResult.error}`
      };
    }

    logSuccess("Resume processing completed successfully!");
    logAction("📝", `Resume ID: ${parseResult.resumeId}`);
    logAction("💬", `Message: ${parseResult.message}`);

    return {
      success: true,
      fileUrl: uploadResult.fileUrl,
      s3Key: uploadResult.s3Key,
      fileName: uploadResult.fileName,
      fileSize: uploadResult.fileSize,
      resumeId: parseResult.resumeId,
      message: parseResult.message,
      processingDetails: `S3 upload successful, resume processing ${parseResult.success ? 'completed' : 'failed'}`
    };
  }, "Failed to upload resume");
}