"use client";

import { Application } from '../../../types.d';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Clock, DollarSign, Calendar, CheckCircle, XCircle, Eye, Users, FileText, AlertCircle } from 'lucide-react';

interface ApplicationHeaderProps {
  application?: Application | null;
  isLoading?: boolean;
}

export default function ApplicationHeader({ application, isLoading }: ApplicationHeaderProps) {
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

  if (!application) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardContent className="p-8 text-center">
          <p className="text-white/60">Application not found</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'applied':
        return <FileText className="w-5 h-5" />;
      case 'under-review':
        return <Eye className="w-5 h-5" />;
      case 'shortlisted':
        return <Users className="w-5 h-5" />;
      case 'interviewed':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5" />;
      case 'withdrawn':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'under-review':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'shortlisted':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'interviewed':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'accepted':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'withdrawn':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not disclosed';
    if (min && max) return `$${(min / 1000).toFixed(0)}K - $${(max / 1000).toFixed(0)}K`;
    if (min) return `$${(min / 1000).toFixed(0)}K+`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}K`;
    return 'Not disclosed';
  };

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
      <CardContent className="p-8">
        <div className="flex items-start gap-8">
          {/* Company Logo Section - 25% width */}
          <div className="w-1/4">
            <Avatar className="w-32 h-32 mx-auto border-2 border-white/20">
              <AvatarImage src={application.job?.employer.logo || undefined} alt={application.job?.employer.companyName} />
              <AvatarFallback className="bg-violet-600 text-white font-bold text-4xl">
                {(application.job?.employer.companyName || 'CO').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Company Name and Location below logo */}
            <div className="text-center mt-4">
              <h2 className="text-xl font-bold text-white mb-2">
                {application.job?.employer.companyName}
              </h2>
              <p className="text-white/70 flex items-center justify-center gap-1">
                <MapPin className="h-4 w-4" />
                {application.job?.location}
              </p>
            </div>
          </div>
          
          {/* Job Details Section - 75% width */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {application.job?.title}
                </h1>
                <p className="text-xl text-white/70">
                  {application.job?.position}
                </p>
              </div>
              
              {/* Status Badge */}
              <Badge
                className={`${getStatusColor(application.status)} px-4 py-3 flex items-center gap-2 text-base font-medium`}
              >
                {getStatusIcon(application.status)}
                <span className="capitalize">{application.status.replace('-', ' ')}</span>
              </Badge>
            </div>
            
            {/* Application Meta Information */}
            <div className="flex flex-wrap gap-6 text-white/60 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Applied {formatDate(application.applicationDate)}
              </div>
              {application.job?.salaryMin || application.job?.salaryMax ? (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {formatSalary(application.job?.salaryMin, application.job?.salaryMax)}
                </div>
              ) : null}
              {application.job?.employmentType && (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4">💼</span>
                  <span className="capitalize">{application.job.employmentType.replace('-', ' ')}</span>
                </div>
              )}
              {application.updatedAt && application.updatedAt !== application.applicationDate && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Updated {formatDate(application.updatedAt)}
                </div>
              )}
            </div>
            
            {/* Tech Stack and Additional Info */}
            <div className="flex flex-wrap gap-2">
              {application.job?.experience && (
                <Badge 
                  variant="outline" 
                  className="bg-blue-600/20 text-blue-300 border-blue-500/30"
                >
                  {application.job.experience}
                </Badge>
              )}
              {application.job?.seniority && (
                <Badge 
                  variant="outline" 
                  className="bg-blue-600/20 text-blue-300 border-blue-500/30"
                >
                  {application.job.seniority}
                </Badge>
              )}
              {application.job?.locationType && (
                <Badge 
                  variant="outline" 
                  className="bg-green-600/20 text-green-300 border-green-500/30"
                >
                  {application.job.locationType}
                </Badge>
              )}
              {application.job?.openings && application.job.openings > 1 && (
                <Badge 
                  variant="outline" 
                  className="bg-orange-600/20 text-orange-300 border-orange-500/30"
                >
                  {application.job.openings} openings
                </Badge>
              )}
              {application.job?.techStack && application.job.techStack.length > 0 && (
                <>
                  {application.job.techStack.slice(0, 4).map((tech: string) => (
                    <Badge 
                      key={tech} 
                      variant="outline"
                      className="bg-violet-600/20 text-violet-300 border-violet-500/30"
                    >
                      {tech}
                    </Badge>
                  ))}
                  {application.job.techStack.length > 4 && (
                    <Badge 
                      variant="outline"
                      className="bg-white/10 text-white/70 border-white/20"
                    >
                      +{application.job.techStack.length - 4} more
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
