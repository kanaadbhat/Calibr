"use server";

// Import all functions from the modular structure
import { updateEmployerProfile, fetchEmployerProfile } from "./actions/profile-actions";
import { uploadEmployerProfileImage, uploadCompanyLogo } from "./actions/upload-actions";

// Re-export all functions to maintain existing import compatibility
export { updateEmployerProfile as default };

export {
  fetchEmployerProfile,
  uploadEmployerProfileImage,
  uploadCompanyLogo,
};
