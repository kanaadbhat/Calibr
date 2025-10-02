"use server";

// Import all functions from the modular structure
import { updateCandidateProfile, fetchCandidateProfile } from "./actions/profile-actions";
import {
  getCandidateResumes,
  deleteResume,
  getResumeProfile,
  updateResumeProfile,
  applyResumeToProfile,
  getResumeParsedData,
  updateResumeParsedData,
  getActiveResume,
  setActiveResume,
} from "./actions/resume-actions";
import {
  parseAndSaveResume,
  parseResumeFromS3,
} from "./actions/resume-parsing";
import { uploadProfileImage, uploadResume } from "./actions/upload-actions";

// Re-export all functions to maintain existing import compatibility

// Export upload actions for use in components
export { updateCandidateProfile as default };


export {
  fetchCandidateProfile,
  getCandidateResumes,
  deleteResume,
  getResumeProfile,
  updateResumeProfile,
  applyResumeToProfile,
  getResumeParsedData,
  updateResumeParsedData,
  getActiveResume,
  setActiveResume,
  parseAndSaveResume,
  parseResumeFromS3,
  uploadProfileImage,
  uploadResume,
};