"use client";

import { JobOpportunity } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

interface JobDetailsProps {
  job?: JobOpportunity | null;
  isLoading?: boolean;
}

export default function JobDetails({ job, isLoading }: JobDetailsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Profile Match Card Skeleton */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description Skeleton */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>

        {/* Requirements Skeleton */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Profile Match Card */}
      {job.profileMatch && job.profileMatch > 0 && (
        <Card className="bg-green-600/10 backdrop-blur-xl border border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-300">
              <CheckCircle className="h-5 w-5" />
              Profile Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-green-600/20 flex items-center justify-center border border-green-500/30">
                  <span className="text-2xl font-bold text-green-300">
                    {job.profileMatch}%
                  </span>
                </div>
              </div>
              <div>
                <p className="font-medium text-green-300">
                  {job.profileMatch >= 80 ? 'Excellent match for your profile!' : 
                   job.profileMatch >= 60 ? 'Good match for your profile!' : 
                   'Moderate match for your profile'}
                </p>
                <p className="text-sm text-green-400">
                  Your skills align{job.profileMatch >= 80 ? ' well' : ''} with this position
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Information */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {job.startDate && (
              <div>
                <p className="text-sm font-medium text-white/60">Start Date</p>
                <p className="font-medium text-white">{job.startDate}</p>
              </div>
            )}
            {(job.workMode || job.locationType) && (
              <div>
                <p className="text-sm font-medium text-white/60">Work Mode</p>
                <p className="font-medium text-white">{job.workMode || job.locationType}</p>
              </div>
            )}
            {(job.experience || job.seniority) && (
              <div>
                <p className="text-sm font-medium text-white/60">Experience</p>
                <p className="font-medium text-white">{job.experience || job.seniority}</p>
              </div>
            )}
            {job.salary && (
              <div>
                <p className="text-sm font-medium text-white/60">Salary</p>
                <p className="font-medium text-white">{job.salary}</p>
              </div>
            )}
            {job.employmentType && (
              <div>
                <p className="text-sm font-medium text-white/60">Employment Type</p>
                <p className="font-medium text-white">{job.employmentType}</p>
              </div>
            )}
            {job.openings && (
              <div>
                <p className="text-sm font-medium text-white/60">Openings</p>
                <p className="font-medium text-white">{job.openings} position{job.openings > 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      {job.description && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Requirements */}
      {(job.requirementsList?.length || job.requirements) && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            {job.requirementsList?.length ? (
              <ul className="space-y-2">
                {job.requirementsList.map((requirement: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white/70">{requirement}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white/70 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {(job.benefitsList?.length || job.benefits) && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Benefits & Perks</CardTitle>
          </CardHeader>
          <CardContent>
            {job.benefitsList?.length ? (
              <div className="flex flex-wrap gap-2">
                {job.benefitsList.map((benefit: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs"
                  >
                    {benefit}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-white/70 leading-relaxed whitespace-pre-line">
                {job.benefits}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selection Process */}
      {job.selectionRounds && job.selectionRounds.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5" />
              Selection Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {job.selectionRounds.map((round: string, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
                    <span className="text-sm font-medium text-violet-300">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">{round}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Information */}
      {job.assessments && job.assessments.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5" />
              Assessment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {job.assessments.map((assessment) => (
                <div key={assessment._id} className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">{assessment.title}</h4>
                  {assessment.description && (
                    <p className="text-sm text-white/70 mb-3">{assessment.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/60">Status</p>
                      <p className="text-white capitalize">{assessment.status}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Total Candidates</p>
                      <p className="text-white">{assessment.totalCandidates || 0}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Completed</p>
                      <p className="text-white">{assessment.completedCandidates || 0}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Passed</p>
                      <p className="text-white">{assessment.passingCandidates || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
