import React, { Suspense } from 'react';
import RoleWrapper from '@/lib/RoleWrapper';
import { getJobOpportunities, getTechStackOptions } from './actions';
import { JobOpportunitiesClient } from './_components';
import { Skeleton } from '@/components/ui/skeleton';

// This is now a SERVER component
export default function JobOpportunitiesPage() {
  return (
    <RoleWrapper role={["candidate","employer"]}>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] pt-22 pb-16">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
            Job Opportunities
          </h1>
          
          <Suspense fallback={<JobOpportunitiesSkeleton />}>
            <JobOpportunitiesWrapper />
          </Suspense>
        </div>
      </div>
    </RoleWrapper>
  );
}

// Server component that fetches data
async function JobOpportunitiesWrapper() {
  const [jobs, techStack] = await Promise.all([
    getJobOpportunities(),
    getTechStackOptions()
  ]);

  return (
    <div className="flex gap-8 h-[calc(100vh-200px)]">
      {/* Pass server-fetched data to client component */}
      <JobOpportunitiesClient 
        initialJobs={jobs}
        initialTechStack={techStack}
      />
    </div>
  );
}

function JobOpportunitiesSkeleton() {
  return (
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
  );
}
