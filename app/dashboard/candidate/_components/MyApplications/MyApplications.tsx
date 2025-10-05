"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Users,
  FileText
} from 'lucide-react';
import { Application } from '../../types.d';
import { fetchApplications, withdrawApplication, getApplicationStats } from '../../actions/application-actions';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface MyApplicationsProps {
  initialApplications?: Application[];
  initialStats?: {
    total: number;
    applied: number;
    underReview: number;
    shortlisted: number;
    interviewed: number;
    rejected: number;
    accepted: number;
    withdrawn: number;
  };
}

export function MyApplications({ initialApplications, initialStats }: MyApplicationsProps) {
  const [allApplications, setAllApplications] = useState<Application[]>(initialApplications || []);
  const [stats, setStats] = useState(initialStats);
  const [isLoading, setIsLoading] = useState(!initialApplications);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!initialApplications) {
      loadApplications();
      loadStats();
    }
  }, [initialApplications]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const result = await fetchApplications();
      if (result.success && result.data) {
        setAllApplications(result.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getApplicationStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // Client-side filtering
  const filteredApplications = activeFilter === 'all' 
    ? allApplications 
    : allApplications.filter(app => app.status === activeFilter);

  const handleWithdraw = async (applicationId: string) => {
    try {
      const result = await withdrawApplication(applicationId);
      if (result.success) {
        toast.success('Application withdrawn successfully');
        await loadApplications();
        await loadStats();
        setWithdrawingId(null); // Close dialog
      } else {
        toast.error(result.message || 'Failed to withdraw application');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast.error('Failed to withdraw application');
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'applied':
        return <FileText className="w-4 h-4" />;
      case 'under-review':
        return <Eye className="w-4 h-4" />;
      case 'shortlisted':
        return <Users className="w-4 h-4" />;
      case 'interviewed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'withdrawn':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
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

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    return `Up to $${(max! / 1000).toFixed(0)}k`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading && !initialApplications) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-500/30">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-blue-200 text-xs sm:text-sm">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/30">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats.applied}</div>
              <div className="text-cyan-200 text-xs sm:text-sm">Applied</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border-yellow-500/30">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats.underReview}</div>
              <div className="text-yellow-200 text-xs sm:text-sm">Reviewing</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-500/30">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats.shortlisted}</div>
              <div className="text-purple-200 text-xs sm:text-sm">Shortlisted</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border-indigo-500/30">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats.interviewed}</div>
              <div className="text-indigo-200 text-xs sm:text-sm">Interviewed</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats.accepted}</div>
              <div className="text-green-200 text-xs sm:text-sm">Accepted</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/20 to-rose-600/20 border-red-500/30">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats.rejected}</div>
              <div className="text-red-200 text-xs sm:text-sm">Rejected</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-500/20 to-slate-600/20 border-gray-500/30">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats.withdrawn}</div>
              <div className="text-gray-200 text-xs sm:text-sm">Withdrawn</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={handleFilterChange} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 grid grid-cols-4 lg:grid-cols-8 w-full gap-0">
          <TabsTrigger value="all" className="text-xs sm:text-sm text-white data-[state=active]:text-black">All</TabsTrigger>
          <TabsTrigger value="applied" className="text-xs sm:text-sm text-white data-[state=active]:text-black">Applied</TabsTrigger>
          <TabsTrigger value="under-review" className="text-xs sm:text-sm text-white data-[state=active]:text-black">Reviewing</TabsTrigger>
          <TabsTrigger value="shortlisted" className="text-xs sm:text-sm text-white data-[state=active]:text-black">Shortlisted</TabsTrigger>
          <TabsTrigger value="interviewed" className="text-xs sm:text-sm text-white data-[state=active]:text-black">Interviewed</TabsTrigger>
          <TabsTrigger value="accepted" className="text-xs sm:text-sm text-white data-[state=active]:text-black">Accepted</TabsTrigger>
          <TabsTrigger value="rejected" className="text-xs sm:text-sm text-white data-[state=active]:text-black">Rejected</TabsTrigger>
          <TabsTrigger value="withdrawn" className="text-xs sm:text-sm text-white data-[state=active]:text-black">Withdrawn</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="mt-6 space-y-4">
          {filteredApplications.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <Briefcase className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No applications found</h3>
                <p className="text-white/60">
                  {activeFilter === 'all' 
                    ? "You haven't applied to any jobs yet. Start browsing opportunities!"
                    : `No applications with status: ${activeFilter.replace('-', ' ')}`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card
                key={application._id}
                className="bg-gradient-to-br from-white/5 to-white/10 border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Left: Job Info - 2/3 width */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">
                            {application.job?.title}
                          </h3>
                          <p className="text-white/70 text-sm sm:text-base">
                            {application.job?.employer.companyName}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center text-white/60">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{application.job?.location}</span>
                        </div>
                        <div className="flex items-center text-white/60">
                          <Briefcase className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate capitalize">{application.job?.employmentType.replace('-', ' ')}</span>
                        </div>
                        <div className="flex items-center text-white/60">
                          <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">
                            {formatSalary(application.job?.salaryMin, application.job?.salaryMax)}
                          </span>
                        </div>
                        <div className="flex items-center text-white/60">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Applied {formatDate(application.applicationDate)}</span>
                        </div>
                      </div>

                      {application.job?.techStack && application.job.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {application.job.techStack.slice(0, 5).map((tech, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                          {application.job.techStack.length > 5 && (
                            <Badge variant="outline" className="bg-white/5 text-white/60 border-white/20 text-xs">
                              +{application.job.techStack.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Status & Actions - 1/3 width */}
                    <div className="flex flex-col items-start lg:items-stretch gap-3 lg:max-w-[200px] lg:ml-auto lg:mr-8">
                      <Badge
                        className={`${getStatusColor(application.status)} px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium w-full`}
                      >
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status.replace('-', ' ')}</span>
                      </Badge>

                      <Button
                        size="default"
                        variant="outline"
                        className="w-full border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:text-white hover:border-purple-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 focus-visible:ring-offset-gray-950 transition-colors duration-150 px-4 py-2.5 rounded-md shadow-sm"
                        onClick={() => router.push(`/dashboard/candidate/applications/${application._id}`)}
                      >
                        View Details
                      </Button>
                      
                      {(application.status === 'applied' || application.status === 'under-review') && (
                        <AlertDialog open={withdrawingId === application._id} onOpenChange={(open) => !open && setWithdrawingId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="default"
                              variant="outline"
                              className="border-red-500/30 bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 hover:border-red-500/50 w-full"
                              onClick={() => setWithdrawingId(application._id)}
                            >
                              Withdraw
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-gray-950 border-white/10">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Withdraw Application</AlertDialogTitle>
                              <AlertDialogDescription className="text-white/70">
                                Are you sure you want to withdraw your application for <span className="font-semibold text-white">{application.job?.title}</span> at <span className="font-semibold text-white">{application.job?.employer.companyName}</span>?
                                <br /><br />
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => handleWithdraw(application._id)}
                              >
                                Yes, Withdraw
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
