"use server";

import { UploadConfig, S3Service } from "@/lib/s3Service";
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
  message?: string;
  error?: string;
  data?: {
    fileUrl: string;
  };
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
      userId: userId,
      userRole: 'employer',
      metadata: {
        uploadType: 'employer-profile-image',
        uploadedAt: new Date().toISOString(),
      },
    };

    // Validate file on server
    const validation = S3Service.validate(file, profileImageConfig);
    if (!validation.valid) {
      return createErrorResponse("File validation failed", validation.error);
    }

    // Upload new file first (before deleting old ones for safety)
    const uploadResult = await S3Service.upload(file, profileImageConfig);
    
    if (!uploadResult.success) {
      return createErrorResponse("Upload failed", uploadResult.error);
    }

    // Only delete previous profile images AFTER successful upload
    // (Only one profile image should exist at a time)
    try {
      const prefix = `${profileImageConfig.folderPrefix}/${userId}/`;
      const allFiles = await S3Service.list(prefix);
      
      // Delete all files except the one we just uploaded
      const filesToDelete = allFiles.filter(key => key !== uploadResult.s3Key);
      if (filesToDelete.length > 0) {
        await S3Service.deleteMultiple(filesToDelete);
      }
    } catch (error) {
      console.warn("Error deleting previous profile images:", error);
      // Upload was successful, so we still return success even if cleanup fails
    }

    // Only return fileUrl - key is not needed in DB since we use folder-based cleanup
    return createSuccessResponse("Profile image uploaded successfully", {
      fileUrl: uploadResult.fileUrl,
    });
  });
}

// Server action for company logo upload
export async function uploadCompanyLogo(formData: FormData): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    fileUrl: string;
  };
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
      userId: userId,
      userRole: 'employer',
      metadata: {
        uploadType: 'company-logo',
        uploadedAt: new Date().toISOString(),
      },
    };

    // Validate file on server
    const validation = S3Service.validate(file, logoConfig);
    if (!validation.valid) {
      logError(`File validation failed: ${validation.error}`);
      return createErrorResponse("File validation failed", validation.error);
    }

    // Upload new file first (before deleting old ones for safety)
    logAction("☁️", "Uploading to S3...");
    const uploadResult = await S3Service.upload(file, logoConfig);
    
    if (!uploadResult.success) {
      logError(`Upload failed: ${uploadResult.error}`);
      return createErrorResponse("Upload failed", uploadResult.error);
    }

    logSuccess(`Company logo uploaded successfully: ${uploadResult.fileUrl}`);

    // Only delete previous company logos AFTER successful upload
    // (Only one company logo should exist at a time)
    try {
      const prefix = `${logoConfig.folderPrefix}/${userId}/`;
      const allFiles = await S3Service.list(prefix);
      
      // Delete all files except the one we just uploaded
      const filesToDelete = allFiles.filter(key => key !== uploadResult.s3Key);
      if (filesToDelete.length > 0) {
        await S3Service.deleteMultiple(filesToDelete);
        logAction("🗑️", `Deleted ${filesToDelete.length} previous company logo(s)`);
      }
    } catch (error) {
      console.warn("Error deleting previous company logos:", error);
      // Upload was successful, so we still return success even if cleanup fails
    }

    // Only return fileUrl - key is not needed in DB since we use folder-based cleanup
    return createSuccessResponse("Company logo uploaded successfully", {
      fileUrl: uploadResult.fileUrl,
    });
  });
}
