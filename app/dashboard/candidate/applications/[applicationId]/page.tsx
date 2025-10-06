import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import RoleWrapper from '@/lib/RoleWrapper';
import { fetchApplicationById } from '../../actions/application-actions';
import { ApplicationHeader, ApplicationDetails, ApplicationActions, ApplicationDetailClient } from './_components';
import { Skeleton } from '@/components/ui/skeleton';

// This is a SERVER component
export default async function ApplicationDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  
  return (
    <RoleWrapper role={["candidate"]}>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] pt-22 pb-16">
        <div className="container mx-auto px-6">
          <Suspense fallback={<ApplicationDetailSkeleton />}>
            <ApplicationDetailWrapper applicationId={applicationId} />
          </Suspense>
        </div>
      </div>
    </RoleWrapper>
  );
}

// Server component that fetches application data
async function ApplicationDetailWrapper({ applicationId }: { applicationId: string }) {
  const response = await fetchApplicationById(applicationId);
  
  if (!response.success || !response.data) {
    notFound();
  }

  const application = response.data;

  return (
    <>
      {/* Client component for navigation */}
      <ApplicationDetailClient />
      
      {/* Application Header - Full Width */}
      <div className="mb-8">
        <ApplicationHeader application={application} isLoading={false} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Center Section - Application Details (spans 2 columns) */}
        <div className="lg:col-span-2">
          <ApplicationDetails application={application} isLoading={false} />
        </div>

        {/* Right Section - Actions & Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <ApplicationActions application={application} isLoading={false} />
          </div>
        </div>
      </div>
    </>
  );
}

function ApplicationDetailSkeleton() {
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
