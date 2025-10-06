"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { useProfileUpdate } from "../hooks";

interface ProfileInfoEditorProps {
  profileData: any;
  setProfileData: (data: any) => void;
}

export default function ProfileInfoEditor({ profileData, setProfileData }: ProfileInfoEditorProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [editSummary, setEditSummary] = useState("");
  
  const { updateProfile, isUpdating } = useProfileUpdate();

  useEffect(() => {
    setEditName(profileData.name || "");
    setEditTagline(profileData.tagline || "");
    setEditSummary(profileData.summary || "");
  }, [profileData.name, profileData.tagline, profileData.summary]);

  const handleSaveProfile = async () => {
    const updatedData = {
      ...profileData,
      summary: editSummary,
      name: editName,
      tagline: editTagline,
    };
    
    const res = await updateProfile(updatedData);
    
    if (res.success) {
      setProfileData(updatedData);
      setIsEditDialogOpen(false);
    }
  };

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-white/10 hover:text-white"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0D0D20] border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Profile Information</DialogTitle>
          <DialogDescription className="text-white/70">
            Update your name and tagline.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Name
            </Label>
            <Input
              id="name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              placeholder="Enter your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline" className="text-white">
              Tagline
            </Label>
            <Textarea
              id="tagline"
              value={editTagline}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setEditTagline(e.target.value)
              }
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
              placeholder="Enter your professional tagline"
            />
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                placeholder="Briefly describe your professional background and skills"
                className="min-h-[100px] bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="destructive"
              onClick={() => setIsEditDialogOpen(false)}
              className="bg-red-800 hover:bg-red-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isUpdating}
              className="bg-white text-[#0A0A18] hover:bg-white/90 border-none disabled:opacity-50"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}