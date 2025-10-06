"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, FileText, Loader2 } from "lucide-react";
import { useResumeOperations } from "../hooks";

interface ResumeProfileManagerProps {
  candidateId: string;
  onProfileUpdated?: () => void;
}

interface Resume {
  id: string;
  url: string;
  fileName: string;
  lastModified: Date;
  size: number;
  key: string;
  isParsed: boolean;
  version: number;
}

export default function ResumeProfileManager({ candidateId, onProfileUpdated }: ResumeProfileManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<string>("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  
  const { 
    resumes, 
    isApplying, 
    isParsing,
    loadResumes, 
    parseResume, 
    applyResume 
  } = useResumeOperations(candidateId);

  const handleResumeSelect = (resume: Resume) => {
    setSelectedResume(resume.fileName);
    setSelectedResumeId(resume.id);
  };

  const handleApplyToProfile = async () => {
    if (!selectedResumeId) {
      toast.error("Please select a resume first");
      return;
    }

    // Find the selected resume
    const selectedResumeData = resumes.find(r => r.id === selectedResumeId);
    
    if (!selectedResumeData) {
      toast.error("Selected resume not found");
      return;
    }

    // Check if resume is not parsed
    if (!selectedResumeData.isParsed) {
      // Parse the resume first
      const parseResult = await parseResume(selectedResumeId);
      
      if (!parseResult.success) {
        return;
      }
    }

    // Now apply to profile
    await applyResume(selectedResumeId, () => {
      setIsOpen(false);
      onProfileUpdated?.();
    });
  };

  const handleDialogOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadResumes();
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600/80 to-violet-600/80 hover:from-purple-600 hover:to-violet-600 text-white border border-purple-500/30">
          <Settings className="w-4 h-4 mr-2" />
          Choose Resume for Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0D0D20] border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Choose Resume for Profile</DialogTitle>
          <p className="text-white/70 text-sm mt-2">
            Select which resume to use as your active profile data. To edit the data, first apply it to your profile, then use Manual Update.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resume Selection */}
          <div className="space-y-3">
            <Label className="text-white">Available Resumes</Label>
            {resumes.length === 0 ? (
              <p className="text-white/60 text-center py-8">No resumes found. Upload a resume first.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {resumes.map((resume, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedResumeId === resume.id
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-white/20 hover:border-white/30"
                    }`}
                    onClick={() => handleResumeSelect(resume)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <div className="flex flex-col">
                          <span className="font-medium">{resume.fileName}</span>
                          <div className="flex items-center space-x-2 text-xs text-white/60">
                            <span>Version {resume.version}</span>
                            <span className={`px-2 py-1 rounded ${
                              resume.isParsed 
                                ? "bg-green-500/20 text-green-300" 
                                : "bg-yellow-500/20 text-yellow-300"
                            }`}>
                              {resume.isParsed ? "Parsed" : "Not Parsed"}
                            </span>
                            {isParsing && selectedResumeId === resume.id && (
                              <div className="flex items-center space-x-1">
                                <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                                <span className="text-blue-400">Parsing...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-white/60">
                        {new Date(resume.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          {selectedResumeId && (
            <div className="flex justify-between items-center pt-4 border-t border-white/20">
              <div className="text-sm text-white/70">
                Selected: <span className="font-medium">{selectedResume}</span>
              </div>
              <Button
                onClick={handleApplyToProfile}
                disabled={isApplying}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isParsing ? "Parsing Resume..." : "Applying..."}
                  </>
                ) : (
                  "Apply to Profile"
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}