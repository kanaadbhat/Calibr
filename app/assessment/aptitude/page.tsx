import React, { Suspense } from 'react';
import RoleWrapper from '@/lib/RoleWrapper';
import { AptitudeExamClient } from './_components/AptitudeExam';

export default function AptitudeExamPage() {
    return (
    <RoleWrapper role={["candidate"]}>
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] via-[#0D0D20] to-[#0A0A18]">
        <Suspense fallback={<AptitudeExamSkeleton />}>
          <AptitudeExamWrapper />
        </Suspense>
      </div>
    </RoleWrapper>
    );
  }


async function AptitudeExamWrapper() {
    return (
    <AptitudeExamClient />
    );
  }

function AptitudeExamSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] via-[#0D0D20] to-[#0A0A18] flex items-center justify-center">
      <div className="text-white/70">Loading aptitude assessment...</div>
    </div>
  );
}
