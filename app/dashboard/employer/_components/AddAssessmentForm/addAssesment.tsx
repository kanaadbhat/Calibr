"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Home, MapPin, Users, Calendar, Briefcase } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobPostings } from "../../hooks";

interface JobPosting {
  _id: string;
  title: string;
  department: string;
  position: string;
  employmentType: string;
  seniority: string;
  locationType: string;
  location: string;
  openings: number;
  createdAt: string;
  status?: string;
}

interface AddAssessmentPageProps {
  onJobSelect?: (jobId: string, jobTitle: string) => void;
  onBack?: () => void;
}

export default function AddAssessmentPage({ onJobSelect }: AddAssessmentPageProps) {
  const { loading, jobs, fetchJobs } = useJobPostings();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobSelect = (jobId: string, jobTitle: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (onJobSelect) {
      onJobSelect(jobId, jobTitle);
    } else if ((window as any).handleViewChange) {
      // Store selected job ID for the assessment creation flow
      sessionStorage.setItem('selectedJobId', jobId);
      sessionStorage.setItem('selectedJobTitle', jobTitle);
      (window as any).handleViewChange('create-assessment');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-16">
        <div className="sticky top-0 z-30 bg-gradient-to-br from-[#0A0A18]/90 to-[#0D0D20]/90 backdrop-blur-xl border-b border-white/10 pb-4 pt-8 sm:pt-6 px-4 sm:px-6 lg:px-8 xl:px-12">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-16">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-br from-[#0A0A18]/90 to-[#0D0D20]/90 backdrop-blur-xl border-b border-white/10 pb-4 pt-8 sm:pt-6 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
            Create Assessment
          </h1>
          <p className="text-white/70 mb-4">
            Select a job posting to create an assessment for
          </p>
          <Breadcrumb className="mt-4">
            <BreadcrumbList className="text-white/60">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/"
                    className="flex items-center hover:text-white transition-colors">
                    <Home className="w-4 h-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <div
                    className="hover:text-white transition-colors cursor-pointer"
                    onClick={() => {
                      if ((window as any).handleViewChange) {
                        (window as any).handleViewChange("dashboard");
                      }
                    }}>
                    Dashboard
                  </div>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-semibold">
                  Create Assessment
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        {jobs.length === 0 ? (
          <Card className="bg-[#171726] border-0 text-center py-12">
            <CardContent>
              <Briefcase className="w-16 h-16 mx-auto text-white/40 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Job Postings Found
              </h3>
              <p className="text-white/60 mb-6">
                You need to create job postings before you can create assessments.
              </p>
              <Button
                onClick={() => {
                  if ((window as any).handleViewChange) {
                    (window as any).handleViewChange("create-job");
                  }
                }}
                className="bg-purple-500 text-white hover:bg-purple-700"
              >
                Create Job Posting
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job: JobPosting) => (
              <Card
                key={job._id}
                className="bg-[#171726] border-0 hover:bg-[#1f1f35] transition-all duration-200 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {job.title}
                      </CardTitle>
                      <p className="text-sm text-white/60">{job.department}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-500/20 text-green-400 border-green-500/30"
                    >
                      {job.status || 'Active'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Users className="w-4 h-4" />
                      <span>{job.position} • {job.seniority}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location} • {job.locationType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="text-sm text-white/60">
                      <span className="font-medium text-white">{job.openings}</span> opening{job.openings !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-white/60 capitalize">
                      {job.employmentType.replace('-', ' ')}
                    </div>
                  </div>
                  
                  <Button
                    className="w-full bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 hover:text-purple-300 transition-all"
                    onClick={(e) => handleJobSelect(job._id, job.title, e)}
                  >
                    Create Assessment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
