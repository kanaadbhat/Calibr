import React, { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import RoleWrapper from '@/lib/RoleWrapper';
import { fetchEmployerProfile } from './actions';
import { EmployerProfileClient, ProfileSkeleton } from './_components';

// This is now a SERVER component
export default function EmployerProfilePage() {
  return (
    <RoleWrapper role={["employer"]}>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20]">
        <Suspense fallback={<ProfileSkeleton />}>
          <EmployerProfileWrapper />
        </Suspense>
      </div>
    </RoleWrapper>
  );
}

// Server component that fetches data
async function EmployerProfileWrapper() {
  const session = await getServerSession(authOptions);
  const employerId = session?.user?._id as string;

  // Fetch profile data on the server
  const profileResponse = await fetchEmployerProfile(employerId || '');

  return (
    <EmployerProfileClient 
      initialProfileData={profileResponse.data}
      initialCompletionPercentage={profileResponse.completionPercentage}
      employerId={employerId}
    />
  );
}
