import React, { Suspense } from 'react';
import RoleWrapper from '@/lib/RoleWrapper';
import ExamProtectionWrapper from '@/lib/ExamProtectionWrapper';
import CountdownWrapper from '@/lib/CountdownWrapper';
import { startTestSession, getServerTimeLeft } from '../actions';
import { WarningProvider } from '@/lib/WarningContext';
import AptitudeExamClient from '../_components/AptitudeExam';
import AlreadyAttempted from '../../../../components/AlreadyAttempted';
import { fetchTestSession } from '../actions';

interface AptitudeExamPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AptitudeExamPage({ params }: AptitudeExamPageProps) {
  const resolvedParams = await params;
  const { id: aptitudeId } = resolvedParams;
  
  // Fetch test session data to get dynamic warning limits
  const testSession = await fetchTestSession(aptitudeId);
  
  if (!testSession.success || !testSession.data) {
    // Check if it's an already attempted 
    if (testSession.error === 'already_attempted') {
      return (
        <RoleWrapper role={["candidate"]}>
          <AlreadyAttempted />
        </RoleWrapper>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] via-[#0D0D20] to-[#0A0A18] flex items-center justify-center">
        <div className="text-white/70">
          {testSession.error || 'Failed to load test session'}
        </div>
      </div>
    );
  }
  
  const { warnings, duration } = testSession.data;

  return (
    <RoleWrapper role={["candidate"]}>
      <WarningProvider
        tabSwitchLimit={warnings.tabSwitch}
        fullscreenExitLimit={warnings.fullscreen}
        audioWarningLimit={warnings.audio}
      >
        <ExamProtectionWrapper countdownSeconds={10}>
          <CountdownWrapper
            testId={aptitudeId}
            durationMinutes={duration}
            serverActions={{
              startSession: startTestSession,
              getTimeLeft: getServerTimeLeft
            }}
            localStoragePrefix="aptitude"
          >
            <Suspense fallback={<AptitudeExamSkeleton />}>
              <AptitudeExamWrapper aptitudeId={aptitudeId} />
            </Suspense>
          </CountdownWrapper>
        </ExamProtectionWrapper>
      </WarningProvider>
    </RoleWrapper>
  );
}

function AptitudeExamWrapper({ aptitudeId }: { aptitudeId: string }) {
  return <AptitudeExamClient aptitudeId={aptitudeId} />;
}

function AptitudeExamSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] via-[#0D0D20] to-[#0A0A18] flex items-center justify-center">
      <div className="text-white/70">Loading aptitude assessment...</div>
    </div>
  );
}
