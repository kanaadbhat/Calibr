"use client";

import React, { useState } from "react";
import { EmployerProfileData } from "../types";

// Import components
import ProfileSidebar from "./ProfileSidebar";
import ProfileMainContent from "./ProfileMainContent";
import ProfileCard from "./ProfileCard";
import ProfileCompletion from "./ProfileCompletion";
import CompanyInfoDisplay from "./CompanyInfoDisplay";

interface EmployerProfileClientProps {
  initialProfileData: EmployerProfileData | null;
  initialCompletionPercentage: number;
  employerId: string;
}

export default function EmployerProfileClient({
  initialProfileData,
  initialCompletionPercentage,
}: EmployerProfileClientProps) {
  const [profileData, setProfileData] = useState<EmployerProfileData>(
    initialProfileData || {
      name: "",
      email: "",
      companyName: "",
      tagline: "",
      description: "",
      industry: "",
      companySize: "",
      foundedYear: "",
      website: "",
      location: "",
      profileImage: "",
      companyLogo: "",
      socialLinks: { linkedin: "", twitter: "", facebook: "" },
      benefits: [],
      culture: "",
    }
  );

  const [profileCompletion] = useState(initialCompletionPercentage);

  return (
    <div className="max-w-7xl mx-auto pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <main className="py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Employer Profile
          </h1>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar - 1/3 width */}
            <ProfileSidebar>
              <ProfileCard 
                profileData={profileData} 
                setProfileData={setProfileData} 
              />
            </ProfileSidebar>

            {/* Main Content - 2/3 width */}
            <ProfileMainContent>
              <ProfileCompletion profileCompletion={profileCompletion} />
              <CompanyInfoDisplay 
                profileData={profileData} 
                setProfileData={setProfileData}
              />
            </ProfileMainContent>
          </div>
        </div>
      </main>
    </div>
  );
}
