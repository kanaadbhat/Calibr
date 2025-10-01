"use server";

import { connectToDatabase } from "@/utils/connectDb";
import ResumeModel, { Resume } from "@/models/resume.model";
import Profile from "@/models/profile.model";
import { validateSession, validateResume, updateCandidateProfileWithResume } from "../lib/validation";
import { S3Operations } from "./s3-operations";

// Get all resumes for a candidate from Resume model
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
    version: number;
  }>;
  message: string;
  error?: string;
}> {
  try {
    await connectToDatabase();
    
    const resumes = await ResumeModel.find({
      candidateId: candidateId,
      isActive: true
    })
    .sort({ uploadedAt: -1 }) // Newest first
    .select('fileName s3Url s3Key fileSize uploadedAt isParsed version');

    if (!resumes || resumes.length === 0) {
      return {
        success: true,
        resumes: [],
        message: "No resumes found for this candidate",
      };
    }

    const resumeList = resumes.map((resume: Resume) => ({
      id: (resume._id as string).toString(),
      url: resume.s3Url,
      fileName: resume.fileName,
      lastModified: resume.uploadedAt,
      size: resume.fileSize,
      key: resume.s3Key,
      isParsed: resume.isParsed,
      version: resume.version,
    }));

    return {
      success: true,
      resumes: resumeList,
      message: `Found ${resumeList.length} resume(s)`,
    };
  } catch (error) {
    console.error("Error fetching candidate resumes:", error);
    return {
      success: false,
      message: "Failed to fetch resumes",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Delete resume from S3 and database (including all versions)
export async function deleteResume(resumeId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    const { success, candidateId, error } = await validateSession();
    if (!success) {
      return { success: false, message: "Unauthorized", error };
    }
    await connectToDatabase();

    // Find the resume document to get the originalFileName
    const resume = await ResumeModel.findOne({
      _id: resumeId,
      candidateId: candidateId
    });

    if (!resume) {
      return {
        success: false,
        message: "Resume not found or does not belong to this candidate",
        error: "Invalid resume ID",
      };
    }

    console.log(`Deleting all versions of resume: ${resume.originalFileName}`);

    // Find ALL versions of this resume (same originalFileName)
    const allVersions = await ResumeModel.find({
      candidateId: candidateId,
      originalFileName: resume.originalFileName
    });

    if (allVersions.length === 0) {
      return {
        success: false,
        message: "No resume versions found",
        error: "Resume versions not found",
      };
    }

    console.log(`Found ${allVersions.length} versions to delete`);

    // Delete all versions from S3
    const s3Keys = allVersions.map(version => version.s3Key);
    await S3Operations.deleteMultipleObjects(s3Keys);
    console.log(`Successfully deleted ${allVersions.length} files from S3`);

    // Get all version IDs for database cleanup
    const allVersionIds = allVersions.map(version => version._id);

    // Delete ALL versions from database (hard delete)
    await ResumeModel.deleteMany({
      candidateId: candidateId,
      originalFileName: resume.originalFileName
    });

    console.log(`Successfully deleted ${allVersions.length} resume versions from database`);

    // Update candidate profile to remove all resume references and activeResume if needed
    const profile = await Profile.findOne({ candidate: candidateId });
    if (profile) {
      // Remove all version IDs from resumes array
      const updatedResumes = profile.resumes.filter(
        resumeRef => !allVersionIds.some(versionId => (versionId as any).equals(resumeRef))
      );

      // Check if activeResume is one of the deleted versions
      const needsActiveResumeUpdate = profile.activeResume && 
        allVersionIds.some(versionId => (versionId as any).equals(profile.activeResume!));

      // Update profile
      const updateData: any = { resumes: updatedResumes };
      if (needsActiveResumeUpdate) {
        // Set activeResume to the most recent remaining resume, or unset if none
        if (updatedResumes.length > 0) {
          const remainingResumes = await ResumeModel.find({
            _id: { $in: updatedResumes },
            candidateId: candidateId,
            isActive: true
          }).sort({ uploadedAt: -1 });
          
          updateData.activeResume = remainingResumes.length > 0 
            ? remainingResumes[0]._id 
            : null;
        } else {
          updateData.activeResume = null;
        }
      }

      await Profile.findOneAndUpdate(
        { candidate: candidateId },
        updateData
      );

      console.log("Updated candidate profile after resume deletion");
    }

    return {
      success: true,
      message: `Successfully deleted all versions (${allVersions.length}) of resume: ${resume.originalFileName}`,
    };
  } catch (error) {
    console.error("Error deleting resume:", error);
    return {
      success: false,
      message: "Failed to delete resume",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get resume profile data 
export async function getResumeProfile(resumeId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
  profileData?: any;
}> {
  try {
    const { success, candidateId, error } = await validateSession();
    if (!success) {
      return { success: false, message: "Unauthorized", error };
    }
    await connectToDatabase();

    const { success: resumeSuccess, resume, error: resumeError } = await validateResume(resumeId, candidateId!);
    if (!resumeSuccess) {
      return { success: false, message: "Resume not found", error: resumeError };
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

      return {
        success: true,
        message: "Resume not parsed yet (ready for manual input)",
        profileData: emptyData,
      };
    }

    return {
      success: true,
      message: "Resume profile retrieved successfully",
      profileData: resume.parsedData,
    };
  } catch (error) {
    console.error("Error getting resume profile:", error);
    return {
      success: false,
      message: "Failed to get resume profile",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update resume profile data (now using Resume model)
export async function updateResumeProfile(resumeId: string, profileData: any): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    const { success, candidateId, error } = await validateSession();
    if (!success) {
      return { success: false, message: "Unauthorized", error };
    }
    await connectToDatabase();

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
      return {
        success: false,
        message: "Resume not found",
        error: "Resume not found or does not belong to this candidate",
      };
    }

    return {
      success: true,
      message: "Resume profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating resume profile:", error);
    return {
      success: false,
      message: "Failed to update resume profile",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Apply resume profile to main profile (now using Resume model)
export async function applyResumeToProfile(resumeId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    const { success, candidateId, error } = await validateSession();
    if (!success) {
      return { success: false, message: "Unauthorized", error };
    }
    await connectToDatabase();

    const { success: resumeSuccess, resume, error: resumeError } = await validateResume(resumeId, candidateId!);
    if (!resumeSuccess) {
      return { success: false, message: "Resume not found", error: resumeError };
    }

    if (!resume.isParsed || !resume.parsedData) {
      return {
        success: false,
        message: "Resume has not been parsed yet",
        error: "No parsed data available to apply",
      };
    }

    // Use the helper function to update profile
    await updateCandidateProfileWithResume(candidateId!, resumeId);

    return {
      success: true,
      message: "Resume profile applied successfully",
    };
  } catch (error) {
    console.error("Error applying resume profile:", error);
    return {
      success: false,
      message: "Failed to apply resume profile",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get parsed data for a specific resume
export async function getResumeParsedData(resumeId: string): Promise<{
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}> {
  try {
    await connectToDatabase();
    
    const resume = await ResumeModel.findById(resumeId).select('parsedData isParsed parseError fileName');
    
    if (!resume) {
      return {
        success: false,
        message: "Resume not found",
        error: "Resume document does not exist",
      };
    }

    if (!resume.isParsed) {
      return {
        success: false,
        message: "Resume has not been parsed yet",
        error: resume.parseError || "Parsing failed",
      };
    }

    return {
      success: true,
      data: resume.parsedData,
      message: "Resume data retrieved successfully",
    };
  } catch (error) {
    console.error("Error fetching resume parsed data:", error);
    return {
      success: false,
      message: "Failed to fetch resume data",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Update parsed data for a resume
export async function updateResumeParsedData(resumeId: string, parsedData: any): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    await connectToDatabase();
    
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
      return {
        success: false,
        message: "Resume not found",
        error: "Resume document does not exist",
      };
    }

    return {
      success: true,
      message: "Resume data updated successfully",
    };
  } catch (error) {
    console.error("Error updating resume parsed data:", error);
    return {
      success: false,
      message: "Failed to update resume data",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Get active resume for a candidate
export async function getActiveResume(candidateId: string): Promise<{
  success: boolean;
  resume?: any;
  message: string;
  error?: string;
}> {
  try {
    await connectToDatabase();
    
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
  } catch (error) {
    console.error("Error fetching active resume:", error);
    return {
      success: false,
      message: "Failed to fetch active resume",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Set active resume for a candidate
export async function setActiveResume(candidateId: string, resumeId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    await connectToDatabase();
    
    const { success: resumeSuccess, error: resumeError } = await validateResume(resumeId, candidateId);
    if (!resumeSuccess) {
      return { success: false, message: "Resume not found or does not belong to this candidate", error: resumeError };
    }

    // Update the profile to set the active resume
    await Profile.findOneAndUpdate(
      { candidate: candidateId },
      { activeResume: resumeId },
      { upsert: true }
    );

    return {
      success: true,
      message: "Active resume updated successfully",
    };
  } catch (error) {
    console.error("Error setting active resume:", error);
    return {
      success: false,
      message: "Failed to set active resume",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}