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
  PutObjectCommand,
  DeleteObjectCommand,
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

// Helper function to upload resume to S3
async function uploadResumeToS3(file: File, candidateId: string): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Sanitize filename for consistent S3 key
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    // Create consistent S3 key for same file names (enables S3 versioning)
    // Format: resumes/{candidateId}/{sanitizedFileName}
    const s3Key = `resumes/${candidateId}/${sanitizedFileName}`;
    
    const uploadCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        candidateId: candidateId.toString(),
        uploadedAt: new Date().toISOString(),
        resumeType: "general", // Can be extended later for specific resume types
      },
    });

    await s3Client.send(uploadCommand);
    
    // Construct S3 URL (public URL format) - S3 versioning handles multiple uploads
    const s3Url = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    
    console.log("Resume uploaded to S3:", s3Url);
    return s3Url;
  } catch (uploadErr) {
    console.error("Resume upload to S3 failed:", uploadErr);
    return ""; // Return empty string if upload fails
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

// Upload resume and automatically parse it
export async function uploadResumeOnly(file: File): Promise<{
  success: boolean;
  message: string;
  error?: string;
  resumeUrl?: string;
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

    // Step 1: Upload to S3 first
    const s3Url = await uploadResumeToS3(file, candidateId);
    if (!s3Url) {
      return {
        success: false,
        message: "Failed to upload resume",
        error: "S3 upload failed",
      };
    }

    // Step 2: Parse with AI
    let parsedData = null;
    let isParsed = false;
    let parseError = null;
    
    try {
      console.log("Starting resume parsing...");
      const { text: resumeText, useDirectUpload } = await extractTextFromFile(file);
      const payload = await prepareGeminiPayload(file, resumeText, useDirectUpload);
      const geminiResponse = await callGeminiAPI(payload);
      parsedData = parseGeminiResponse(geminiResponse);
      isParsed = true;
      console.log("Resume parsed successfully");
    } catch (error) {
      console.warn("Resume parsing failed:", error);
      parseError = error instanceof Error ? error.message : "Unknown parsing error";
      // Create empty data structure
      parsedData = {
        tagline: "",
        summary: "",
        workDetails: "",
        education: [],
        skills: "",
        projects: [],
        certificates: [],
        socialLinks: { linkedin: "", github: "" },
      };
    }

    // Step 3: Create sanitized S3 key
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `resumes/${candidateId}/${sanitizedFileName}`;

    // Step 4: Handle existing resume with same filename
    const existingResume = await ResumeModel.findOne({
      candidateId: candidateId,
      fileName: file.name,
      isActive: true
    });

    let resumeDoc;
    
    if (existingResume) {
      // Mark old version as inactive
      await ResumeModel.updateOne(
        { _id: existingResume._id },
        { isActive: false }
      );
      
      // Create new version
      const nextVersion = existingResume.version + 1;
      resumeDoc = new ResumeModel({
        candidateId,
        fileName: file.name,
        originalFileName: file.name,
        s3Url,
        s3Key,
        fileSize: file.size,
        mimeType: file.type,
        parsedData,
        isParsed,
        parseError,
        version: nextVersion,
        isActive: true,
      });
    } else {
      // Create first version
      resumeDoc = new ResumeModel({
        candidateId,
        fileName: file.name,
        originalFileName: file.name,
        s3Url,
        s3Key,
        fileSize: file.size,
        mimeType: file.type,
        parsedData,
        isParsed,
        parseError,
        version: 1,
        isActive: true,
      });
    }

    await resumeDoc.save();
    console.log("Resume document saved successfully with ID:", resumeDoc._id);

    // Step 5: Update profile to include resume reference
    const updatedProfile = await Profile.findOneAndUpdate(
      { candidate: candidateId },
      {
        $addToSet: { resumes: resumeDoc._id },
        activeResume: resumeDoc._id, // Set as active resume
      },
      { upsert: true, new: true }
    );

    console.log("Profile updated successfully:", {
      profileId: updatedProfile?._id,
      resumesCount: updatedProfile?.resumes?.length,
      activeResume: updatedProfile?.activeResume
    });

    const message = isParsed 
      ? "Resume uploaded and parsed successfully" 
      : "Resume uploaded successfully (parsing failed, you can edit manually)";

    return {
      success: true,
      message,
      resumeUrl: s3Url,
    };
  } catch (error) {
    console.error("Error uploading resume:", error);
    return {
      success: false,
      message: "Failed to upload resume",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Delete resume from S3 and database
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

    // Find the resume document
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

    // Delete from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: resume.s3Key,
    });

    await s3Client.send(deleteCommand);

    // Mark resume as inactive instead of deleting (for audit trail)
    await ResumeModel.findByIdAndUpdate(resumeId, {
      isActive: false,
      deletedAt: new Date()
    });

    // Remove from profile's resume references
    await Profile.findOneAndUpdate(
      { candidate: candidateId },
      {
        $pull: { resumes: resumeId },
        // If this was the active resume, unset it
        ...(await Profile.findOne({ candidate: candidateId, activeResume: resumeId }) 
           ? { $unset: { activeResume: "" } } 
           : {})
      }
    );

    return {
      success: true,
      message: "Resume deleted successfully",
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



// Get resume profile data (now using Resume model)
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
