"use client";

import { JobOpportunity } from '../interfaces';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Clock, DollarSign } from 'lucide-react';

interface JobHeaderProps {
  job?: JobOpportunity | null;
  isLoading?: boolean;
}

export default function JobHeader({ job, isLoading }: JobHeaderProps) {
  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardContent className="p-8">
          <div className="flex items-start gap-8">
            {/* Company Logo Skeleton - 25% width */}
            <div className="w-1/4">
              <Skeleton className="w-32 h-32 rounded-full mx-auto" />
              <div className="text-center mt-4">
                <Skeleton className="h-6 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            </div>
            
            {/* Job Details Skeleton - 75% width */}
            <div className="flex-1">
              <Skeleton className="h-10 w-80 mb-4" />
              <Skeleton className="h-6 w-60 mb-6" />
              
              <div className="flex flex-wrap gap-4 mb-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-24" />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardContent className="p-8 text-center">
          <p className="text-white/60">Job not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
      <CardContent className="p-8">
        <div className="flex items-start gap-8">
          {/* Company Logo Section - 25% width */}
          <div className="w-1/4">
            <Avatar className="w-32 h-32 mx-auto border-2 border-white/20">
              <AvatarImage src={job.logo} alt={job.company} />
              <AvatarFallback className="bg-violet-600 text-white font-bold text-4xl">
                {job.company.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Company Name and Location below logo */}
            <div className="text-center mt-4">
              <h2 className="text-xl font-bold text-white mb-2">
                {job.company}
              </h2>
              <p className="text-white/70 flex items-center justify-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </p>
            </div>
          </div>
          
          {/* Job Details Section - 75% width */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-4">
              {job.title}
            </h1>
            <p className="text-xl text-white/70 mb-6">
              {job.position}
            </p>
            
            {/* Job Meta Information */}
            <div className="flex flex-wrap gap-6 text-white/60 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Applications opened {job.timePosted}
              </div>
              {job.salary && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {job.salary}
                </div>
              )}
              {job.type && (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4">💼</span>
                  {job.type}
                </div>
              )}
            </div>
            
            {/* Tech Stack and Additional Info */}
            <div className="flex flex-wrap gap-2">
              {job.experience && (
                <Badge 
                  variant="outline" 
                  className="bg-blue-600/20 text-blue-300 border-blue-500/30"
                >
                  {job.experience}
                </Badge>
              )}
              {job.workMode && (
                <Badge 
                  variant="outline" 
                  className="bg-green-600/20 text-green-300 border-green-500/30"
                >
                  {job.workMode}
                </Badge>
              )}
              {job.techStack?.slice(0, 4).map((tech) => (
                <Badge 
                  key={tech} 
                  variant="outline"
                  className="bg-violet-600/20 text-violet-300 border-violet-500/30"
                >
                  {tech}
                </Badge>
              ))}
              {job.techStack && job.techStack.length > 4 && (
                <Badge 
                  variant="outline"
                  className="bg-white/10 text-white/70 border-white/20"
                >
                  +{job.techStack.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
