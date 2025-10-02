import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ResumeModel from "@/models/resume.model";
import Profile from "@/models/profile.model";
import { logAction, logError } from "./action-helpers";

// Helper function for session validation
export async function validateSession(): Promise<{ success: boolean; candidateId?: string; error?: string }> {
  logAction("🔐", "Validating session...");
  const session = await getServerSession(authOptions);
  const candidateId = session?.user._id;
  
  if (!candidateId) {
    logError("Session validation failed - no user ID");
    return {
      success: false,
      error: "User session not found"
    };
  }
  
  logAction("✅", "Session validated for user:", candidateId);
  return { success: true, candidateId };
}

// Helper function for authentication that can be used in any action
export async function requireAuth(): Promise<string> {
  const { success, candidateId, error } = await validateSession();
  if (!success || !candidateId) {
    throw new Error(error || "Unauthorized - Please log in");
  }
  return candidateId;
}

// Helper function for resume validation
export async function validateResume(resumeId: string, candidateId: string): Promise<{ success: boolean; resume?: any; error?: string }> {
  const resume = await ResumeModel.findOne({
    _id: resumeId,
    candidateId: candidateId,
    isActive: true
  });
  
  if (!resume) {
    return {
      success: false,
      error: "Resume not found or does not belong to this candidate"
    };
  }
  
  return { success: true, resume };
}

// Helper function for updating candidate profile with resume
export async function updateCandidateProfileWithResume(candidateId: string, resumeId: string): Promise<void> {
  let candidateProfile = await Profile.findOne({ candidate: candidateId });
  
  if (candidateProfile) {
    // Add resume to resumes array if not already present
    if (!candidateProfile.resumes.includes(resumeId as any)) {
      candidateProfile.resumes.push(resumeId as any);
    }
    // Set as active resume
    candidateProfile.activeResume = resumeId as any;
    await candidateProfile.save();
  } else {
    // Create new profile if it doesn't exist
    candidateProfile = new Profile({
      candidate: candidateId,
      name: "User", // Default name, should be updated by user later
      resumes: [resumeId],
      activeResume: resumeId,
    });
    await candidateProfile.save();
  }
}

// Helper function for resume versioning
export async function getNextVersionNumber(candidateId: string, originalFileName: string): Promise<{ version: number; existingResume?: any }> {
  const existingResume = await ResumeModel.findOne({
    candidateId: candidateId,
    originalFileName: originalFileName,
    isActive: true
  });

  let version = 1;
  if (existingResume) {
    // Deactivate previous version
    existingResume.isActive = false;
    await existingResume.save();
    
    // Get next version number
    const latestVersion = await ResumeModel.findOne({
      candidateId: candidateId,
      originalFileName: originalFileName
    }).sort({ version: -1 });
    
    version = (latestVersion?.version || 0) + 1;
  }
  
  return { version, existingResume };
}