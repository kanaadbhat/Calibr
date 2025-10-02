"use client";

import React, { useState } from "react";
import ResumeUploadDialog from "./ResumeUploadDialog";
import ManualUpdateForm from "./ManualUpdateForm";
import ResumeProfileManager from "./ResumeProfileManager";
import ResumeList from "./ResumeList";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

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
  const [isResumeUploadOpen, setIsResumeUploadOpen] = useState(false);
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Resume Manager</h3>
      <p className="text-white/70 mb-4">Manage your resume files and profile data</p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mb-6">
        <Button
          onClick={() => setIsResumeUploadOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Resume
        </Button>
        
        <ResumeUploadDialog
          isOpen={isResumeUploadOpen}
          onOpenChange={setIsResumeUploadOpen}
          onResumeUploaded={(fileUrl, fileName) => {
            console.log(`📁 Resume uploaded callback triggered: ${fileName} -> ${fileUrl}`);
            console.log("🔄 Refreshing page to show updated data...");
            
            // Save current scroll position before reload
            sessionStorage.setItem('scrollPosition', '0');
            
            // Reload the page
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