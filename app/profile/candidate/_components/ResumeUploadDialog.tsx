"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadResume } from "../actions";

interface ResumeUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onResumeUploaded: (fileUrl: string, fileName: string) => void;
}

export default function ResumeUploadDialog({
  isOpen,
  onOpenChange,
  onResumeUploaded,
}: ResumeUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side file validation
  const validateResumeFile = (file: File): { valid: boolean; error?: string } => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Please select a valid document file (PDF, DOC, or DOCX)' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    return { valid: true };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate the file
      const validation = validateResumeFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];

      // Validate the file
      const validation = validateResumeFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      setSelectedFile(file);
      toast.success(`File dropped: ${file.name}`);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    const loadingToastId = toast.loading("Uploading resume...");

    try {
      console.log("🚀 Starting resume upload from client...");
      console.log(`📄 File: ${selectedFile.name} (${selectedFile.size} bytes)`);

      // Create FormData for server action
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Upload using server action
      console.log("📤 Calling uploadResume server action...");
      const uploadResult = await uploadResume(formData);
      
      console.log("📨 Upload result received:", uploadResult);

      if (!uploadResult.success || !uploadResult.fileUrl) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      toast.dismiss(loadingToastId);
      
      // Show different messages based on processing result
      if (uploadResult.resumeId) {
        toast.success("Resume uploaded and processed successfully!");
        console.log(`✅ Resume processed successfully with ID: ${uploadResult.resumeId}`);
      } else if (uploadResult.error) {
        toast.warning(`Resume uploaded but processing failed: ${uploadResult.error}`);
        console.warn(`⚠️ Upload succeeded but processing failed: ${uploadResult.error}`);
      } else {
        toast.success("Resume uploaded successfully!");
        console.log("✅ Resume uploaded successfully");
      }
      
      // Reset state first
      setSelectedFile(null);
      
      // Close dialog without triggering scroll
      onOpenChange(false);
      
      // Notify parent component after a brief delay to prevent scroll
      setTimeout(() => {
        onResumeUploaded(uploadResult.fileUrl || '', selectedFile.name);
      }, 100);
    } catch (error: any) {
      console.error("💥 Error uploading resume:", error);
      toast.dismiss(loadingToastId);
      toast.error(error.message || "Failed to upload resume");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Upload Resume</DialogTitle>
          <DialogDescription className="text-gray-300">
            Upload your resume to get started. Supported formats: PDF, DOC, DOCX (Max 10MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={!selectedFile ? triggerFileInput : undefined}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-white truncate max-w-[200px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-gray-300">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedFile(null);
              }}
              disabled={isUploading}
              className="border-red-400/50 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-300/60"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isUploading ? "Uploading..." : "Upload Resume"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}