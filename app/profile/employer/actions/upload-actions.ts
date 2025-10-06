"use server";

import { uploadFile, validateFile, UploadConfig } from "@/lib/s3Service";
import { requireAuth } from "@/utils/auth-helpers";
import { 
  createErrorResponse, 
  createSuccessResponse, 
  safeAction,
  logAction,
  logSuccess,
  logError
} from "@/utils/action-helpers";

// Server action for employer profile image upload
export async function uploadEmployerProfileImage(formData: FormData): Promise<{
  success: boolean;
  fileUrl?: string;
  s3Key?: string;
  message?: string;
  error?: string;
}> {
  return safeAction(async () => {
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
      userRole: 'employer',
      metadata: {
        uploadType: 'employer-profile-image',
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
  });
}

// Server action for company logo upload
export async function uploadCompanyLogo(formData: FormData): Promise<{
  success: boolean;
  fileUrl?: string;
  s3Key?: string;
  message?: string;
  error?: string;
}> {
  return safeAction(async () => {
    const userId = await requireAuth();

    const file = formData.get('file') as File;
    if (!file) {
      return createErrorResponse("No file provided");
    }

    logAction("📤", `Uploading company logo for employer: ${userId}`);

    // Company logo upload configuration
    const logoConfig: UploadConfig = {
      folderPrefix: 'company-logos',
      allowedFileTypes: ['image/*'],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      cleanupPrevious: true,
      generateUniqueFilename: true,
      userId: userId,
      userRole: 'employer',
      metadata: {
        uploadType: 'company-logo',
        uploadedAt: new Date().toISOString(),
      },
    };

    // Validate file on server
    const validation = validateFile(file, logoConfig);
    if (!validation.valid) {
      logError(`File validation failed: ${validation.error}`);
      return createErrorResponse("File validation failed", validation.error);
    }

    // Upload file
    logAction("☁️", "Uploading to S3...");
    const uploadResult = await uploadFile(file, logoConfig);
    
    if (!uploadResult.success) {
      logError(`Upload failed: ${uploadResult.error}`);
      return createErrorResponse("Upload failed", uploadResult.error);
    }

    logSuccess(`Company logo uploaded successfully: ${uploadResult.fileUrl}`);

    return createSuccessResponse("Company logo uploaded successfully", {
      fileUrl: uploadResult.fileUrl,
      s3Key: uploadResult.s3Key,
    });
  });
}
