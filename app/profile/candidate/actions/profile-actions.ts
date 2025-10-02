"use server";

import Profile from "@/models/profile.model";
import ResumeModel from "@/models/resume.model";
import candidate from "@/models/candidate.model";
import { ProfileData, ProfileResponse } from "../type";
import { validateSession } from "../lib/validation";
import { 
  withDatabase, 
  createErrorResponse, 
  createSuccessResponse, 
  safeAction,
  formatMongooseError
} from "@/utils/action-helpers";

export async function updateCandidateProfile(
  profileData: ProfileData
): Promise<{ success: boolean; message: string; error?: string }> {
  return safeAction(async () => {
    return withDatabase(async () => {
      const { success, candidateId, error } = await validateSession();
      if (!success) {
        return createErrorResponse("Unauthorized", error);
      }
      // Get or create profile with candidate name
      const candidateDoc = await candidate
        .findById(candidateId)
        .select("firstName lastName");

      const candidateName = candidateDoc 
        ? `${candidateDoc.firstName} ${candidateDoc.lastName}`
        : profileData.name;

      let profile = await Profile.findOne({ candidate: candidateId });
      if (!profile) {
        // Create basic profile if it doesn't exist
        profile = await Profile.create({
          candidate: candidateId,
          name: candidateName,
          profileImage: profileData.profileImage,
          resumes: [],
        });
        console.log("Created new profile:", profile._id);
      }

      // Update profile image if provided
      if (profileData.profileImage !== undefined) {
        await Profile.findOneAndUpdate(
          { candidate: candidateId },
          { $set: { profileImage: profileData.profileImage } },
          { new: true }
        );
      }

      // Update active resume's parsed data if there's an active resume
      if (profile.activeResume) {
        const updateData = {
          "parsedData.tagline": profileData.tagline || "",
          "parsedData.summary": profileData.summary || "",
          "parsedData.workDetails": Array.isArray(profileData.workDetails) 
            ? profileData.workDetails 
            : [],
          "parsedData.education": profileData.education || [],
          "parsedData.skills": profileData.skills || "",
          "parsedData.projects": profileData.projects || [],
          "parsedData.certificates": profileData.certificates || [],
          "parsedData.socialLinks": profileData.socialLinks || { linkedin: "", github: "" },
          lastUpdated: new Date(),
        };

        await ResumeModel.findByIdAndUpdate(
          profile.activeResume,
          { $set: updateData },
          { new: true }
        );

        return createSuccessResponse("Profile updated successfully");
      } else {
        // If no active resume exists, create a default one
        const defaultResume = new ResumeModel({
          candidateId,
          fileName: "manual-profile",
          originalFileName: "Manual Profile Entry",
          s3Url: "", // No file uploaded
          s3Key: "",
          fileSize: 0,
          mimeType: "application/json",
          parsedData: {
            tagline: profileData.tagline || "",
            summary: profileData.summary || "",
            workDetails: Array.isArray(profileData.workDetails) 
              ? profileData.workDetails 
              : [],
            education: profileData.education || [],
            skills: profileData.skills || "",
            projects: profileData.projects || [],
            certificates: profileData.certificates || [],
            socialLinks: profileData.socialLinks || { linkedin: "", github: "" },
          },
          isParsed: true,
          version: 1,
          isActive: true,
        });

        await defaultResume.save();

        // Update profile to reference this resume
        await Profile.findOneAndUpdate(
          { candidate: candidateId },
          {
            $addToSet: { resumes: defaultResume._id },
            activeResume: defaultResume._id,
          },
          { new: true }
        );

        return createSuccessResponse("Profile created successfully");
      }
    });
  }, "Failed to update profile");
}

export async function fetchCandidateProfile(
  candidateId: string
): Promise<ProfileResponse> {
  try {
    if (!candidateId) {
      return {
        success: false,
        message: "Invalid candidate ID",
        data: null,
        completionPercentage: 0,
        error: "Candidate ID is required",
      };
    }

    return await withDatabase(async () => {
      const candidateInfo = await candidate
        .findById(candidateId)
        .select("firstName lastName");

      if (!candidateInfo) {
        return {
          success: false,
          message: "Candidate not found",
          data: null,
          completionPercentage: 0,
          error: "Unable to find candidate with the provided ID",
        };
      }

      const name = `${candidateInfo.firstName} ${candidateInfo.lastName}`;
      const profile = await Profile.findOne({ candidate: candidateId }).lean();

      // Fetch resume data from Resume collection
      const resumes = await ResumeModel.find({
        candidateId: candidateId,
        isActive: true
      })
      .select('fileName s3Url fileSize mimeType uploadedAt')
      .sort({ uploadedAt: -1 });

      // Fetch active resume data for profile content
      let activeResumeData = null;
      if (profile?.activeResume) {
        activeResumeData = await ResumeModel.findById(profile.activeResume)
          .select('parsedData isParsed')
          .lean();
      }

      // Use active resume data if available, otherwise use defaults
      const parsedData = activeResumeData?.parsedData || {};

      const data: any = {
        name,
        tagline: parsedData.tagline || "",
        summary: parsedData.summary || "",
        workDetails: Array.isArray(parsedData.workDetails)
          ? parsedData.workDetails.map((work: any) => ({
              company: work.company || "",
              position: work.position || "",
              duration: work.duration || "",
              location: work.location || "",
              description: work.description || "",
              responsibilities: work.responsibilities || [],
            }))
          : [],
        profileImage: profile?.profileImage || "",
        education: parsedData.education?.map((edu: any) => ({
          year: edu.year || "",
          degree: edu.degree || "",
          institution: edu.institution || "",
        })) || [],
        skills: parsedData.skills || "",
        projects: parsedData.projects?.map((project: any) => ({
          name: project.name || "",
          description: project.description || "",
          link: project.link || "",
        })) || [],
        certificates: parsedData.certificates?.map((cert: any) => ({
          name: cert.name || "",
          issuer: cert.issuer || "",
          link: cert.link || "",
        })) || [],
        socialLinks: {
          linkedin: parsedData.socialLinks?.linkedin || "",
          github: parsedData.socialLinks?.github || "",
        },
        resume: resumes.map((resume: any) => ({
          id: (resume._id as string).toString(),
          url: resume.s3Url,
          fileName: resume.fileName,
          fileSize: resume.fileSize,
          mimeType: resume.mimeType,
        })),
      };

      return {
        success: true,
        message: profile
          ? "Profile fetched successfully"
          : "No profile found, returning defaults",
        data,
        completionPercentage: calculateCompletion(data),
      };
    }, "Error fetching profile");
  } catch (err) {
    console.error("Error fetching profile:", err);
    const error = formatMongooseError(err, "Error fetching profile");
    
    return {
      success: false,
      message: "Error fetching profile",
      data: null,
      completionPercentage: 0,
      error: error.message,
    };
  }
}

function calculateCompletion(data: any): number {
  const fields = [
    data.name,
    data.tagline,
    data.summary,
    data.workDetails,
    data.profileImage,
    data.education?.length,
    data.skills,
    data.projects?.length,
    data.certificates?.length,
    data.socialLinks?.linkedin,
    data.socialLinks?.github,
  ];
  return Math.round((fields.filter(Boolean).length / 11) * 100);
}