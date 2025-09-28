"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { uploadFile, validateFile, UploadConfig } from '@/lib/s3Upload';
import { parseAndSaveResume } from "../actions";
import { useSession } from "next-auth/react";

interface ResumeUploadDialogProps {
  candidateId: string;
  onResumeUploaded?: () => void;
}



export default function ResumeUploadDialog({
  onResumeUploaded,
}: Omit<ResumeUploadDialogProps, 'candidateId'>) {
  const { data: session } = useSession();
  
  // Resume upload configuration
  const resumeConfig: UploadConfig = {
    folderPrefix: 'resumes',
    allowedFileTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    cleanupPrevious: false,
    generateUniqueFilename: false, // Keep original filename
    userId: session?.user?._id || '',
    userRole: 'candidate',
    metadata: {
      uploadType: 'resume'
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDialogOpen = (open: boolean) => {
    setIsOpen(open);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate the file using the new utility function
    const validation = validateFile(file, resumeConfig);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    if (!session?.user?._id) {
      toast.error("Please log in to upload resumes");
      return;
    }

    setIsUploading(true);
    
    // Create loading toast with ID to dismiss later
    const loadingToastId = toast.loading("Uploading resume to S3...");
    
    try {
      // Step 1: Upload to S3 using the unified API
      const uploadResult = await uploadFile(file, resumeConfig);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'S3 upload failed');
      }

      // Update loading message
      toast.dismiss(loadingToastId);
      const parsingToastId = toast.loading("Parsing resume with AI...");

      // Step 2: Parse and save to database
      const parseResult = await parseAndSaveResume(
        uploadResult.fileUrl!,
        uploadResult.fileName!,
        uploadResult.fileSize!,
        uploadResult.s3Key!
      );

      toast.dismiss(parsingToastId);

      if (parseResult.success) {
        toast.success(parseResult.message);
        onResumeUploaded?.();
        setIsOpen(false); // Close dialog only on success
      } else {
        toast.error(parseResult.error || "Failed to process resume");
        // Keep dialog open so user can see the error and try again
      }
    } catch (error: any) {
      console.error("Error uploading resume:", error);
      toast.dismiss(loadingToastId);
      toast.error(error.message || "An error occurred while uploading");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Upload className="w-4 h-4 mr-2" />
          Upload Resume
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0D0D20] border-white/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload Resume</DialogTitle>
          <p className="text-white/70 text-sm mt-2">
            Upload your resume file - it will be automatically parsed with AI
          </p>
        </DialogHeader>

        {/* Upload Section */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p className="text-white/80 mb-4">
              Upload your resume files (PDF, DOC, DOCX, TXT)
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? "Uploading & Parsing..." : "Choose File"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-sm text-white/60 mt-2">
              Maximum file size: 5MB
            </p>
          </div>


        </div>
      </DialogContent>
    </Dialog>
  );
}