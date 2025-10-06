"use client";

import { JobOpportunity } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bookmark, 
  Share2, 
  MessageCircle, 
  Building, 
  MapPin, 
  Clock,
  Users,
  DollarSign
} from 'lucide-react';
import JobApply from './JobApply';

interface JobActionsProps {
  job?: JobOpportunity | null;
  isLoading?: boolean;
}

export default function JobActions({ job, isLoading }: JobActionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Action Buttons Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>

        {/* Info Card Skeleton */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const handleSaveJob = () => {
    // Future: Implement save job functionality
    console.log('Save job:', job._id);
  };

  const handleShareJob = () => {
    // Future: Implement share functionality
    console.log('Share job:', job._id);
  };

  const handleContactRecruiter = () => {
    // Future: Implement contact recruiter functionality
    console.log('Contact recruiter for job:', job._id);
  };

  return (
    <div className="space-y-4">
      {/* Primary Actions */}
      <div className="space-y-3">
        <JobApply job={job} isLoading={isLoading} />
        
        <Button 
          variant="outline" 
          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
          onClick={handleContactRecruiter}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Contact Recruiter
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={handleSaveJob}
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={handleShareJob}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Job Summary Card */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white">Job Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-white/60" />
              <div>
                <p className="text-sm font-medium text-white">Company</p>
                <p className="text-sm text-white/70">{job.company || job.department}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-white/60" />
              <div>
                <p className="text-sm font-medium text-white">Location</p>
                <p className="text-sm text-white/70">{job.location}</p>
              </div>
            </div>
            
            {job.salary && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-white/60" />
                <div>
                  <p className="text-sm font-medium text-white">Salary</p>
                  <p className="text-sm text-white/70">{job.salary}</p>
                </div>
              </div>
            )}
            
            {job.timePosted && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-white/60" />
                <div>
                  <p className="text-sm font-medium text-white">Posted</p>
                  <p className="text-sm text-white/70">{job.timePosted}</p>
                </div>
              </div>
            )}
            
            {job.applicants !== undefined && job.applicants > 0 && (
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-white/60" />
                <div>
                  <p className="text-sm font-medium text-white">Applicants</p>
                  <p className="text-sm text-white/70">{job.applicants} applied</p>
                  {job.applicationStats && (
                    <div className="text-xs text-white/50 mt-1 space-y-0.5">
                      {job.applicationStats.applied > 0 && (
                        <p>• {job.applicationStats.applied} new</p>
                      )}
                      {job.applicationStats.underReview > 0 && (
                        <p>• {job.applicationStats.underReview} under review</p>
                      )}
                      {job.applicationStats.shortlisted > 0 && (
                        <p className="text-green-400">• {job.applicationStats.shortlisted} shortlisted</p>
                      )}
                      {job.applicationStats.interviewed > 0 && (
                        <p className="text-blue-400">• {job.applicationStats.interviewed} interviewed</p>
                      )}
                      {job.applicationStats.accepted > 0 && (
                        <p className="text-purple-400">• {job.applicationStats.accepted} accepted</p>
                      )}
                      {job.applicationStats.rejected > 0 && (
                        <p className="text-red-400">• {job.applicationStats.rejected} rejected</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {(job.employmentType || job.type) && (
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 text-white/60">💼</span>
                <div>
                  <p className="text-sm font-medium text-white">Employment Type</p>
                  <p className="text-sm text-white/70">{job.employmentType || job.type}</p>
                </div>
              </div>
            )}
            
            {job.openings && job.openings > 0 && (
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-white/60" />
                <div>
                  <p className="text-sm font-medium text-white">Openings</p>
                  <p className="text-sm text-white/70">{job.openings} position{job.openings > 1 ? 's' : ''}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Tech Stack */}
          {job.techStack && job.techStack.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <p className="text-sm font-medium mb-2 text-white">Tech Stack</p>
              <div className="flex flex-wrap gap-1">
                {job.techStack.map((tech : string) => (
                  <Badge 
                    key={tech} 
                    variant="secondary" 
                    className="bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Info Card */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-white">About {job.company || job.department}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/70 leading-relaxed">
            {job.company || job.department} is focused on innovation and excellence. 
            Join our team and be part of building the future.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 w-full bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/30 hover:text-white"
          >
            View Company Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
