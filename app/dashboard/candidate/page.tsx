import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import RoleWrapper from "@/lib/RoleWrapper";
import {
  fetchPerformanceData,
  fetchUpcomingInterviews,
  fetchRecentActivity,
  fetchSkillAnalysis,
  fetchJobRecommendations,
} from "./actions";
import { DashboardClient } from "./_components";

// This is now a SERVER component
export default function Page() {
  return (
    <RoleWrapper role={["candidate"]}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardWrapper />
      </Suspense>
    </RoleWrapper>
  );
}

// Server component that fetches data
async function DashboardWrapper() {
  const [performanceRes, interviewsRes, activitiesRes, skillsRes, jobsRes] =
    await Promise.all([
      fetchPerformanceData(),
      fetchUpcomingInterviews(),
      fetchRecentActivity(),
      fetchSkillAnalysis(),
      fetchJobRecommendations(),
    ]);

  // Build dashboard data
  const dashboardData = {
    performanceData: performanceRes.success ? performanceRes.data : {} as any,
    interviews: interviewsRes.success ? (interviewsRes.data || []) : [],
    activities: activitiesRes.success ? (activitiesRes.data || []) : [],
    skillData: skillsRes.success ? (skillsRes.data || { skills: [], radarData: [], recommendation: '' }) : { skills: [], radarData: [], recommendation: '' },
    jobs: jobsRes.success ? (jobsRes.data || []) : [],
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
        <Skeleton className="h-32 w-full bg-white/10 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Skeleton className="h-64 w-full bg-white/10" />
          <Skeleton className="h-64 w-full bg-white/10" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6 lg:mt-8">
          <Skeleton className="h-64 w-full bg-white/10" />
          <Skeleton className="h-64 w-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}
