"use server";

import ResumeModel, { Resume } from "@/models/resume.model";
import Profile from "@/models/candidateProfile.model";
import { validateSession, validateResume, updateCandidateProfileWithResume } from "../lib/validation";
import { 
  withDatabase, 
  createErrorResponse, 
  createSuccessResponse, 
  safeAction,
  logAction,
  logSuccess
} from "@/utils/action-helpers";

// Get all resumes for a candidate from Resume model (only those in profile.resumes array)
export async function getCandidateResumes(candidateId: string): Promise<{
  success: boolean;
  resumes?: Array<{
    id: string;
    url: string;
    fileName: string;
    lastModified: Date;
    size: number;
    key: string;
    isParsed: boolean;
  }>;
  message: string;
  error?: string;
}> {
  return safeAction(async () => {
    return await withDatabase(async () => {
      // Get candidate profile to find which resumes are "active" for this candidate
      const profile = await Profile.findOne({ candidate: candidateId });
      
      if (!profile || !profile.resumes || profile.resumes.length === 0) {
        return createSuccessResponse("No resumes found for this candidate", { resumes: [] });
      }

      // Only fetch resumes that are in the profile's resumes array
      const resumes = await ResumeModel.find({
        _id: { $in: profile.resumes },
        candidateId: candidateId
      })
      .sort({ uploadedAt: -1 }) // Newest first
      .select('fileName s3Url s3Key fileSize uploadedAt isParsed');

      if (!resumes || resumes.length === 0) {
        return createSuccessResponse("No resumes found for this candidate", { resumes: [] });
      }

      const resumeList = resumes.map((resume: Resume) => ({
        id: (resume._id as string).toString(),
        url: resume.s3Url,
        fileName: resume.fileName,
        lastModified: resume.uploadedAt,
        size: resume.fileSize,
        key: resume.s3Key,
        isParsed: resume.isParsed,
      }));

      return {
        success: true,
        resumes: resumeList,
        message: `Found ${resumeList.length} resume(s)`,
      };
    }, "Error fetching resumes");
  }, "Failed to fetch resumes");
}

// Soft delete resume - only remove from candidate profile (keep in S3 and Resume collection for applications)
export async function deleteResume(resumeId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  return safeAction(async () => {
    const { success, candidateId, error } = await validateSession();
    if (!success) {
      return createErrorResponse("Unauthorized", error);
    }
    
    return await withDatabase(async () => {

    // Find the resume document
      const resume = await ResumeModel.findOne({
        _id: resumeId,
        candidateId: candidateId
      });

      if (!resume) {
        return createErrorResponse(
          "Resume not found or does not belong to this candidate",
          "Invalid resume ID"
        );
      }

      logAction("🗑️", `Soft deleting resume: ${resume.fileName} (removing from profile only)`);

      // Update candidate profile to remove resume reference
      const profile = await Profile.findOne({ candidate: candidateId });
    if (profile) {
      // Remove resume ID from resumes array
      const updatedResumes = profile.resumes.filter(
        resumeRef => !(resumeRef as any).equals(resumeId)
      );

      // Check if this was the active resume
      const needsActiveResumeUpdate = profile.activeResume && 
        (profile.activeResume as any).equals(resumeId);

      // Update profile
      const updateData: any = { resumes: updatedResumes };
      if (needsActiveResumeUpdate) {
        // Set the most recent remaining resume as active, or null if no resumes left
        updateData.activeResume = updatedResumes.length > 0 ? updatedResumes[0] : null;
        logAction("🔄", "Active resume updated after deletion");
      }

        await Profile.findOneAndUpdate(
          { candidate: candidateId },
          updateData
        );

        logSuccess("Resume removed from candidate profile");
      }

      return createSuccessResponse(
        `Resume "${resume.fileName}" has been removed from your profile. Note: This resume will still be visible to employers for jobs you've already applied to.`
      );
    }, "Error deleting resume");
  }, "Failed to delete resume");
}

// Get resume profile data 
export async function getResumeProfile(resumeId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
  profileData?: any;
}> {
  return safeAction(async () => {
    const { success, candidateId, error } = await validateSession();
    if (!success) {
      return createErrorResponse("Unauthorized", error);
    }
    
    return await withDatabase(async () => {
      const { success: resumeSuccess, resume, error: resumeError } = await validateResume(resumeId, candidateId!);
      if (!resumeSuccess) {
        return createErrorResponse("Resume not found", resumeError);
      }

      // If resume hasn't been parsed, return empty data structure
      if (!resume.isParsed || !resume.parsedData) {
        const emptyData = {
          tagline: "",
          summary: "",
          workDetails: "",
          education: [],
          skills: "",
          projects: [],
          certificates: [],
          socialLinks: { linkedin: "", github: "" },
        };

        return createSuccessResponse(
          "Resume not parsed yet (ready for manual input)",
          { profileData: emptyData }
        );
      }

      return createSuccessResponse(
        "Resume profile retrieved successfully",
        { profileData: resume.parsedData }
      );
    }, "Error getting resume profile");
  }, "Failed to get resume profile");
}

// Update resume profile data (now using Resume model)
export async function updateResumeProfile(resumeId: string, profileData: any): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  return safeAction(async () => {
    const { success, candidateId, error } = await validateSession();
    if (!success) {
      return createErrorResponse("Unauthorized", error);
    }
    
    return await withDatabase(async () => {
      const resume = await ResumeModel.findOneAndUpdate(
        {
          _id: resumeId,
          candidateId: candidateId,
          isActive: true
        },
        {
          parsedData: profileData,
          isParsed: true,
          parseError: null,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!resume) {
        return createErrorResponse(
          "Resume not found",
          "Resume not found or does not belong to this candidate"
        );
      }

      return createSuccessResponse("Resume profile updated successfully");
    }, "Error updating resume profile");
  }, "Failed to update resume profile");
}

// Apply resume profile to main profile (now using Resume model)
export async function applyResumeToProfile(resumeId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  return safeAction(async () => {
    const { success, candidateId, error } = await validateSession();
    if (!success) {
      return createErrorResponse("Unauthorized", error);
    }
    
    return await withDatabase(async () => {
      const { success: resumeSuccess, resume, error: resumeError } = await validateResume(resumeId, candidateId!);
      if (!resumeSuccess) {
        return createErrorResponse("Resume not found", resumeError);
      }

      if (!resume.isParsed || !resume.parsedData) {
        return createErrorResponse(
          "Resume has not been parsed yet",
          "No parsed data available to apply"
        );
      }

      // Use the helper function to update profile
      await updateCandidateProfileWithResume(candidateId!, resumeId);

      return createSuccessResponse("Resume profile applied successfully");
    }, "Error applying resume profile");
  }, "Failed to apply resume profile");
}

// Get parsed data for a specific resume
export async function getResumeParsedData(resumeId: string): Promise<{
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}> {
  return safeAction(async () => {
    return await withDatabase(async () => {
      const resume = await ResumeModel.findById(resumeId).select('parsedData isParsed parseError fileName');
      
      if (!resume) {
        return createErrorResponse(
          "Resume not found",
          "Resume document does not exist"
        );
      }

      if (!resume.isParsed) {
        return createErrorResponse(
          "Resume has not been parsed yet",
          resume.parseError || "Parsing failed"
        );
      }

      return createSuccessResponse(
        "Resume data retrieved successfully",
        resume.parsedData
      );
    }, "Error fetching resume parsed data");
  }, "Failed to fetch resume data");
}

// Update parsed data for a resume
export async function updateResumeParsedData(resumeId: string, parsedData: any): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  return safeAction(async () => {
    return await withDatabase(async () => {
      const result = await ResumeModel.findByIdAndUpdate(
        resumeId,
        {
          parsedData,
          isParsed: true,
          parseError: null,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!result) {
        return createErrorResponse(
          "Resume not found",
          "Resume document does not exist"
        );
      }

      return createSuccessResponse("Resume data updated successfully");
    }, "Error updating resume parsed data");
  }, "Failed to update resume data");
}

// Get active resume for a candidate
export async function getActiveResume(candidateId: string): Promise<{
  success: boolean;
  resume?: any;
  message: string;
  error?: string;
}> {
  return safeAction(async () => {
    return await withDatabase(async () => {
      // First check if profile has an active resume set
      const profile = await Profile.findOne({ candidate: candidateId }).populate('activeResume');
      
      if (profile?.activeResume) {
        return {
          success: true,
          resume: profile.activeResume,
          message: "Active resume found",
        };
      }

      // If no active resume set, get the most recent one
      const latestResume = await ResumeModel.findOne({
        candidateId: candidateId,
        isActive: true
      }).sort({ uploadedAt: -1 });

      if (latestResume) {
        // Set this as the active resume
        await Profile.findOneAndUpdate(
          { candidate: candidateId },
          { activeResume: latestResume._id },
          { upsert: true }
        );

        return {
          success: true,
          resume: latestResume,
          message: "Latest resume set as active",
        };
      }

      return {
        success: false,
        message: "No resumes found for this candidate",
      };
    }, "Error fetching active resume");
  }, "Failed to fetch active resume");
}

// Set active resume for a candidate
export async function setActiveResume(candidateId: string, resumeId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  return safeAction(async () => {
    return await withDatabase(async () => {
      const { success: resumeSuccess, error: resumeError } = await validateResume(resumeId, candidateId);
      if (!resumeSuccess) {
        return createErrorResponse(
          "Resume not found or does not belong to this candidate",
          resumeError
        );
      }

      // Update the profile to set the active resume
      await Profile.findOneAndUpdate(
        { candidate: candidateId },
        { activeResume: resumeId },
        { upsert: true }
      );

      return createSuccessResponse("Active resume updated successfully");
    }, "Error setting active resume");
  }, "Failed to set active resume");
}