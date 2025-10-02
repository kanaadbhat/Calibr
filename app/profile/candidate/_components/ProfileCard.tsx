"use client";

import React from "react";
import ProfileAvatar from "./ProfileAvatar";

interface ProfileCardProps {
  profileData: any;
  setProfileData: (data: any) => void;
  candidateId: string;
}

export default function ProfileCard({ profileData, setProfileData, candidateId }: ProfileCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Profile Avatar */}
        <ProfileAvatar 
          profileData={profileData} 
          setProfileData={setProfileData} 
          candidateId={candidateId}
        />

        {/* Name */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {profileData.name}
          </h2>
          <p className="text-white/70 text-lg">{profileData.tagline}</p>
        </div>
      </div>
    </div>
  );
}