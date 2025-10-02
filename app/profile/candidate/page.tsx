import React, { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import RoleWrapper from '@/lib/RoleWrapper';
import { fetchCandidateProfile } from './actions';
import { CandidateProfileClient, ProfileSkeleton } from './_components';

// This is now a SERVER component
export default function CandidateProfilePage() {
  return (
    <RoleWrapper role={["candidate"]}>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20]">
        <Suspense fallback={<ProfileSkeleton />}>
          <CandidateProfileWrapper />
        </Suspense>
      </div>
    </RoleWrapper>
  );
}

// Server component that fetches data
async function CandidateProfileWrapper() {
  const session = await getServerSession(authOptions);
  const candidateId = session?.user?._id as string;

  // Fetch profile data on the server
  const profileResponse = await fetchCandidateProfile(candidateId || '');

  return (
    <CandidateProfileClient 
      initialProfileData={profileResponse.data}
      initialCompletionPercentage={profileResponse.completionPercentage}
      candidateId={candidateId}
    />
  );
}
