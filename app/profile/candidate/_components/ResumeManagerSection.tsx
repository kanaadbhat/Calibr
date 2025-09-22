"use client";

import React from "react";
import ResumeUploadDialog from "./ResumeUploadDialog";
import ManualUpdateForm from "./ManualUpdateForm";
import ResumeProfileManager from "./ResumeProfileManager";
import ResumeList from "./ResumeList";

interface ResumeManagerSectionProps {
  candidateId: string;
  profileData: any;
  setProfileData: (data: any) => void;
  isUpdateDialogOpen: boolean;
  setIsUpdateDialogOpen: (open: boolean) => void;
}

export default function ResumeManagerSection({
  candidateId,
  profileData,
  setProfileData,
  isUpdateDialogOpen,
  setIsUpdateDialogOpen,
}: ResumeManagerSectionProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Resume Manager</h3>
      <p className="text-white/70 mb-4">Manage your resume files and profile data</p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <ResumeUploadDialog
          onResumeUploaded={() => {
            window.location.reload();
          }}
        />
        <ManualUpdateForm
          profileData={profileData}
          setProfileData={setProfileData}
          isOpen={isUpdateDialogOpen}
          setIsOpen={setIsUpdateDialogOpen}
        />
        <ResumeProfileManager
          candidateId={candidateId}
          onProfileUpdated={() => {
            window.location.reload();
          }}
        />
      </div>

      {/* Resume List */}
      <ResumeList resumes={profileData.resume} />
    </div>
  );
}