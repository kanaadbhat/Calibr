"use server";

import { connectToDatabase } from "@/utils/connectDb";
import Profile from "@/models/profile.model";
import ResumeModel, { Resume } from "@/models/resume.model";
import candidate from "@/models/candidate.model";
import { ProfileData, ProfileResponse } from "./type";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import axios from "axios";
import { extractJsonFromResponse } from "@/ai-engine/ai-call/aiCall";
import { resumePrompt } from "@/ai-engine/prompts/prompt";
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const apiKey = process.env.NEXT_GEMINI_API;
const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export default async function updateCandidateProfile(
  profileData: ProfileData
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    const candidateId = session?.user._id;

    if (!candidateId) {
      return {
        success: false,
        message: "Unauthorized",
        error: "User session not found",
      };
    }

    await connectToDatabase();

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
        "parsedData.workDetails": profileData.workDetails || "",
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

      return { success: true, message: "Profile updated successfully" };
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
          workDetails: profileData.workDetails || "",
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

      return { success: true, message: "Profile created successfully" };
    }
  } catch (err) {
    console.error("Error updating profile:", err);
    let errorMessage = "Error updating profile";

    if (err instanceof mongoose.Error.ValidationError) {
      errorMessage = "Invalid profile data provided";
    } else if (err instanceof mongoose.Error.CastError) {
      errorMessage = "Invalid ID format";
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    return {
      success: false,
      message: "Error updating profile",
      error: errorMessage,
    };
  }
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

    await connectToDatabase();

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
      workDetails: parsedData.workDetails || "",
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
      resume: resumes.map((resume: Resume) => ({
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
  } catch (err) {
    console.error("Error fetching profile:", err);
    let errorMessage = "Error fetching profile";

    if (err instanceof mongoose.Error.CastError) {
      errorMessage = "Invalid candidate ID format";
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    return {
      success: false,
      message: "Error fetching profile",
      data: null,
      completionPercentage: 0,
      error: errorMessage,
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

// Helper function to extract text from different file types
async function extractTextFromFile(file: File): Promise<{ text: string; useDirectUpload: boolean }> {
  let resumeText = "";
  let useDirectGeminiUpload = false;

  console.log("Processing file:", file.name, "Type:", file.type, "Size:", file.size);

  if (file.type === "application/pdf") {
    console.log("PDF detected - will send directly to Gemini");
    useDirectGeminiUpload = true;
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "application/msword" ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    try {
      const mammoth = require("mammoth");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value;
      console.log("Word document parsed successfully, text length:", resumeText.length);
    } catch (wordError) {
      console.error("Word document parsing failed, will try Gemini direct upload:", wordError);
      useDirectGeminiUpload = true;
    }
  } else if (
    file.type === "text/plain" ||
    file.type === "text/rtf" ||
    file.name.toLowerCase().endsWith(".txt") ||
    file.name.toLowerCase().endsWith(".rtf")
  ) {
    try {
      resumeText = await file.text();
      console.log("Text file parsed successfully, text length:", resumeText.length);
    } catch (textError) {
      console.error("Text file parsing failed:", textError);
      throw new Error(
        textError instanceof Error ? textError.message : "Unknown text parsing error"
      );
    }
  } else {
    console.log("Unknown file type, will try Gemini direct upload");
    useDirectGeminiUpload = true;
  }

  return { text: resumeText, useDirectUpload: useDirectGeminiUpload };
}

// Helper function to prepare Gemini API payload
async function prepareGeminiPayload(file: File, resumeText: string, useDirectUpload: boolean): Promise<any> {
  if (useDirectUpload) {
    console.log("Sending file directly to Gemini...");
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString("base64");

    return {
      contents: [
        {
          parts: [
            {
              text: resumePrompt + "\n\nPlease extract and analyze the information from this resume file:",
            },
            {
              inline_data: {
                mime_type: file.type,
                data: base64Data,
              },
            },
          ],
        },
      ],
    };
  } else {
    console.log("Sending extracted text to Gemini...");

    if (!resumeText || resumeText.trim().length < 30) {
      throw new Error("Could not extract meaningful text from the file. Please try a different file format.");
    }

    // Clean up the text
    let cleanedText = resumeText
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    // Truncate if too long
    const MAX_CHARS = 35000;
    if (cleanedText.length > MAX_CHARS) {
      cleanedText = cleanedText.slice(0, MAX_CHARS) + "\n\n[TRUNCATED]";
    }

    console.log("Text preview:", cleanedText.substring(0, 300) + "...");

    return {
      contents: [
        {
          parts: [
            {
              text: resumePrompt + "\n\n" + cleanedText,
            },
          ],
        },
      ],
    };
  }
}

// Helper function to call Gemini API
async function callGeminiAPI(payload: any): Promise<any> {
  console.log("Calling Gemini API...");
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    }
  );
  return response.data;
}

// Helper function to parse Gemini response
function parseGeminiResponse(data: any): any {
  try {
    const rawResponse = data.candidates[0].content.parts[0].text;
    console.log("Gemini response received, length:", rawResponse.length);

    const cleanedText = extractJsonFromResponse(rawResponse);
    const parsedData = JSON.parse(cleanedText);
    console.log(parsedData);
    console.log("Successfully parsed Gemini response");
    return parsedData;
  } catch (err) {
    console.error("Failed to parse Gemini JSON:", err);
    console.error("Raw response:", data.candidates[0].content.parts[0].text);
    throw new Error("Failed to parse AI response. The AI might not have returned valid JSON.");
  }
}

// Parse and save resume after S3 upload (separated from upload logic)
export async function parseAndSaveResume(s3Url: string, fileName: string, fileSize: number, s3Key: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
  resumeId?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const candidateId = session?.user._id;
    if (!candidateId) {
      return {
        success: false,
        message: "Unauthorized",
        error: "User session not found",
      };
    }
    
    await connectToDatabase();

    // Step 1: Parse with AI (create a temporary File object for parsing)
    let parsedData = null;
    let isParsed = false;
    let parseError = null;
    let resumeId = ''; // Initialize resumeId here
    
    try {
      console.log("Starting resume parsing from S3...");
      
      // Check if resume with same originalFileName exists for versioning
      const existingResume = await ResumeModel.findOne({
        candidateId: candidateId,
        originalFileName: fileName,
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
          originalFileName: fileName
        }).sort({ version: -1 });
        
        version = (latestVersion?.version || 0) + 1;
        console.log(`Creating new version ${version} for resume: ${fileName}`);
      }
      
      // Create resume record with originalFileName and version
      const resumeDoc = new ResumeModel({
        candidateId: candidateId,
        fileName: fileName,
        originalFileName: fileName, // Add the required field
        s3Url: s3Url,
        s3Key: s3Key,
        fileSize: fileSize,
        mimeType: getMimeTypeFromFileName(fileName),
        uploadedAt: new Date(),
        isParsed: false,
        isActive: true,
        version: version,
      });

      const savedResume = await resumeDoc.save();
      console.log("Resume document created, attempting to parse...");

      // Capture resumeId for profile update later
      resumeId = (savedResume._id as any).toString();

      // Now parse it using the existing parseResumeFromS3 function
      const parseResult = await parseResumeFromS3(resumeId);
      
      if (parseResult.success) {
        isParsed = true;
        console.log("Resume parsed successfully");
      } else {
        parseError = parseResult.error;
        console.log("Resume parsing failed:", parseError);
      }

    } catch (error: any) {
      console.error("Error during parsing:", error);
      parseError = error.message;
    }

    // Step 2: If we don't have a saved resume yet, create one (fallback)
    if (!resumeId && !parsedData && !isParsed) {
      try {
        // Check for existing resume for versioning (same logic as above)
        const existingResume = await ResumeModel.findOne({
          candidateId: candidateId,
          originalFileName: fileName,
          isActive: true
        });

        let version = 1;
        if (existingResume) {
          existingResume.isActive = false;
          await existingResume.save();
          
          const latestVersion = await ResumeModel.findOne({
            candidateId: candidateId,
            originalFileName: fileName
          }).sort({ version: -1 });
          
          version = (latestVersion?.version || 0) + 1;
        }
        
        const resumeDoc = new ResumeModel({
          candidateId: candidateId,
          fileName: fileName,
          originalFileName: fileName, // Add the required field
          s3Url: s3Url,
          s3Key: s3Key,
          fileSize: fileSize,
          mimeType: getMimeTypeFromFileName(fileName),
          uploadedAt: new Date(),
          isParsed: false,
          isActive: true,
          version: version,
        });

        const savedResume = await resumeDoc.save();
        resumeId = (savedResume._id as any).toString();
        console.log("Resume saved to database with ID:", resumeId);
      } catch (dbError) {
        console.error("Database save error:", dbError);
        return {
          success: false,
          message: "Failed to save resume",
          error: dbError instanceof Error ? dbError.message : "Database error",
        };
      }
    }

    // Step 3: Update candidate profile with new resume
    if (resumeId) {
      try {
        console.log("Updating candidate profile with new resume...");
        
        // Find or create candidate profile
        let candidateProfile = await Profile.findOne({ candidate: candidateId });
        
        if (candidateProfile) {
          // Add resume to resumes array if not already present
          if (!candidateProfile.resumes.includes(resumeId as any)) {
            candidateProfile.resumes.push(resumeId as any);
          }
          // Set as active resume
          candidateProfile.activeResume = resumeId as any;
          await candidateProfile.save();
          console.log("Updated existing candidate profile with new resume");
        } else {
          // Create new profile if it doesn't exist
          candidateProfile = new Profile({
            candidate: candidateId,
            name: "User", // Default name, should be updated by user later
            resumes: [resumeId],
            activeResume: resumeId,
          });
          await candidateProfile.save();
          console.log("Created new candidate profile with resume");
        }
      } catch (profileError) {
        console.error("Error updating candidate profile:", profileError);
        // Don't fail the entire operation if profile update fails
      }
    }

    // Step 4: Return result
    const successMessage = isParsed 
      ? "Resume uploaded and parsed successfully" 
      : parseError 
        ? `Resume uploaded successfully, but parsing failed: ${parseError}. You can try parsing it again later.`
        : "Resume uploaded successfully";

    return {
      success: true,
      message: successMessage,
      resumeId: resumeId,
    };

  } catch (error: any) {
    console.error("Error in parseAndSaveResume:", error);
    return {
      success: false,
      message: "Error processing resume",
      error: error.message || "Unknown error occurred",
    };
  }
}

// Helper function to determine MIME type from filename
function getMimeTypeFromFileName(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop();
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt':
      return 'text/plain';
    case 'rtf':
      return 'text/rtf';
    default:
      return 'application/octet-stream';
  }
}
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
    const session = await getServerSession(authOptions);
    const candidateId = session?.user._id;
    if (!candidateId) {
      return {
        success: false,
        message: "Unauthorized",
        error: "User session not found",
      };
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
    const s3DeletePromises = allVersions.map(async (version) => {
      console.log(`Deleting from S3: ${version.s3Key}`);
      const deleteCommand = new DeleteObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: version.s3Key,
      });
      return s3Client.send(deleteCommand);
    });

    await Promise.all(s3DeletePromises);
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
    const session = await getServerSession(authOptions);
    const candidateId = session?.user._id;
    if (!candidateId) {
      return {
        success: false,
        message: "Unauthorized",
        error: "User session not found",
      };
    }
    await connectToDatabase();

    const resume = await ResumeModel.findOne({
      _id: resumeId,
      candidateId: candidateId,
      isActive: true
    });

    if (!resume) {
      return {
        success: false,
        message: "Resume not found",
        error: "Resume not found or does not belong to this candidate",
      };
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
    const session = await getServerSession(authOptions);
    const candidateId = session?.user._id;
    if (!candidateId) {
      return {
        success: false,
        message: "Unauthorized",
        error: "User session not found",
      };
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
    const session = await getServerSession(authOptions);
    const candidateId = session?.user._id;
    if (!candidateId) {
      return {
        success: false,
        message: "Unauthorized",
        error: "User session not found",
      };
    }
    await connectToDatabase();

    const resume = await ResumeModel.findOne({
      _id: resumeId,
      candidateId: candidateId,
      isActive: true
    });

    if (!resume) {
      return {
        success: false,
        message: "Resume not found",
        error: "Resume not found or does not belong to this candidate",
      };
    }

    if (!resume.isParsed || !resume.parsedData) {
      return {
        success: false,
        message: "Resume has not been parsed yet",
        error: "No parsed data available to apply",
      };
    }

    // Set this resume as the active resume (data will be fetched from Resume model)
    await Profile.findOneAndUpdate(
      { candidate: candidateId },
      {
        $set: {
          activeResume: resumeId,
        },
        $addToSet: { resumes: resumeId },
      },
      { upsert: true }
    );

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
    
    // Verify the resume exists and belongs to the candidate
    const resume = await ResumeModel.findOne({
      _id: resumeId,
      candidateId: candidateId,
      isActive: true
    });

    if (!resume) {
      return {
        success: false,
        message: "Resume not found or does not belong to this candidate",
        error: "Invalid resume ID",
      };
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

// Parse resume from S3 file (for unparsed resumes)
export async function parseResumeFromS3(resumeId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const candidateId = session?.user._id;
    if (!candidateId) {
      return {
        success: false,
        message: "Unauthorized",
        error: "User session not found",
      };
    }

    await connectToDatabase();

    // Find the resume
    const resume = await ResumeModel.findOne({
      _id: resumeId,
      candidateId: candidateId,
      isActive: true
    });

    if (!resume) {
      return {
        success: false,
        message: "Resume not found",
        error: "Unable to find resume with the provided ID",
      };
    }

    // If already parsed, no need to parse again
    if (resume.isParsed) {
      return {
        success: true,
        message: "Resume is already parsed",
      };
    }

    // Download file from S3
    const getCommand = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: resume.s3Key,
    });

    let s3Response;
    try {
      s3Response = await s3Client.send(getCommand);
    } catch (s3Error: any) {
      console.error("Failed to download file from S3:", s3Error);
      
      // Provide specific S3 error messages
      if (s3Error.name === 'NoSuchKey' || s3Error.$metadata?.httpStatusCode === 404) {
        return {
          success: false,
          message: "Resume file not found in storage",
          error: `File '${resume.fileName}' was not found in S3 storage. It may have been moved or deleted.`,
        };
      } else if (s3Error.name === 'AccessDenied' || s3Error.$metadata?.httpStatusCode === 403) {
        return {
          success: false,
          message: "Access denied to resume file",
          error: "Insufficient permissions to access the resume file in storage.",
        };
      } else if (s3Error.$metadata?.httpStatusCode === 500) {
        return {
          success: false,
          message: "Storage service error",
          error: "S3 storage service is currently unavailable. Please try again later.",
        };
      } else {
        return {
          success: false,
          message: "Failed to download resume from storage",
          error: `S3 Error: ${s3Error.message || 'Unknown storage error'}`,
        };
      }
    }

    // Convert S3 response to File-like object
    if (!s3Response.Body) {
      return {
        success: false,
        message: "Empty file received from storage",
        error: "No file content",
      };
    }

    // Get file buffer
    const chunks: Uint8Array[] = [];
    const reader = s3Response.Body.transformToWebStream().getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Create a File object from buffer
    const file = new File([buffer], resume.fileName, { type: resume.mimeType });

    // Parse with AI
    let parsedData = null;
    let isParsed = false;
    
    try {
      console.log("Starting resume parsing from S3...");
      const { text: resumeText, useDirectUpload } = await extractTextFromFile(file);
      const payload = await prepareGeminiPayload(file, resumeText, useDirectUpload);
      const geminiResponse = await callGeminiAPI(payload);
      parsedData = parseGeminiResponse(geminiResponse);
      isParsed = true;
      console.log("Resume parsed successfully from S3");
    } catch (error: any) {
      console.error("Resume parsing failed:", error);
      
      // Provide specific Gemini API error messages
      if (error.response?.status === 503) {
        return {
          success: false,
          message: "AI service temporarily unavailable",
          error: "Gemini AI service is currently overloaded (503). Please try again in a few minutes.",
        };
      } else if (error.response?.status === 429) {
        return {
          success: false,
          message: "AI service rate limit exceeded",
          error: "Too many requests to Gemini AI. Please wait a moment before trying again.",
        };
      } else if (error.response?.status === 400) {
        return {
          success: false,
          message: "Invalid resume format for AI parsing",
          error: "The resume file format is not supported or the content is invalid for AI parsing.",
        };
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        return {
          success: false,
          message: "AI service authentication error",
          error: "Invalid API key or insufficient permissions for Gemini AI service.",
        };
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return {
          success: false,
          message: "AI parsing timeout",
          error: "Resume parsing took too long and timed out. Please try with a smaller file.",
        };
      } else if (error.message?.includes('Failed to parse AI response')) {
        return {
          success: false,
          message: "AI response parsing failed",
          error: "Gemini AI returned an invalid response format. The resume content might be too complex.",
        };
      } else if (error.message?.includes('Could not extract meaningful text')) {
        return {
          success: false,
          message: "Unable to extract text from resume",
          error: "The resume file format is not readable. Please try uploading a PDF, DOCX, or TXT file.",
        };
      } else {
        const parseError = error instanceof Error ? error.message : "Unknown parsing error";
        return {
          success: false,
          message: "Resume parsing failed",
          error: `AI Parsing Error: ${parseError}`,
        };
      }
    }

    // Update resume with parsed data (or error state)
    try {
      const updateData: any = {
        isParsed: isParsed,
        updatedAt: new Date(),
      };

      if (isParsed && parsedData) {
        updateData.parsedData = parsedData;
        updateData.parseError = null;
      } else {
        updateData.parseError = "Parsing failed during S3 retry";
      }

      await ResumeModel.findByIdAndUpdate(resumeId, updateData);
    } catch (dbError: any) {
      console.error("Failed to update resume in database:", dbError);
      return {
        success: false,
        message: "Failed to save parsed data",
        error: `Database Error: ${dbError.message || 'Failed to update resume record'}`,
      };
    }

    return {
      success: true,
      message: isParsed ? "Resume parsed successfully from S3" : "Resume processing completed, but parsing failed",
    };
  } catch (error: any) {
    console.error("Error parsing resume from S3:", error);
    
    // Handle general errors with more context
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return {
        success: false,
        message: "Database connection error",
        error: "Failed to connect to database. Please check your connection and try again.",
      };
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        success: false,
        message: "Network connection error",
        error: "Unable to connect to external services. Please check your internet connection.",
      };
    } else {
      return {
        success: false,
        message: "Unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error occurred during resume parsing",
      };
    }
  }
}
