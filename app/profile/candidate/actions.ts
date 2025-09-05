"use server"

import { connectToDatabase } from "@/utils/connectDb";
import Profile from "@/models/profile.model";
import candidate from "@/models/candidate.model";
import { ProfileData, ProfileResponse } from "./type";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function updateCandidateProfile(
  profileData: ProfileData
): Promise<{ success: boolean; message: string }> {
  const session = await getServerSession(authOptions);
  const candidateId = session?.user._id;
  console.log(session)
  if (!candidateId) {
    return { success: false, message: "Unauthorized" };
  }

  await connectToDatabase();

  try {
    // Fetch candidate name
    const candidateDoc = await candidate.findById(candidateId).select("firstName lastName");
    const name = candidateDoc ? `${candidateDoc.firstName} ${candidateDoc.lastName}` : "";

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
    return { success: false, message: "Error updating profile" };
  }
}



export async function fetchCandidateProfile(candidateId: string): Promise<ProfileResponse> {
  await connectToDatabase();
  try {

    let name: any = await candidate.findById(candidateId).select('firstName lastName');
    name = name?.firstName + " " + name?.lastName;
    const profile = await Profile.findOne({ candidate: candidateId });

    const data : any = {
      name,
      tagline: profile?.tagline || "",
      summary: profile?.summary || "",
      workDetails: profile?.workDetails || "",
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
    console.error(err);
    return { success: false, message: "Error fetching profile", data: null, completionPercentage: 0 }
  }

}
//need to be updated
function calculateCompletion(data: any): number {
  const fields = [
    data.name,
    data.tagline,
    data.summary,
    data.workDetails,
    data.education?.length,
    data.skills,
    data.projects?.length,
    data.certificates?.length,
    data.socialLinks?.linkedin,
    data.socialLinks?.github
  ];
  return Math.round((fields.filter(Boolean).length / 10) * 100);
}