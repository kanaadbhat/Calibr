"use client";

import React, { useEffect, useState } from "react";
import { ProfileData } from "../type";

// Import components
import ProfileSidebar from "./ProfileSidebar";
import ProfileMainContent from "./ProfileMainContent";
import ProfileCard from "./ProfileCard";
import ProfileSummary from "./ProfileSummary";
import ResumeManagerSection from "./ResumeManagerSection";
import ProfileCompletion from "./ProfileCompletion";
import PersonalInfoDisplay from "./PersonalInfoDisplay";

interface CandidateProfileClientProps {
  initialProfileData: ProfileData | null;
  initialCompletionPercentage: number;
  candidateId: string;
}

export default function CandidateProfileClient({
  initialProfileData,
  initialCompletionPercentage,
  candidateId,
}: CandidateProfileClientProps) {
  // Use initial data from server
  const [profileData, setProfileData] = useState<ProfileData>(
    initialProfileData || {
      name: "",
      tagline: "",
      summary: "",
      workDetails: [],
      education: [],
      skills: "",
      projects: [],
      certificates: [],
      socialLinks: { linkedin: "", github: "" },
      resume: [],
    }
  );

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [profileCompletion] = useState(initialCompletionPercentage);

  // Restore scroll position after page reload (if coming back from upload)
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    if (savedScrollPosition !== null) {
      window.scrollTo(0, parseInt(savedScrollPosition, 10));
      sessionStorage.removeItem('scrollPosition');
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
            Profile
          </h1>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - 1/3 width */}
            <ProfileSidebar>
              <ProfileCard 
                profileData={profileData} 
                setProfileData={setProfileData} 
                candidateId={candidateId}
              />
              <ProfileSummary summary={profileData.summary} />
              <ResumeManagerSection
                candidateId={candidateId}
                profileData={profileData}
                setProfileData={setProfileData}
                isUpdateDialogOpen={isUpdateDialogOpen}
                setIsUpdateDialogOpen={setIsUpdateDialogOpen}
              />
            </ProfileSidebar>

            {/* Main Content - 2/3 width */}
            <ProfileMainContent>
              <ProfileCompletion profileCompletion={profileCompletion} />
              <PersonalInfoDisplay profileData={profileData} />
            </ProfileMainContent>
          </div>
        </div>
      </main>
    </div>
  );
}
