"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useProfileData } from "./hooks";

// Import components
import ProfileSkeleton from "./_components/ProfileSkeleton";
import ProfileSidebar from "./_components/ProfileSidebar";
import ProfileMainContent from "./_components/ProfileMainContent";
import ProfileCard from "./_components/ProfileCard";
import ProfileSummary from "./_components/ProfileSummary";
import ResumeManagerSection from "./_components/ResumeManagerSection";
import ProfileCompletion from "./_components/ProfileCompletion";
import PersonalInfoDisplay from "./_components/PersonalInfoDisplay";

export default function CandidateProfilePage() {
  const { data, status } = useSession();
  const { profileData, setProfileData, completionPercentage, isLoading } =
    useProfileData(
      status === "authenticated" ? (data?.user._id as string) : ""
    );

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    setProfileCompletion(completionPercentage);
  }, [completionPercentage]);



  // Show skeleton loading state while session or profile data is loading
  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return <ProfileSkeleton />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20]">
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
                  candidateId={data?.user._id as string}
                />
                <ProfileSummary summary={profileData.summary} />
                <ResumeManagerSection
                  candidateId={data?.user._id as string}
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
    </div>
  );
}
