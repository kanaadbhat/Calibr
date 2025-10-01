"use server";

import { connectToDatabase } from "@/utils/connectDb";
import ResumeModel from "@/models/resume.model";
import { validateSession, validateResume, updateCandidateProfileWithResume, getNextVersionNumber } from "../lib/validation";
import { geminiClient } from "../lib/gemini-client";
import { extractTextFromFile, getMimeTypeFromFileName } from "../lib/file-processing";
import { S3Operations } from "@/lib/s3Service";

// Parse and save resume after S3 upload (separated from upload logic)
export async function parseAndSaveResume(s3Url: string, fileName: string, fileSize: number, s3Key: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
  resumeId?: string;
}> {
  try {
    const { success, candidateId, error } = await validateSession();
    if (!success) {
      return { success: false, message: "Unauthorized", error };
    }
    
    await connectToDatabase();

    // Step 1: Create resume with versioning
    let resumeId = '';
    let isParsed = false;
    let parseError = null;
    
    try {
      console.log("Starting resume creation and parsing...");
      
      // Get version info and handle existing resume
      const { version } = await getNextVersionNumber(candidateId!, fileName);
      
      // Create resume record
      const resumeDoc = new ResumeModel({
        candidateId: candidateId,
        fileName: fileName,
        originalFileName: fileName,
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
      console.log(`Resume v${version} created with ID:`, resumeId);

      // Parse the resume
      const parseResult = await parseResumeFromS3(resumeId);
      if (parseResult.success) {
        isParsed = true;
        console.log("Resume parsed successfully");
      } else {
        parseError = parseResult.error;
        console.log("Resume parsing failed:", parseError);
      }

    } catch (error: any) {
      console.error("Error during resume creation/parsing:", error);
      return {
        success: false,
        message: "Failed to create/parse resume",
        error: error.message || "Unknown error",
      };
    }

    // Step 2: Update candidate profile
    if (resumeId) {
      try {
        await updateCandidateProfileWithResume(candidateId!, resumeId);
        console.log("Updated candidate profile with new resume");
      } catch (profileError) {
        console.error("Error updating candidate profile:", profileError);
        // Don't fail the entire operation if profile update fails
      }
    }

    // Step 3: Return result
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

// Parse resume from S3 file (for unparsed resumes)
export async function parseResumeFromS3(resumeId: string): Promise<{
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

    // If already parsed, no need to parse again
    if (resume.isParsed) {
      return {
        success: true,
        message: "Resume is already parsed",
      };
    }

    // Download file from S3
    let s3Response;
    try {
      s3Response = await S3Operations.downloadObject(resume.s3Key);
    } catch (s3Error: any) {
      console.error("Failed to download file from S3:", s3Error);
      return {
        success: false,
        message: "Failed to download resume from storage",
        error: s3Error.message,
      };
    }

    // Convert S3 response to File object
    let file;
    try {
      file = await S3Operations.convertS3ResponseToFile(s3Response, resume.fileName, resume.mimeType);
    } catch (conversionError: any) {
      return {
        success: false,
        message: "Failed to process file from storage",
        error: conversionError.message,
      };
    }

    // Parse with AI
    let parsedData = null;
    let isParsed = false;
    
    try {
      console.log("Starting resume parsing from S3...");
      const { text: resumeText, useDirectUpload } = await extractTextFromFile(file);
      parsedData = await geminiClient.parseResume(file, resumeText, useDirectUpload);
      isParsed = true;
      console.log("Resume parsed successfully from S3");
    } catch (error: any) {
      console.error("Resume parsing failed:", error);
      
      // Provide specific error messages based on error type
      let errorMessage = "Resume parsing failed";
      
      if (error.response?.status === 503) {
        errorMessage = "AI service temporarily unavailable. Please try again in a few minutes.";
      } else if (error.response?.status === 429) {
        errorMessage = "AI service rate limit exceeded. Please wait a moment before trying again.";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid resume format for AI parsing.";
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = "AI service authentication error.";
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = "Resume parsing took too long and timed out. Please try with a smaller file.";
      } else if (error.message?.includes('Failed to parse AI response')) {
        errorMessage = "AI returned an invalid response format. The resume content might be too complex.";
      } else if (error.message?.includes('Could not extract meaningful text')) {
        errorMessage = "Unable to extract text from resume. Please try uploading a PDF, DOCX, or TXT file.";
      } else {
        errorMessage = `AI Parsing Error: ${error.message || 'Unknown parsing error'}`;
      }
      
      return {
        success: false,
        message: "Resume parsing failed",
        error: errorMessage,
      };
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