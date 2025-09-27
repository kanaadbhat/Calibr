import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import RoleWrapper from '@/lib/RoleWrapper';
import { getJobOpportunityById } from '../actions';
import { JobDetails, JobHeader, JobActions, JobDetailClient } from './_components';
import { Skeleton } from '@/components/ui/skeleton';

// This is now a SERVER component
export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <RoleWrapper role={["candidate"]}>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] pt-22 pb-16">
        <div className="container mx-auto px-6">
          <Suspense fallback={<JobDetailSkeleton />}>
            <JobDetailWrapper jobId={id} />
          </Suspense>
        </div>
      </div>
    </RoleWrapper>
  );
}

// Server component that fetches job data
async function JobDetailWrapper({ jobId }: { jobId: string }) {
  const job = await getJobOpportunityById(jobId);
  
  if (!job) {
    notFound();
  }

  return (
    <>
      {/* Client component for navigation */}
      <JobDetailClient />
      
      {/* Job Header - Full Width */}
      <div className="mb-8">
        <JobHeader job={job} isLoading={false} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Section - Job Details (spans 2 columns) */}
        <div className="lg:col-span-2">
          <JobDetails job={job} isLoading={false} />
        </div>

        {/* Right Section - Actions & Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <JobActions job={job} isLoading={false} />
          </div>
        </div>
      </div>
    </>
  );
}

function JobDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <Skeleton className="h-32 w-full bg-white/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Skeleton className="h-96 w-full bg-white/10" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-64 w-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}
