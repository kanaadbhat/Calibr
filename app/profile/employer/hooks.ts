import { useState } from "react";
import { toast } from "sonner";
import updateEmployerProfile, { uploadEmployerProfileImage, uploadCompanyLogo } from "./actions";
import type { EmployerProfileData } from "./types";

// Hook for profile updates
export function useEmployerProfileUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = async (profileData: EmployerProfileData) => {
    setIsUpdating(true);
    try {
      const res = await updateEmployerProfile(profileData);
      
      if (res.success) {
        toast.success(res.message || "Profile updated successfully");
      } else {
        toast.error(res.error || "Failed to update profile");
      }
      
      return res;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An unexpected error occurred");
      return { success: false, message: "Failed to update profile", error: String(error) };
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateProfile, isUpdating };
}

// Hook for profile image uploads
export function useEmployerProfileImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (formData: FormData) => {
    setIsUploading(true);
    try {
      const result = await uploadEmployerProfileImage(formData);
      
      if (result.success && result.data?.fileUrl) {
        toast.success(result.message || "Profile image uploaded successfully");
        return { success: true, fileUrl: result.data.fileUrl };
      } else {
        toast.error(result.error || "Failed to upload image");
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("An unexpected error occurred during upload");
      return { success: false, error: String(error) };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, isUploading };
}

// Hook for company logo uploads
export function useCompanyLogoUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadLogo = async (formData: FormData) => {
    setIsUploading(true);
    try {
      const result = await uploadCompanyLogo(formData);
      
      if (result.success && result.data?.fileUrl) {
        toast.success(result.message || "Company logo uploaded successfully");
        return { success: true, fileUrl: result.data.fileUrl };
      } else {
        toast.error(result.error || "Failed to upload logo");
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("An unexpected error occurred during upload");
      return { success: false, error: String(error) };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadLogo, isUploading };
}
