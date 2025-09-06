"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { JobOpportunity } from '../types';

interface JobCardProps {
  job: JobOpportunity;
  onViewDetails: (id: number) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onViewDetails }) => {
  const getTimeColor = (timePosted: string) => {
    if (timePosted.includes('hr')) {
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    } else if (timePosted.includes('day')) {
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <Avatar className="w-16 h-16 border-2 border-white/20">
            <AvatarImage src={job.logo} alt={job.company} />
            <AvatarFallback className="bg-violet-600 text-white font-bold text-lg">
              {job.company.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Job Details */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-1">
                  {job.title}
                </h3>
                <p className="text-white/70 mb-2">{job.position}</p>
                <p className="text-white/60 text-sm mb-2">{job.location}</p>
                
                {/* Tech Stack Tags */}
                <div className="flex flex-wrap gap-2 mt-3 mb-4">
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

                {/* Action Button */}
                <Button
                  onClick={() => onViewDetails(job.id)}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
                  size="sm"
                >
                  View Details
                </Button>
              </div>

              {/* Time Posted Badge */}
              <Badge
                variant="outline"
                className={`ml-4 ${getTimeColor(job.timePosted)} border`}
              >
                Applications opened {job.timePosted}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const JobCardSkeleton: React.FC = () => {
  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Company Logo Skeleton */}
          <Skeleton className="w-16 h-16 rounded-full" />

          {/* Job Details Skeleton */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Skeleton className="w-48 h-6 mb-2" />
                <Skeleton className="w-24 h-5 mb-2" />
                <Skeleton className="w-32 h-4 mb-3" />
                
                {/* Tech Stack Tags Skeleton */}
                <div className="flex flex-wrap gap-2 mt-3 mb-4">
                  {Array(3).fill(0).map((_, index) => (
                    <Skeleton key={index} className="w-16 h-6 rounded-full" />
                  ))}
                </div>

                {/* Action Button Skeleton */}
                <Skeleton className="w-28 h-8 rounded" />
              </div>

              {/* Time Posted Badge Skeleton */}
              <Skeleton className="w-32 h-6 rounded-full ml-4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobCard;
