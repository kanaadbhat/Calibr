"use server";

import ResumeModel from "@/models/resume.model";
import Profile from "@/models/candidateProfile.model";
import { validateResume, updateCandidateProfileWithResume, requireAuth } from "../lib/validation";
import { geminiClient } from "../lib/gemini-client";
import { extractTextFromFile, getMimeTypeFromFileName } from "@/utils/file-processing";
import { S3Service } from "@/lib/s3Service";
import { 
  withDatabase, 
  createErrorResponse, 
  createSuccessResponse, 
  formatMongooseError,
  safeAction,
  logAction,
  logError,
  logSuccess
} from "@/utils/action-helpers";

// Parse and save resume after S3 upload (separated from upload logic)
export async function parseAndSaveResume(s3Url: string, fileName: string, fileSize: number, s3Key: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
  resumeId?: string;
}> {
  return safeAction(async () => {
    return withDatabase(async () => {
      logAction('📄', 'parseAndSaveResume', { fileName, fileSize });
      
      const candidateId = await requireAuth();

    // Check resume limit: candidate can have at most 3 resumes
    const profile = await Profile.findOne({ candidate: candidateId });
    if (profile && profile.resumes && profile.resumes.length >= 3) {
      return createErrorResponse(
        "Resume limit reached",
        "You can upload a maximum of 3 resumes. Please delete an existing resume before uploading a new one."
      );
    }

    // Step 1: Create resume
    let resumeId = '';
    let isParsed = false;
    let parseError = null;
    
    try {
      logAction('🔧', 'Creating resume record', { fileName });
      
      // Create resume record (no versioning)
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
      });

      const savedResume = await resumeDoc.save();
      resumeId = (savedResume._id as any).toString();
      logSuccess(`Resume created with ID: ${resumeId}`);

      // Parse the resume
      const parseResult = await parseResumeFromS3(resumeId);
      if (parseResult.success) {
        isParsed = true;
        logSuccess('Resume parsed successfully');
      } else {
        parseError = parseResult.error;
        logError('Resume parsing failed', parseError);
      }

    } catch (error: any) {
      logError('Error during resume creation/parsing', error);
      return createErrorResponse(
        "Failed to create/parse resume",
        formatMongooseError(error)
      );
    }

    // Step 2: Update candidate profile
    if (resumeId) {
      try {
        await updateCandidateProfileWithResume(candidateId, resumeId);
        logSuccess('Updated candidate profile with new resume');
      } catch (profileError) {
        logError('Error updating candidate profile', profileError);
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
    });
  }, "Failed to process resume");
}

// Parse resume from S3 file (for unparsed resumes)
export async function parseResumeFromS3(resumeId: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  return safeAction(async () => {
    return withDatabase(async () => {
      logAction('🔍', 'parseResumeFromS3', { resumeId });
      
      const candidateId = await requireAuth();

    const { success: resumeSuccess, resume, error: resumeError } = await validateResume(resumeId, candidateId);
    if (!resumeSuccess) {
      return createErrorResponse("Resume not found", resumeError);
    }

    // If already parsed, no need to parse again
    if (resume.isParsed) {
      return createSuccessResponse("Resume is already parsed");
    }

    // Download file from S3
    let s3Response;
    try {
      s3Response = await S3Service.download(resume.s3Key);
    } catch (s3Error: any) {
      logError('Failed to download file from S3', s3Error);
      return createErrorResponse(
        "Failed to download resume from storage",
        s3Error.message
      );
    }

    // Convert S3 response to File object
    let file;
    try {
      file = await S3Service.downloadAsFile(s3Response, resume.fileName, resume.mimeType);
    } catch (conversionError: any) {
      logError('Failed to convert S3 response', conversionError);
      return createErrorResponse(
        "Failed to process file from storage",
        conversionError.message
      );
    }

    // Parse with AI
    let parsedData = null;
    let isParsed = false;
    
    try {
      logAction('🤖', 'Starting AI resume parsing');
      const { text: resumeText, useDirectUpload } = await extractTextFromFile(file);
      const aiResponse = await geminiClient.parseResume(file, resumeText, useDirectUpload);
      
      // 🧪 DEBUG: Log the raw AI response
      console.log('🔍 RAW AI RESPONSE:', JSON.stringify(aiResponse, null, 2));
      console.log('🔍 AI Response Keys:', Object.keys(aiResponse || {}));
      
      // Transform AI response to match Resume model schema
      parsedData = {
        tagline: aiResponse.tagline || "",
        summary: aiResponse.summary || "Professional with expertise in software development and technology.",
        workDetails: aiResponse.workDetails || [],
        education: aiResponse.education || [],
        skills: aiResponse.skills || "",
        projects: (aiResponse.projects || []).map((project: any) => ({
          name: project.name || "",
          description: project.description || "",
          link: project.link || project.github_link || "",
        })),
        certificates: (aiResponse.certificates || []).map((cert: any) => ({
          name: cert.name || "",
          issuer: cert.issuer || "",
          link: cert.link || "",
        })),
        socialLinks: {
          linkedin: aiResponse.socialLinks?.linkedin || aiResponse.personal_info?.linkedin || "",
          github: aiResponse.socialLinks?.github || aiResponse.personal_info?.github || "",
        },
      };
      
      // 🧪 DEBUG: Log the transformed data
      console.log('🔍 TRANSFORMED PARSED DATA:', JSON.stringify(parsedData, null, 2));
      
      isParsed = true;
      logSuccess('Resume parsed successfully from S3');
    } catch (error: any) {
      logError('Resume parsing failed', error);
      
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
      
      return createErrorResponse("Resume parsing failed", errorMessage);
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
        
        // 🧪 DEBUG: Log what we're about to save
        console.log('💾 SAVING TO DATABASE:', JSON.stringify(updateData, null, 2));
      } else {
        updateData.parseError = "Parsing failed during S3 retry";
      }

      const updatedResume = await ResumeModel.findByIdAndUpdate(resumeId, updateData, { new: true });
      
      // 🧪 DEBUG: Log what was actually saved
      console.log('✅ DATABASE SAVED. isParsed:', updatedResume?.isParsed);
      console.log('✅ DATABASE SAVED. parsedData keys:', Object.keys(updatedResume?.parsedData || {}));
      
      logSuccess('Updated resume record with parsed data');
    } catch (dbError: any) {
      logError('Failed to update resume in database', dbError);
      return createErrorResponse(
        "Failed to save parsed data",
        formatMongooseError(dbError)
      );
    }

    return createSuccessResponse(
      isParsed ? "Resume parsed successfully from S3" : "Resume processing completed, but parsing failed"
    );
    });
  }, "Failed to parse resume from S3");
}