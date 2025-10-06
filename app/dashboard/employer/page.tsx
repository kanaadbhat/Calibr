import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import RoleWrapper from "@/lib/RoleWrapper";
import {
  fetchStats,
  fetchCandidates,
  fetchLiveMonitoring,
  fetchJobs,
  fetchActivities,
} from "./actions";
import { DashboardClient } from "./_components";

// This is now a SERVER component
export default function Page() {
  return (
    <RoleWrapper role={["employer"]}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardWrapper />
      </Suspense>
    </RoleWrapper>
  );
}

// Server component that fetches data
async function DashboardWrapper() {
  const [statsRes, candidatesRes, monitoringRes, jobsRes, activitiesRes] =
    await Promise.all([
      fetchStats(),
      fetchCandidates(),
      fetchLiveMonitoring(),
      fetchJobs(),
      fetchActivities(),
    ]);

  // Build dashboard data
  const dashboardData = {
    stats: statsRes.success ? (statsRes.data || []) : [],
    candidatesByStage: candidatesRes.success
      ? (candidatesRes.data || {
          applied: [],
          screening: [],
          interview: [],
          offer: [],
          hired: [],
        })
      : {
          applied: [],
          screening: [],
          interview: [],
          offer: [],
          hired: [],
        },
    codePreview: monitoringRes.success ? (monitoringRes.data || []) : [],
    jobs: jobsRes.success ? (jobsRes.data || []) : [],
    activities: activitiesRes.success ? (activitiesRes.data || []) : [],
  };

  return <DashboardClient initialData={dashboardData} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-16">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-30 bg-gradient-to-br from-[#0A0A18]/90 to-[#0D0D20]/90 backdrop-blur-xl border-b border-white/10 pb-4 pt-8 sm:pt-6 px-4 sm:px-6 lg:px-8 xl:px-12">
        <Skeleton className="h-8 w-64 bg-white/10 mb-4" />
        <Skeleton className="h-6 w-96 bg-white/10" />
      </div>

      {/* Content Skeleton */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          <Skeleton className="h-24 w-full bg-white/10" />
          <Skeleton className="h-24 w-full bg-white/10" />
          <Skeleton className="h-24 w-full bg-white/10" />
          <Skeleton className="h-24 w-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}


