"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ProfileAvatar from "./ProfileAvatar";
import { Building2, Mail } from "lucide-react";

interface ProfileCardProps {
  profileData: any;
  setProfileData: (data: any) => void;
}

export default function ProfileCard({ profileData, setProfileData }: ProfileCardProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <ProfileAvatar profileData={profileData} setProfileData={setProfileData} />
        </div>
        <h2 className="text-2xl font-bold text-white">{profileData.name}</h2>
        <p className="text-purple-400 text-sm flex items-center justify-center gap-2">
          <Mail className="w-4 h-4" />
          {profileData.email}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {profileData.companyName && (
          <div className="flex items-center gap-2 text-gray-300">
            <Building2 className="w-5 h-5 text-purple-400" />
            <span className="font-medium">{profileData.companyName}</span>
          </div>
        )}
        {profileData.tagline && (
          <p className="text-gray-300 text-sm italic">{profileData.tagline}</p>
        )}
      </CardContent>
    </Card>
  );
}
