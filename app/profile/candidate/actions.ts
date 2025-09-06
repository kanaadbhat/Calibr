"use server"

import { connectToDatabase } from "@/utils/connectDb";
import Profile from "@/models/profile.model";
import candidate from "@/models/candidate.model";
import { ProfileData, ProfileResponse } from "./type";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export default async function updateCandidateProfile(
  profileData: ProfileData
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    const candidateId = session?.user._id;
    
    if (!candidateId) {
      return { success: false, message: "Unauthorized", error: "User session not found" };
    }

    await connectToDatabase();

    // Fetch candidate name
    const candidateDoc = await candidate.findById(candidateId).select("firstName lastName");
    
    if (!candidateDoc) {
      return { success: false, message: "Candidate not found", error: "Unable to find candidate information" };
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
    
    return { success: false, message: "Error updating profile", error: errorMessage };
  }
}



export async function fetchCandidateProfile(candidateId: string): Promise<ProfileResponse> {
  try {
    if (!candidateId) {
      return { 
        success: false, 
        message: "Invalid candidate ID", 
        data: null, 
        completionPercentage: 0,
        error: "Candidate ID is required" 
      };
    }
    
    await connectToDatabase();

    const candidateInfo = await candidate.findById(candidateId).select('firstName lastName');
    
    if (!candidateInfo) {
      return { 
        success: false, 
        message: "Candidate not found", 
        data: null, 
        completionPercentage: 0,
        error: "Unable to find candidate with the provided ID" 
      };
    }
    
    const name = `${candidateInfo.firstName} ${candidateInfo.lastName}`;
    const profile = await Profile.findOne({ candidate: candidateId });

    const data : any = {
      name,
      tagline: profile?.tagline || "",
      summary: profile?.summary || "",
      workDetails: profile?.workDetails || "",
      profileImage: profile?.profileImage || "",
      education: profile?.education?.map((edu: any) => ({
        year: edu.year,
        degree: edu.degree,
        institution: edu.institution,
      })) || [],
      skills: profile?.skills || "",
      projects: Array.isArray(profile?.projects) ? profile.projects.map((project: any) => ({
        name: project.name,
        description: project.description,
        link: project.link || "",
      })) : profile?.projects ? [profile.projects] : [],
      certificates: profile?.certificates?.map((cert: any) => ({
        name: cert.name,
        issuer: cert.issuer,
        link: cert.link || "",
      })) || [],
      socialLinks: {
        linkedin: profile?.socialLinks?.linkedin || "",
        github: profile?.socialLinks?.github || "",
      },
    };

    return {
      success: true,
      message: profile ? "Profile fetched successfully" : "No profile found, returning defaults",
      data,
      completionPercentage: calculateCompletion(data)
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
      error: errorMessage 
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
    data.socialLinks?.github
  ];
  return Math.round((fields.filter(Boolean).length / 11) * 100);
}