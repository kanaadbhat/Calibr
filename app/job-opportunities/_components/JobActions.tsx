"use client";

import { JobOpportunity } from '../interfaces';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bookmark, 
  Share2, 
  Send, 
  MessageCircle, 
  Building, 
  MapPin, 
  Clock,
  Users,
  DollarSign
} from 'lucide-react';

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

  const handleApplyClick = () => {
    // Future: Implement apply functionality
    console.log('Apply to job:', job.id);
  };

  const handleSaveJob = () => {
    // Future: Implement save job functionality
    console.log('Save job:', job.id);
  };

  const handleShareJob = () => {
    // Future: Implement share functionality
    console.log('Share job:', job.id);
  };

  const handleContactRecruiter = () => {
    // Future: Implement contact recruiter functionality
    console.log('Contact recruiter for job:', job.id);
  };

  return (
    <div className="space-y-4">
      {/* Primary Actions */}
      <div className="space-y-3">
        <Button 
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
          onClick={handleApplyClick}
        >
          <Send className="h-5 w-5 mr-2" />
          Apply Now
        </Button>
        
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
                <p className="text-sm text-white/70">{job.company}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-white/60" />
              <div>
                <p className="text-sm font-medium text-white">Location</p>
                <p className="text-sm text-white/70">{job.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-white/60" />
              <div>
                <p className="text-sm font-medium text-white">Salary</p>
                <p className="text-sm text-white/70">{job.salary}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-white/60" />
              <div>
                <p className="text-sm font-medium text-white">Posted</p>
                <p className="text-sm text-white/70">{job.postedDate || job.timePosted}</p>
              </div>
            </div>
            
            {job.applicants && (
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-white/60" />
                <div>
                  <p className="text-sm font-medium text-white">Applicants</p>
                  <p className="text-sm text-white/70">{job.applicants} applied</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Tech Stack */}
          {job.techStack && job.techStack.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <p className="text-sm font-medium mb-2 text-white">Tech Stack</p>
              <div className="flex flex-wrap gap-1">
                {job.techStack.map((tech) => (
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
          <CardTitle className="text-lg text-white">About {job.company}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white/70 leading-relaxed">
            {job.company} is a leading technology company focused on innovation and excellence. 
            Join our team and be part of building the future of technology.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            View Company Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
