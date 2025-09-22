"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Linkedin, Github } from "lucide-react";

interface PersonalInfoDisplayProps {
  profileData: any;
}

export default function PersonalInfoDisplay({ profileData }: PersonalInfoDisplayProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">
        Personal Information
      </h3>

      <div className="space-y-8">
        {/* Work Details */}
        <div>
          <h4 className="text-lg font-medium text-white mb-3">Work Details</h4>
          <p className="text-white/80">{profileData.workDetails}</p>
        </div>

        {/* Education */}
        <div>
          <h4 className="text-lg font-medium text-white mb-3">Education</h4>
          <div className="space-y-3">
            {profileData.education.map((edu: any, index: number) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-16 text-sm text-white/60 font-medium">
                  {edu.year}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{edu.degree}</p>
                  <p className="text-white/70">{edu.institution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-lg font-medium text-white mb-3">Skills</h4>
          <p className="text-white/80">{profileData.skills}</p>
        </div>

        {/* Projects */}
        <div>
          <h4 className="text-lg font-medium text-white mb-3">Projects</h4>
          <div className="space-y-3">
            {profileData.projects.map((project: any, index: number) => (
              <div key={index} className="border border-white/10 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-white font-medium">{project.name}</h5>
                    <p className="text-white/70 mt-1">{project.description}</p>
                  </div>
                  {project.link && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:bg-white/10 hover:text-white"
                      asChild
                    >
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div>
          <h4 className="text-lg font-medium text-white mb-3">Certificates</h4>
          <div className="space-y-3">
            {profileData.certificates.map((cert: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between border border-white/10 rounded-lg p-4"
              >
                <div>
                  <h5 className="text-white font-medium">{cert.name}</h5>
                  <p className="text-white/70">{cert.issuer}</p>
                </div>
                {cert.link && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:bg-white/10 hover:text-white"
                    asChild
                  >
                    <a href={cert.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h4 className="text-lg font-medium text-white mb-3">Social Links</h4>
          <div className="flex gap-4">
            {profileData.socialLinks.linkedin && (
              <Button variant="link" className="text-white" asChild>
                <a
                  href={profileData.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
            {profileData.socialLinks.github && (
              <Button variant="link" className="text-white" asChild>
                <a
                  href={profileData.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}