"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X, Linkedin, Github, Pencil } from "lucide-react";
import { toast } from "sonner";
import { updateCandidateProfile } from "../actions/profile-actions";

interface ManualUpdateFormProps {
  profileData: any;
  setProfileData: (data: any) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function ManualUpdateForm({
  profileData,
  setProfileData,
  isOpen,
  setIsOpen,
}: ManualUpdateFormProps) {
  const updateWorkExperience = (index: number, field: string, value: string | string[]) => {
    setProfileData((prev: any) => ({
      ...prev,
      workDetails: prev.workDetails.map((work: any, i: number) =>
        i === index ? { ...work, [field]: value } : work
      ),
    }));
  };

  const updateWorkResponsibility = (workIndex: number, respIndex: number, value: string) => {
    setProfileData((prev: any) => ({
      ...prev,
      workDetails: prev.workDetails.map((work: any, i: number) =>
        i === workIndex
          ? {
              ...work,
              responsibilities: work.responsibilities.map((resp: string, j: number) =>
                j === respIndex ? value : resp
              ),
            }
          : work
      ),
    }));
  };

  const addWorkResponsibility = (workIndex: number) => {
    setProfileData((prev: any) => ({
      ...prev,
      workDetails: prev.workDetails.map((work: any, i: number) =>
        i === workIndex
          ? { ...work, responsibilities: [...work.responsibilities, ""] }
          : work
      ),
    }));
  };

  const removeWorkResponsibility = (workIndex: number, respIndex: number) => {
    setProfileData((prev: any) => ({
      ...prev,
      workDetails: prev.workDetails.map((work: any, i: number) =>
        i === workIndex
          ? {
              ...work,
              responsibilities: work.responsibilities.filter(
                (_: string, j: number) => j !== respIndex
              ),
            }
          : work
      ),
    }));
  };

  const addWorkExperience = () => {
    setProfileData((prev: any) => ({
      ...prev,
      workDetails: [
        ...prev.workDetails,
        {
          company: "",
          position: "",
          duration: "",
          location: "",
          description: "",
          responsibilities: [],
        },
      ],
    }));
  };

  const removeWorkExperience = (index: number) => {
    setProfileData((prev: any) => ({
      ...prev,
      workDetails: prev.workDetails.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setProfileData((prev: any) => ({
      ...prev,
      education: prev.education.map((edu: any, i: number) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addEducation = () => {
    setProfileData((prev: any) => ({
      ...prev,
      education: [...prev.education, { year: "", degree: "", institution: "" }],
    }));
  };

  const removeEducation = (index: number) => {
    setProfileData((prev: any) => ({
      ...prev,
      education: prev.education.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateProject = (index: number, field: string, value: string) => {
    setProfileData((prev: any) => ({
      ...prev,
      projects: prev.projects.map((project: any, i: number) =>
        i === index ? { ...project, [field]: value } : project
      ),
    }));
  };

  const addProject = () => {
    setProfileData((prev: any) => ({
      ...prev,
      projects: [...prev.projects, { name: "", description: "", link: "" }],
    }));
  };

  const removeProject = (index: number) => {
    setProfileData((prev: any) => ({
      ...prev,
      projects: prev.projects.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateCertificate = (index: number, field: string, value: string) => {
    setProfileData((prev: any) => ({
      ...prev,
      certificates: prev.certificates.map((cert: any, i: number) =>
        i === index ? { ...cert, [field]: value } : cert
      ),
    }));
  };

  const addCertificate = () => {
    setProfileData((prev: any) => ({
      ...prev,
      certificates: [...prev.certificates, { name: "", issuer: "", link: "" }],
    }));
  };

  const removeCertificate = (index: number) => {
    setProfileData((prev: any) => ({
      ...prev,
      certificates: prev.certificates.filter((_: any, i: number) => i !== index),
    }));
  };

  const updateSocialLink = (key: "linkedin" | "github", value: string) => {
    setProfileData((prev: any) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await updateCandidateProfile(profileData);

      if (res.success) {
        toast.success(res.message);
        setIsOpen(false);
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating your profile");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600/80 to-violet-600/80 hover:from-purple-600 hover:to-violet-600 text-white border border-purple-500/30 flex items-center gap-2">
          <Pencil className="w-4 h-4" />
          Manual Update
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0D0D20] border border-white/20 text-white w-[95vw] max-w-7xl max-h-[95vh] flex flex-col">
        <DialogHeader className="border-b border-white/10 pb-4 mb-6 flex-shrink-0">
          <DialogTitle className="text-xl font-semibold text-white mb-2">
            Edit Active Resume Data
          </DialogTitle>
          <DialogDescription className="text-white/70">
                                        Edit your active resume&apos;s parsed data. Changes will update the currently selected resume.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1 min-h-0">
          <div className="space-y-8 pb-4">
            {/* Basic Information Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Basic Information
              </h3>
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="tagline" className="text-white font-medium">
                    Professional Tagline
                  </Label>
                  <Input
                    id="tagline"
                    value={profileData.tagline}
                    onChange={(e) =>
                      setProfileData((prev: any) => ({
                        ...prev,
                        tagline: e.target.value,
                      }))
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="e.g., Full Stack Developer | React & Node.js Specialist"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="summary" className="text-white font-medium">
                    Professional Summary
                  </Label>
                  <Textarea
                    id="summary"
                    value={profileData.summary}
                    onChange={(e) =>
                      setProfileData((prev: any) => ({
                        ...prev,
                        summary: e.target.value,
                      }))
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px] resize-none"
                    placeholder="Brief overview of your professional background, expertise, and career objectives..."
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="skills" className="text-white font-medium">
                    Technical Skills
                  </Label>
                  <Textarea
                    id="skills"
                    value={profileData.skills}
                    onChange={(e) =>
                      setProfileData((prev: any) => ({
                        ...prev,
                        skills: e.target.value,
                      }))
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[120px] resize-none"
                    placeholder="List your technical skills, programming languages, frameworks, tools..."
                  />
                </div>
              </div>
            </div>

            {/* Work Experience Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                Work Experience
              </h3>
              <div className="space-y-4">
                {profileData.workDetails.map((work: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            type="text"
                            value={work.position}
                            onChange={(e) =>
                              updateWorkExperience(index, "position", e.target.value)
                            }
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            placeholder="Position (e.g., Software Engineer)"
                          />
                          <Input
                            type="text"
                            value={work.company}
                            onChange={(e) =>
                              updateWorkExperience(index, "company", e.target.value)
                            }
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            placeholder="Company Name"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            type="text"
                            value={work.duration}
                            onChange={(e) =>
                              updateWorkExperience(index, "duration", e.target.value)
                            }
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            placeholder="Duration (e.g., Jan 2023 - Present)"
                          />
                          <Input
                            type="text"
                            value={work.location}
                            onChange={(e) =>
                              updateWorkExperience(index, "location", e.target.value)
                            }
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            placeholder="Location (e.g., San Francisco, CA)"
                          />
                        </div>
                        <Textarea
                          value={work.description}
                          onChange={(e) =>
                            updateWorkExperience(index, "description", e.target.value)
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px] resize-none"
                          placeholder="Brief description of your role and achievements..."
                        />
                        
                        {/* Responsibilities */}
                        <div className="space-y-2">
                          <Label className="text-white/80 text-sm">
                            Key Responsibilities
                          </Label>
                          {work.responsibilities && work.responsibilities.length > 0 ? (
                            work.responsibilities.map((resp: string, respIndex: number) => (
                              <div key={respIndex} className="flex items-center gap-2">
                                <Input
                                  type="text"
                                  value={resp}
                                  onChange={(e) =>
                                    updateWorkResponsibility(index, respIndex, e.target.value)
                                  }
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-sm"
                                  placeholder="e.g., Developed and maintained RESTful APIs..."
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeWorkResponsibility(index, respIndex)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addWorkResponsibility(index)}
                            className="w-full border-white/20 text-white/70 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/30 text-xs"
                          >
                            + Add Responsibility
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWorkExperience(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addWorkExperience}
                  className="w-full border-white/30 text-white bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/40"
                >
                  + Add Work Experience
                </Button>
              </div>
            </div>

            {/* Education Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Education
              </h3>
              <div className="space-y-4">
                {profileData.education.map((edu: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          type="text"
                          value={edu.year}
                          onChange={(e) =>
                            updateEducation(index, "year", e.target.value)
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          placeholder="Year (e.g., 2020-2024)"
                        />
                        <Input
                          type="text"
                          value={edu.degree}
                          onChange={(e) =>
                            updateEducation(index, "degree", e.target.value)
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          placeholder="Degree (e.g., Bachelor of Engineering)"
                        />
                        <Input
                          type="text"
                          value={edu.institution}
                          onChange={(e) =>
                            updateEducation(index, "institution", e.target.value)
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          placeholder="Institution Name"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addEducation}
                  className="w-full border-white/30 text-white bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/40"
                >
                  + Add Education
                </Button>
              </div>
            </div>

            {/* Projects Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Projects
              </h3>
              <div className="space-y-4">
                {profileData.projects.map((project: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <Input
                          type="text"
                          value={project.name}
                          onChange={(e) =>
                            updateProject(index, "name", e.target.value)
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          placeholder="Project Name (e.g., E-commerce Website)"
                        />
                        <Textarea
                          value={project.description}
                          onChange={(e) =>
                            updateProject(index, "description", e.target.value)
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px] resize-none"
                          placeholder="Brief description of the project, technologies used, and your role..."
                        />
                        <Input
                          type="text"
                          value={project.link}
                          onChange={(e) =>
                            updateProject(index, "link", e.target.value)
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          placeholder="Project URL or GitHub link"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProject(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addProject}
                  className="w-full border-white/30 text-white bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/40"
                >
                  + Add Project
                </Button>
              </div>
            </div>

            {/* Certificates Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                Certificates
              </h3>
              <div className="space-y-4">
                {profileData.certificates.map((cert: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <Input
                          type="text"
                          value={cert.name}
                          onChange={(e) =>
                            updateCertificate(index, "name", e.target.value)
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          placeholder="Certificate Name (e.g., AWS Solutions Architect)"
                        />
                        <Input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) =>
                            updateCertificate(index, "issuer", e.target.value)
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          placeholder="Issuing Organization (e.g., Amazon Web Services)"
                        />
                        <Input
                          type="text"
                          value={cert.link}
                          onChange={(e) =>
                            updateCertificate(index, "link", e.target.value)
                          }
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                          placeholder="Certificate verification link or URL"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCertificate(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addCertificate}
                  className="w-full border-white/30 text-white bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/40"
                >
                  + Add Certificate
                </Button>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-pink-500 rounded-full mr-3"></span>
                Social Links
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="linkedin" className="text-white font-medium flex items-center">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Label>
                  <Input
                    type="text"
                    value={profileData.socialLinks.linkedin}
                    onChange={(e) => updateSocialLink("linkedin", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="github" className="text-white font-medium flex items-center">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Label>
                  <Input
                    type="text"
                    value={profileData.socialLinks.github}
                    onChange={(e) => updateSocialLink("github", e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="https://github.com/your-profile"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="mt-auto bg-[#0D0D20] border-t border-white/10 pt-4 pb-4 flex-shrink-0">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-red-400/50 text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 hover:border-red-300/60"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-none"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}