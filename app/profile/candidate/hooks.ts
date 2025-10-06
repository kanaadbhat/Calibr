"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import updateCandidateProfile from "./actions";
import { 
  deleteResume,
  uploadResume,
  uploadProfileImage,
  fetchCandidateProfile,
  applyResumeToProfile,
  parseResumeFromS3,
  getCandidateResumes,
} from "./actions";
import { ProfileData } from "./types";

// Hook for fetching profile data
export function useProfileData(candidateId: string) {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    tagline: "",
    summary: "",
    workDetails: [],
    education: [],
    skills: "",
    projects: [],
    certificates: [],
    socialLinks: { linkedin: "", github: "" },
    resume: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const loadProfile = useCallback(async () => {
    // Don't fetch if candidateId is empty or undefined
    if (!candidateId || candidateId.trim() === "") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCandidateProfile(candidateId);
      if (result.success && result.data) {
        setProfileData(result.data);
        setCompletionPercentage(result.completionPercentage);
      } else {
        setError(result.message);
        toast.error(result.error || "Failed to load profile");
      }
    } catch (e) {
      console.error("Error loading profile:", e);
      setError("Failed to load profile");
      toast.error("An error occurred while loading your profile");
      setCompletionPercentage(0);
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profileData,
    setProfileData,
    isLoading,
    error,
    completionPercentage,
    refetch: loadProfile,
  };
}

// Hook for profile updates
export function useProfileUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = useCallback(async (profileData: ProfileData) => {
    setIsUpdating(true);
    toast.dismiss();
    
    try {
      const result = await updateCandidateProfile(profileData);
      
      if (result.success) {
        toast.success("Profile updated successfully!");
        return { success: true };
      } else {
        toast.error(result.message || "Failed to update profile");
        return { success: false, error: result.message };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return { updateProfile, isUpdating };
}

// Hook for resume upload
export function useResumeUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadResumeFile = useCallback(async (formData: FormData) => {
    setIsUploading(true);
    toast.dismiss();
    const loadingToastId = toast.loading("Uploading resume...");
    
    try {
      const result = await uploadResume(formData);
      
      toast.dismiss(loadingToastId);
      
      if (result.success) {
        toast.dismiss();
        if (result.resumeId) {
          toast.success("Resume uploaded and processed successfully!");
        } else if (result.error) {
          toast.warning(`Resume uploaded but processing failed: ${result.error}`);
        } else {
          toast.success("Resume uploaded successfully!");
        }
        return { success: true, data: result };
      } else {
        toast.dismiss();
        toast.error(result.message || "Failed to upload resume");
        return { success: false, error: result.message };
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.dismiss();
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { uploadResumeFile, isUploading };
}

// Hook for resume deletion
export function useResumeDelete() {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteResumeFile = useCallback(async (resumeId: string) => {
    setIsDeleting(true);
    toast.dismiss();
    
    try {
      const result = await deleteResume(resumeId);
      
      if (result.success) {
        toast.success(result.message || "Resume deleted successfully!");
        
        // Save scroll position and reload
        sessionStorage.setItem('scrollPosition', window.scrollY.toString());
        
        // Small delay before reload to ensure toast is visible
        setTimeout(() => {
          window.location.reload();
        }, 500);
        
        return { success: true };
      } else {
        toast.error(result.message || "Failed to delete resume");
        return { success: false, error: result.message };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteResumeFile, isDeleting };
}

// Hook for profile image upload
export function useProfileImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = useCallback(async (formData: FormData) => {
    setIsUploading(true);
    toast.dismiss();
    const loadingToastId = toast.loading("Uploading profile image...");
    
    try {
      const result = await uploadProfileImage(formData);
      
      toast.dismiss(loadingToastId);
      
      if (result.success && result.fileUrl) {
        toast.dismiss();
        toast.success("Profile image uploaded successfully!");
        return { success: true, fileUrl: result.fileUrl };
      } else {
        toast.dismiss();
        toast.error(result.message || "Failed to upload image");
        return { success: false, error: result.message };
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      toast.dismiss();
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { uploadImage, isUploading };
}

// Hook for resume operations (fetch, parse, apply)
export function useResumeOperations(candidateId: string) {
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const loadResumes = useCallback(async () => {
    if (!candidateId) return;
    
    setIsLoadingResumes(true);
    try {
      const result = await getCandidateResumes(candidateId);
      if (result.success && result.resumes) {
        setResumes(result.resumes);
      } else {
        setResumes([]);
      }
    } catch (error) {
      console.error("Error loading resumes:", error);
      toast.error("Failed to load resumes");
      setResumes([]);
    } finally {
      setIsLoadingResumes(false);
    }
  }, [candidateId]);

  const parseResume = useCallback(async (resumeId: string) => {
    setIsParsing(true);
    toast.info("Parsing resume from S3 file...");
    
    try {
      const result = await parseResumeFromS3(resumeId);
      
      if (result.success) {
        toast.success("Resume parsed successfully!");
        
        // Update local state
        setResumes(prev => prev.map(r => 
          r.id === resumeId 
            ? { ...r, isParsed: true }
            : r
        ));
        
        return { success: true };
      } else {
        const errorMessage = result.error || result.message || "Failed to parse resume";
        toast.error(errorMessage, { duration: 5000 });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsParsing(false);
    }
  }, []);

  const applyResume = useCallback(async (resumeId: string, onSuccess?: () => void) => {
    setIsApplying(true);
    toast.dismiss();
    
    try {
      const result = await applyResumeToProfile(resumeId);
      
      if (result.success) {
        toast.dismiss();
        toast.success(result.message || "Resume applied to profile successfully!");
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        onSuccess?.();
        
        return { success: true };
      } else {
        const errorMessage = result.error || result.message || "Failed to apply profile";
        toast.error(errorMessage, { duration: 4000 });
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      console.error("Error applying profile:", error);
      
      // Show specific error messages
      let errorMessage = "An unexpected error occurred";
      if (error.message?.includes('fetch')) {
        errorMessage = "Network error: Unable to connect to server";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Request timeout: Operation took too long";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { duration: 4000 });
      return { success: false, error: errorMessage };
    } finally {
      setIsApplying(false);
    }
  }, []);

  return { 
    resumes, 
    isLoadingResumes, 
    isApplying, 
    isParsing,
    loadResumes, 
    parseResume, 
    applyResume 
  };
}

