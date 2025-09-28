"use client";

import React, { useState, useRef,} from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import updateCandidateProfile from "../actions";
import { uploadFile, validateFile, UploadConfig } from "@/lib/s3Upload";

interface ProfileAvatarProps {
  profileData: any;
  setProfileData: (data: any) => void;
  candidateId: string;
}

export default function ProfileAvatar({ profileData, setProfileData, candidateId }: ProfileAvatarProps) {
  // Profile image upload configuration
  const profileImageConfig: UploadConfig = {
    folderPrefix: 'profile-images',
    allowedFileTypes: ['image/*'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    cleanupPrevious: true,
    generateUniqueFilename: true,
    userId: candidateId,
    userRole: 'candidate',
    metadata: {
      uploadType: 'profile-image'
    }
  };

  const [isImageUploadDialogOpen, setIsImageUploadDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate the file using the new utility function
      const validation = validateFile(file, profileImageConfig);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Image selected successfully");
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];

      // Validate the file using the new utility function
      const validation = validateFile(file, profileImageConfig);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast.success("Image dropped successfully");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error("Please select an image to upload");
      return;
    }

    setIsUploading(true);
    // Create loading toast with ID to dismiss later
    const loadingToastId = toast.loading("Uploading image to S3...");

    try {
      // Upload to S3 using the new utility function
      const uploadResult = await uploadFile(imageFile, profileImageConfig);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }
      
      const updatedData = {
        ...profileData,
        profileImage: uploadResult.fileUrl,
      };

      // Update profile with S3 URL
      const res = await updateCandidateProfile(updatedData);

      if (res.success) {
        // Dismiss loading toast and show success
        toast.dismiss(loadingToastId);
        toast.success("Profile image updated successfully");
        
        setProfileData(updatedData);
        setImageLoadError(false); // Reset error state
        setIsImageUploadDialogOpen(false);
        setImagePreview(undefined);
        setImageFile(null);
      } else {
        toast.dismiss(loadingToastId);
        toast.error(res.error || "Failed to update profile image");
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.dismiss(loadingToastId);
      toast.error(error.message || "Failed to upload image to S3");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <Avatar className="w-32 h-32">
        {profileData.profileImage && !imageLoadError ? (
          <AvatarImage 
            src={profileData.profileImage} 
            alt={`${profileData.name}'s profile`}
            className="object-cover"
            onLoad={() => {
              console.log('Profile image loaded successfully:', profileData.profileImage);
              setImageLoadError(false);
            }}
            onError={() => {
              console.error('Failed to load profile image:', profileData.profileImage);
              setImageLoadError(true);
            }}
          />
        ) : null}
        <AvatarFallback className="bg-violet-600 text-white text-4xl">
          {profileData.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <Dialog open={isImageUploadDialogOpen} onOpenChange={setIsImageUploadDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-700 border-none"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#0D0D20] border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Upload Profile Image</DialogTitle>
            <DialogDescription className="text-white/70">
              Upload a profile picture to personalize your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <div
              className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-white/50 transition-colors"
              onClick={triggerFileInput}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 max-w-full mb-4 rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(undefined);
                      setImageFile(null);
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4 mr-2" /> Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-12 h-12 text-white/50 mb-2" />
                  <p className="text-white/70 mb-1">
                    Drag and drop an image here or click to browse
                  </p>
                  <p className="text-white/50 text-sm">PNG, JPG or GIF (max 5MB)</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="destructive"
                onClick={() => {
                  setIsImageUploadDialogOpen(false);
                  setImagePreview(undefined);
                  setImageFile(null);
                }}
                className="bg-red-800 hover:bg-red-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImageUpload}
                disabled={!imageFile || isUploading}
                className="bg-white text-[#0A0A18] hover:bg-white/90 border-none disabled:bg-white/50 disabled:text-[#0A0A18]/50"
              >
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}