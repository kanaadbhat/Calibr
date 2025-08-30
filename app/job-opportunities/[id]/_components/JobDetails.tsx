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
      {job.profileMatch && (
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
                  Excellent match for your profile!
                </p>
                <p className="text-sm text-green-400">
                  Your skills align well with this position
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
            <div>
              <p className="text-sm font-medium text-white/60">Start Date</p>
              <p className="font-medium text-white">{job.startDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-white/60">Work Mode</p>
              <p className="font-medium text-white">{job.workMode}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-white/60">Experience</p>
              <p className="font-medium text-white">{job.experience}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-white/60">Salary</p>
              <p className="font-medium text-white">{job.salary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/70 leading-relaxed">
            {job.description}
          </p>
        </CardContent>
      </Card>

      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {job.requirements.map((requirement : string, index : number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/70">{requirement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Responsibilities */}
      {job.responsibilities && job.responsibilities.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Key Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {job.responsibilities.map((responsibility : string, index : number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/70">{responsibility}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Benefits & Perks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((benefit : string, index : number) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs"
                >
                  {benefit}
                </Badge>
              ))}
            </div>
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
              {job.selectionRounds.map((round : string, index : number) => (
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
    </div>
  );
}
