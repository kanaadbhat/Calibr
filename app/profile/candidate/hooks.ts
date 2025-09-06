"use client";

import { useState, useEffect } from "react";
import { fetchCandidateProfile } from "./actions";
import { ProfileData } from "./type";
import { toast } from "sonner";

export function useProfileData(candidateId: string) {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    tagline: "",
    summary: "",
    workDetails: "",
    education: [],
    skills: "",
    projects: [],
    certificates: [],
    socialLinks: { linkedin: "", github: "" }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCandidateProfile(candidateId);
      if (result.success && result.data) {
        setProfileData(result.data);
        setCompletionPercentage(result.completionPercentage);
      } else {
        setError(result.message);
        toast.error(result.error || "Failed to load profile");
      }
    } catch (e) {
      console.error("Error loading profile:", e);
      setError("Failed to load profile");
      toast.error("An error occurred while loading your profile");
      setCompletionPercentage(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (candidateId) {
      loadProfile();
    }
  }, [candidateId]);

  return {
    profileData,
    setProfileData,
    isLoading,
    error,
    completionPercentage,
    refetch: loadProfile
  };
}