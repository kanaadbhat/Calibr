"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Briefcase, Users, FileText } from "lucide-react";
import { useFetchJobsWithAssessments } from "../../hooks";
import type { JobWithAssessment } from "../../actions";
import { CandidatesTable } from ".";

export function ManageCandidates() {
  const { jobs, loading, error } = useFetchJobsWithAssessments();
  const [selectedJob, setSelectedJob] = useState<JobWithAssessment | null>(null);

  // If a job is selected, show the candidates table
  if (selectedJob) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-16">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-gradient-to-br from-[#0A0A18]/90 to-[#0D0D20]/90 backdrop-blur-xl border-b border-white/10 pb-4 pt-8 sm:pt-6 px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedJob(null)}
              className="flex items-center gap-2 text-white/80 bg-transparent border-white/20 hover:text-white hover:bg-white/10 hover:border-white/40"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Jobs
            </Button>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">{selectedJob.title}</h2>
              <p className="text-white/60 text-sm mt-1">
                {selectedJob.department} • {selectedJob.position}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
          <CandidatesTable 
            job={selectedJob}
            onBack={() => setSelectedJob(null)}
          />
        </div>
      </div>
    );
  }

  // Show job list
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-16">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-br from-[#0A0A18]/90 to-[#0D0D20]/90 backdrop-blur-xl border-b border-white/10 pb-4 pt-8 sm:pt-6 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
            Manage Candidates
          </h1>
          <p className="text-white/60 mt-1">
            Select candidates for assessment rounds
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white/5 border-white/10">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 bg-white/10" />
                <Skeleton className="h-4 w-1/2 bg-white/10" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="w-16 h-16 text-white/20 mb-4" />
            <p className="text-white/60 text-center">
              No jobs with assessments found.
              <br />
              Create an assessment for a job to manage candidates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card
              key={job._id}
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              onClick={() => setSelectedJob(job)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white group-hover:text-violet-400 transition-colors">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="text-white/60 mt-1">
                      {job.department} • {job.position}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={job.employmentType === 'full-time' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {job.employmentType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <Users className="w-4 h-4" />
                    <span>{job.applicantsCount} Applicants</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-white/80">
                      <FileText className="w-4 h-4" />
                      <span>{job.assessment.title}</span>
                    </div>
                    <Badge
                      variant={
                        job.assessment.status === 'active'
                          ? 'default'
                          : job.assessment.status === 'completed'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="capitalize text-xs text-white"
                    >
                      {job.assessment.status}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedJob(job);
                  }}
                >
                  Manage Candidates
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
