"use server";

import Employer from "@/models/employer.model";
import EmployerProfileModel from "@/models/employerProfile.model";
import { EmployerProfileData, EmployerProfileResponse } from "../types";
import { 
  withDatabase, 
  createErrorResponse, 
  createSuccessResponse, 
  safeAction,
  formatMongooseError
} from "@/utils/action-helpers";
import { requireAuth } from "@/utils/auth-helpers";

export async function updateEmployerProfile(
  profileData: EmployerProfileData
): Promise<{ success: boolean; message: string; error?: string }> {
  return safeAction(async () => {
    const employerId = await requireAuth();

    return withDatabase(async () => {
      // Find employer
      const employer = await Employer.findById(employerId);
      
      if (!employer) {
        return createErrorResponse("Employer not found");
      }

      // Update employer basic fields (only avatar)
      const employerUpdateFields: any = {};
      
      if (profileData.profileImage !== undefined) employerUpdateFields.avatar = profileData.profileImage;
      
      if (Object.keys(employerUpdateFields).length > 0) {
        await Employer.findByIdAndUpdate(
          employerId,
          { $set: employerUpdateFields },
          { new: true }
        );
      }

      // Update or create extended profile (including profileImage, companyName and companyLogo)
      const profileUpdateFields: any = {
        companyName: profileData.companyName || "",
        profileImage: profileData.profileImage || "",
        companyLogo: profileData.companyLogo || "",
        tagline: profileData.tagline || "",
        description: profileData.description || "",
        industry: profileData.industry || "",
        companySize: profileData.companySize || "",
        foundedYear: profileData.foundedYear || "",
        website: profileData.website || "",
        location: profileData.location || "",
        socialLinks: profileData.socialLinks || { linkedin: "", twitter: "", facebook: "" },
        benefits: profileData.benefits || [],
        culture: profileData.culture || "",
      };

      await EmployerProfileModel.findOneAndUpdate(
        { employer: employerId },
        { $set: profileUpdateFields },
        { new: true, upsert: true }
      );

      return createSuccessResponse("Employer profile updated successfully");
    });
  });
}

export async function fetchEmployerProfile(
  employerId: string
): Promise<EmployerProfileResponse> {
  try {
    if (!employerId) {
      return {
        success: false,
        message: "Invalid employer ID",
        data: null,
        completionPercentage: 0,
        error: "Employer ID is required",
      };
    }

    return await withDatabase(async () => {
      const employer = await Employer.findById(employerId)
        .select('firstName lastName email avatar')
        .lean();

      if (!employer) {
        return {
          success: false,
          message: "Employer not found",
          data: null,
          completionPercentage: 0,
          error: "Unable to find employer with the provided ID",
        };
      }

      // Fetch extended profile
      const employerProfile = await EmployerProfileModel.findOne({ employer: employerId }).lean();

      const name = `${employer.firstName} ${employer.lastName}`;

      const data: EmployerProfileData = {
        name,
        email: employer.email,
        companyName: employerProfile?.companyName || "",
        tagline: employerProfile?.tagline || "",
        description: employerProfile?.description || "",
        industry: employerProfile?.industry || "",
        companySize: employerProfile?.companySize || "",
        foundedYear: employerProfile?.foundedYear || "",
        website: employerProfile?.website || "",
        location: employerProfile?.location || "",
        profileImage: employer.avatar || "",
        companyLogo: employerProfile?.companyLogo || "",
        socialLinks: employerProfile?.socialLinks || {
          linkedin: "",
          twitter: "",
          facebook: "",
        },
        benefits: employerProfile?.benefits || [],
        culture: employerProfile?.culture || "",
      };

      return {
        success: true,
        message: "Employer profile fetched successfully",
        data,
        completionPercentage: calculateCompletion(data),
      };
    });
  } catch (err) {
    console.error("Error fetching employer profile:", err);
    const error = formatMongooseError(err, "Error fetching employer profile");
    
    return {
      success: false,
      message: "Error fetching employer profile",
      data: null,
      completionPercentage: 0,
      error: error.message,
    };
  }
}

function calculateCompletion(data: EmployerProfileData): number {
  const fields = [
    data.name,
    data.email,
    data.companyName,
    data.tagline,
    data.description,
    data.industry,
    data.companySize,
    data.foundedYear,
    data.website,
    data.location,
    data.profileImage,
    data.companyLogo,
    data.socialLinks?.linkedin,
    data.socialLinks?.twitter,
    data.socialLinks?.facebook,
    data.benefits?.length,
    data.culture,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}
