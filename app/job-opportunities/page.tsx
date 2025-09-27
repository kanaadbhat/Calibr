"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useJobOpportunities, useTechStackOptions, useJobFilters } from './hooks';
import JobList from './_components/JobList';
import JobFilters from './_components/JobFilters';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobOpportunitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Client-side auth check
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      router.push('/login?toast=login_required');
      return;
    }

    const userRole = session.user?.role;
    if (!userRole || !['candidate', 'employer'].includes(userRole)) {
      router.push('/?toast=role_cannot_access');
      return;
    }
  }, [session, status, router]);

  const { jobs, isLoading: jobsLoading } = useJobOpportunities();
  const { techStack, isLoading: techStackLoading } = useTechStackOptions();
  const { 
    filters, 
    updateTechStack, 
    updateExperience, 
    updateLocation 
  } = useJobFilters();

  const handleViewDetails = (id: string) => {
    router.push(`/job-opportunities/${id}`);
  };

  // Show loading until mounted and session is loaded
  if (!mounted || status === 'loading') {
    return <JobOpportunitiesSkeleton />;
  }

  // Show nothing if not authenticated (redirect will happen)
  if (!session || !['candidate', 'employer'].includes(session.user?.role)) {
    return <JobOpportunitiesSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] pt-22 pb-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
          Job Opportunities
        </h1>
        
        <div className="flex gap-8 h-[calc(100vh-200px)]">
          {/* Filters Sidebar */}
          <JobFilters
            techStackOptions={techStack}
            techStackLoading={techStackLoading}
            filters={filters}
            onTechStackChange={updateTechStack}
            onExperienceChange={updateExperience}
            onLocationChange={updateLocation}
          />

          {/* Job List */}
          <div className="w-2/3 overflow-y-auto max-h-full pr-2">
            <JobList
              jobs={jobs}
              isLoading={jobsLoading}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function JobOpportunitiesSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] pt-22 pb-16">
      <div className="container mx-auto px-6">
        <Skeleton className="h-12 w-64 mb-8 bg-white/10" />
        <div className="flex gap-8 h-[calc(100vh-200px)]">
          <div className="w-1/3">
            <Skeleton className="h-full w-full bg-white/10" />
          </div>
          <div className="w-2/3 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
