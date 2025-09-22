"use server";

import { connectToDatabase } from "@/utils/connectDb";
import Profile from "@/models/profile.model";
import candidate from "@/models/candidate.model";
import { ProfileData, ProfileResponse } from "./type";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import axios from "axios";
import { extractJsonFromResponse } from "@/ai-engine/ai-call/aiCall";
import { resumePrompt } from "@/ai-engine/prompts/prompt";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const apiKey = process.env.NEXT_GEMINI_API;

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

    // Fetch candidate name
    const candidateDoc = await candidate
      .findById(candidateId)
      .select("firstName lastName");

    if (!candidateDoc) {
      return {
        success: false,
        message: "Candidate not found",
        error: "Unable to find candidate information",
      };
    }

    const name = `${candidateDoc.firstName} ${candidateDoc.lastName}`;
    const data = { ...profileData, candidate: candidateId, name };

    let profile = await Profile.findOne({ candidate: candidateId });

    if (!profile) {
      await Profile.create(data);
      return { success: true, message: "Profile created successfully" };
    } else {
      await Profile.findOneAndUpdate(
        { candidate: candidateId },
        { $set: data },
        { new: true }
      );
      return { success: true, message: "Profile updated successfully" };
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

    const data: any = {
      name,
      tagline: profile?.tagline || "",
      summary: profile?.summary || "",
      workDetails: profile?.workDetails || "",
      profileImage: profile?.profileImage || "",
      education:
        profile?.education?.map((edu: any) => ({
          year: edu.year,
          degree: edu.degree,
          institution: edu.institution,
        })) || [],
      skills: profile?.skills || "",
      projects: Array.isArray(profile?.projects)
        ? profile.projects.map((project: any) => ({
            name: project.name,
            description: project.description,
            link: project.link || "",
          }))
        : profile?.projects
        ? [profile.projects]
        : [],
      certificates:
        profile?.certificates?.map((cert: any) => ({
          name: cert.name,
          issuer: cert.issuer,
          link: cert.link || "",
        })) || [],
      socialLinks: {
        linkedin: profile?.socialLinks?.linkedin || "",
        github: profile?.socialLinks?.github || "",
      },
      resume: Array.isArray(profile?.resume)
        ? profile.resume.map((r: any) => ({
            ...r,
            _id: r._id?.toString?.() ?? undefined,
          }))
        : profile?.resume
        ? [{
            ...profile.resume,
            _id: (profile.resume as any)?._id?.toString?.() ?? undefined,
          }]
        : [],
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

// Helper function to upload resume to Cloudinary
async function uploadResumeToCloudinary(file: File, candidateId: string): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "resumes",
          public_id: candidateId.toString(),
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    console.log("Resume uploaded to Cloudinary:", uploadResult.secure_url);
    return uploadResult.secure_url;
  } catch (uploadErr) {
    console.error("Resume upload to Cloudinary failed:", uploadErr);
    return ""; // Return empty string if upload fails
  }
}

// Helper function to update profile in database
async function updateProfileInDatabase(candidateId: string, parsedData: any, file: File, cloudinaryUrl: string): Promise<void> {
  await Profile.findOneAndUpdate(
    { candidate: candidateId },
    {
      $set: {
        ...parsedData,
        candidate: candidateId,
      },
      $push: {
        resume: {
          url: cloudinaryUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        },
      },
    },
    { upsert: true, new: true }
  );
  console.log("Profile updated successfully");
}

// Main function - refactored to use helper functions
export async function parseAndUpdateResume(file: File) {
  try {
    // Step 1: Authentication and database setup
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

    // Step 2: Extract text from file
    const { text: resumeText, useDirectUpload } = await extractTextFromFile(file);

    // Step 3: Prepare Gemini API payload
    const payload = await prepareGeminiPayload(file, resumeText, useDirectUpload);

    // Step 4: Call Gemini API
    const geminiResponse = await callGeminiAPI(payload);

    // Step 5: Parse Gemini response
    const parsedData = parseGeminiResponse(geminiResponse);

    // Step 6: Upload resume to Cloudinary
    const cloudinaryUrl = await uploadResumeToCloudinary(file, candidateId);

    // Step 7: Update profile in database
    await updateProfileInDatabase(candidateId, parsedData, file, cloudinaryUrl);

    return { success: true, message: "Resume parsed & profile updated" };
  } catch (err: any) {
    console.error("Resume parsing error:", err);

    // Provide more specific error messages
    if (err.code === "ECONNABORTED") {
      return {
        success: false,
        message:
          "Request timeout. The file might be too large or the server is busy.",
        error: err.message,
      };
    } else if (err.response?.status === 413) {
      return {
        success: false,
        message: "File too large. Please try a smaller file.",
        error: err.message,
      };
    } else if (err.response?.status >= 400 && err.response?.status < 500) {
      return {
        success: false,
        message:
          "Invalid request. Please check your file format and try again.",
        error: err.message,
      };
    } else {
      return {
        success: false,
        message:
          "Error parsing resume. Please try again or use a different file format.",
        error: err.message,
      };
    }
  }
}
