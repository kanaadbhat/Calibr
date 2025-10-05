"use client";

import { 
  PerformanceOverview,
  UpcomingInterviews,
  RecentActivity,
  SkillAnalysis,
  JobRecommendations
} from "./Dashboard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';
import Link from 'next/link';
import type { DashboardData } from "../types.d";

interface DashboardClientProps {
  initialData: DashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-16">
      {/* Sticky Header with Breadcrumb */}
      <div className="sticky top-0 z-30 bg-gradient-to-br from-[#0A0A18]/90 to-[#0D0D20]/90 backdrop-blur-xl border-b border-white/10 pb-4 pt-8 sm:pt-6 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
            Welcome back, John Doe
          </h1>
          <Breadcrumb>
            <BreadcrumbList className="text-white/60">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="flex items-center hover:text-white transition-colors">
                    <Home className="w-4 h-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-semibold">
                  Candidate
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Performance Overview - Full Width */}
        <PerformanceOverview data={initialData.performanceData} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6 lg:mt-8">
          <UpcomingInterviews interviews={initialData.interviews} />
          <RecentActivity activities={initialData.activities} />
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6 lg:mt-8">
          <SkillAnalysis 
            skills={initialData.skillData.skills}
            radarData={initialData.skillData.radarData}
            recommendation={initialData.skillData.recommendation}
          />
          <JobRecommendations jobs={initialData.jobs} />
        </div>
      </div>
    </div>
  );
}
