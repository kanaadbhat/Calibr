"use client";

import { Application } from '../../../types.d';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, CheckCircle, Clock } from 'lucide-react';

interface ApplicationDetailsProps {
  application?: Application | null;
  isLoading?: boolean;
}

export default function ApplicationDetails({ application, isLoading }: ApplicationDetailsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Status Timeline Skeleton */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Job Information Skeleton */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
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
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusTimeline = () => {
    const timeline = [
      {
        status: 'applied',
        label: 'Application Submitted',
        date: application.applicationDate,
        completed: true
      }
    ];

    if (['under-review', 'shortlisted', 'interviewed', 'rejected', 'accepted'].includes(application.status)) {
      timeline.push({
        status: 'under-review',
        label: 'Under Review',
        date: application.updatedAt,
        completed: true
      });
    }

    if (['shortlisted', 'interviewed', 'rejected', 'accepted'].includes(application.status)) {
      timeline.push({
        status: 'shortlisted',
        label: 'Shortlisted',
        date: application.updatedAt,
        completed: true
      });
    }

    if (['interviewed', 'rejected', 'accepted'].includes(application.status)) {
      timeline.push({
        status: 'interviewed',
        label: 'Interviewed',
        date: application.updatedAt,
        completed: true
      });
    }

    if (application.status === 'rejected') {
      timeline.push({
        status: 'rejected',
        label: 'Application Rejected',
        date: application.updatedAt,
        completed: true
      });
    }

    if (application.status === 'accepted') {
      timeline.push({
        status: 'accepted',
        label: 'Offer Received',
        date: application.updatedAt,
        completed: true
      });
    }

    if (application.status === 'withdrawn') {
      timeline.push({
        status: 'withdrawn',
        label: 'Application Withdrawn',
        date: application.updatedAt,
        completed: true
      });
    }

    return timeline;
  };

  return (
    <div className="space-y-6">
      {/* Application Timeline */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Clock className="h-5 w-5" />
            Application Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getStatusTimeline().map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                  item.completed 
                    ? 'bg-violet-600/20 border-violet-500/50' 
                    : 'bg-white/5 border-white/20'
                }`}>
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-violet-300" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-white/30" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p className={`font-medium ${item.completed ? 'text-white' : 'text-white/50'}`}>
                    {item.label}
                  </p>
                  {item.date && (
                    <p className="text-sm text-white/60 mt-1">
                      {formatDate(item.date)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job Information */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Briefcase className="h-5 w-5" />
            Job Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-white/60">Department</p>
              <p className="font-medium text-white">{application.job?.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-white/60">Position</p>
              <p className="font-medium text-white">{application.job?.position}</p>
            </div>
            {application.job?.locationType && (
              <div>
                <p className="text-sm font-medium text-white/60">Work Mode</p>
                <p className="font-medium text-white capitalize">{application.job.locationType}</p>
              </div>
            )}
            {application.job?.employmentType && (
              <div>
                <p className="text-sm font-medium text-white/60">Employment Type</p>
                <p className="font-medium text-white capitalize">{application.job.employmentType.replace('-', ' ')}</p>
              </div>
            )}
            {application.job?.seniority && (
              <div>
                <p className="text-sm font-medium text-white/60">Seniority Level</p>
                <p className="font-medium text-white capitalize">{application.job.seniority}</p>
              </div>
            )}
            {application.job?.openings && (
              <div>
                <p className="text-sm font-medium text-white/60">Openings</p>
                <p className="font-medium text-white">{application.job.openings} position{application.job.openings > 1 ? 's' : ''}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      {application.job?.description && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 leading-relaxed whitespace-pre-line">
              {application.job.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Requirements */}
      {application.job?.requirements && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 leading-relaxed whitespace-pre-line">
              {application.job.requirements}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {application.job?.benefits && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Benefits & Perks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 leading-relaxed whitespace-pre-line">
              {application.job.benefits}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tech Stack */}
      {application.job?.techStack && application.job.techStack.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Required Technologies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {application.job.techStack.map((tech: string) => (
                <Badge 
                  key={tech} 
                  variant="secondary" 
                  className="bg-violet-600/20 text-violet-300 border border-violet-500/30"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
