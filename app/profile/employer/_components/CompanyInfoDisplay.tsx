"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  Globe, 
  MapPin, 
  Users, 
  Calendar, 
  Linkedin, 
  Twitter, 
  Facebook,
  Edit,
  Check,
  X
} from "lucide-react";
import { useEmployerProfileUpdate } from "../hooks";
import type { EmployerProfileData } from "../types";
import CompanyLogo from "./CompanyLogo";

interface CompanyInfoDisplayProps {
  profileData: EmployerProfileData;
  setProfileData: (data: EmployerProfileData) => void;
}

export default function CompanyInfoDisplay({ profileData, setProfileData }: CompanyInfoDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<EmployerProfileData>(profileData);
  const { updateProfile, isUpdating } = useEmployerProfileUpdate();

  const handleSave = async () => {
    const result = await updateProfile(editedData);
    if (result.success) {
      setProfileData(editedData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-400" />
          Company Information
        </CardTitle>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-purple-400 hover:text-purple-300"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isUpdating}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isUpdating}
              className="text-purple-400 hover:text-purple-300"
            >
              <Check className="w-4 h-4 mr-2" />
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Logo Section */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-700">
          <CompanyLogo profileData={profileData} setProfileData={setProfileData} />
          <div>
            <h3 className="text-lg font-semibold text-white">{profileData.companyName || "Company Name"}</h3>
            <p className="text-sm text-gray-400">Company Logo</p>
          </div>
        </div>

        {isEditing ? (
          // Edit Mode
          <div className="space-y-4">
            <div>
              <Label htmlFor="companyName" className="text-gray-300">Company Name</Label>
              <Input
                id="companyName"
                value={editedData.companyName}
                onChange={(e) => setEditedData({ ...editedData, companyName: e.target.value })}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="tagline" className="text-gray-300">Tagline</Label>
              <Input
                id="tagline"
                value={editedData.tagline}
                onChange={(e) => setEditedData({ ...editedData, tagline: e.target.value })}
                placeholder="e.g., Building the future of work"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-300">Company Description</Label>
              <Textarea
                id="description"
                value={editedData.description}
                onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                placeholder="Tell us about your company..."
                className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry" className="text-gray-300">Industry</Label>
                <Input
                  id="industry"
                  value={editedData.industry}
                  onChange={(e) => setEditedData({ ...editedData, industry: e.target.value })}
                  placeholder="e.g., Technology, Healthcare"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="companySize" className="text-gray-300">Company Size</Label>
                <Input
                  id="companySize"
                  value={editedData.companySize}
                  onChange={(e) => setEditedData({ ...editedData, companySize: e.target.value })}
                  placeholder="e.g., 50-100 employees"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="foundedYear" className="text-gray-300">Founded Year</Label>
                <Input
                  id="foundedYear"
                  value={editedData.foundedYear}
                  onChange={(e) => setEditedData({ ...editedData, foundedYear: e.target.value })}
                  placeholder="e.g., 2020"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-gray-300">Location</Label>
                <Input
                  id="location"
                  value={editedData.location}
                  onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                  placeholder="e.g., San Francisco, CA"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website" className="text-gray-300">Website</Label>
              <Input
                id="website"
                type="url"
                value={editedData.website}
                onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                placeholder="https://example.com"
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Social Links</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-blue-400" />
                  <Input
                    value={editedData.socialLinks.linkedin}
                    onChange={(e) => setEditedData({ 
                      ...editedData, 
                      socialLinks: { ...editedData.socialLinks, linkedin: e.target.value }
                    })}
                    placeholder="LinkedIn URL"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-sky-400" />
                  <Input
                    value={editedData.socialLinks.twitter}
                    onChange={(e) => setEditedData({ 
                      ...editedData, 
                      socialLinks: { ...editedData.socialLinks, twitter: e.target.value }
                    })}
                    placeholder="Twitter URL"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <Input
                    value={editedData.socialLinks.facebook}
                    onChange={(e) => setEditedData({ 
                      ...editedData, 
                      socialLinks: { ...editedData.socialLinks, facebook: e.target.value }
                    })}
                    placeholder="Facebook URL"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="culture" className="text-gray-300">Company Culture</Label>
              <Textarea
                id="culture"
                value={editedData.culture}
                onChange={(e) => setEditedData({ ...editedData, culture: e.target.value })}
                placeholder="Describe your company culture..."
                className="bg-gray-900 border-gray-700 text-white min-h-[80px]"
              />
            </div>
          </div>
        ) : (
          // View Mode
          <div className="space-y-4">
            {profileData.tagline && (
              <div>
                <p className="text-purple-400 italic text-lg">{profileData.tagline}</p>
              </div>
            )}

            {profileData.description && (
              <div>
                <h4 className="text-gray-400 text-sm font-medium mb-2">About</h4>
                <p className="text-gray-300">{profileData.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileData.industry && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500">Industry</p>
                    <p className="font-medium">{profileData.industry}</p>
                  </div>
                </div>
              )}

              {profileData.companySize && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500">Company Size</p>
                    <p className="font-medium">{profileData.companySize}</p>
                  </div>
                </div>
              )}

              {profileData.foundedYear && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500">Founded</p>
                    <p className="font-medium">{profileData.foundedYear}</p>
                  </div>
                </div>
              )}

              {profileData.location && (
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium">{profileData.location}</p>
                  </div>
                </div>
              )}
            </div>

            {profileData.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                <a 
                  href={profileData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 hover:underline"
                >
                  {profileData.website}
                </a>
              </div>
            )}

            {(profileData.socialLinks.linkedin || profileData.socialLinks.twitter || profileData.socialLinks.facebook) && (
              <div>
                <h4 className="text-gray-400 text-sm font-medium mb-2">Social Links</h4>
                <div className="flex gap-4">
                  {profileData.socialLinks.linkedin && (
                    <a href={profileData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-6 h-6 text-blue-400 hover:text-blue-300 cursor-pointer" />
                    </a>
                  )}
                  {profileData.socialLinks.twitter && (
                    <a href={profileData.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="w-6 h-6 text-sky-400 hover:text-sky-300 cursor-pointer" />
                    </a>
                  )}
                  {profileData.socialLinks.facebook && (
                    <a href={profileData.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="w-6 h-6 text-blue-600 hover:text-blue-500 cursor-pointer" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {profileData.culture && (
              <div>
                <h4 className="text-gray-400 text-sm font-medium mb-2">Company Culture</h4>
                <p className="text-gray-300">{profileData.culture}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
