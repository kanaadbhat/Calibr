"use client";

import { useState } from 'react';
import { 
  PerformanceOverview,
  UpcomingInterviews,
  RecentActivity,
  SkillAnalysis,
  JobRecommendations
} from "./Dashboard";
import { MyApplications } from "./MyApplications";
import Sidebar from './Sidebar';
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
import { useRouter } from 'next/navigation';
import type { DashboardData } from "../types.d";

type ViewType = 'dashboard' | 'my-applications' | 'job-opportunities';

interface DashboardClientProps {
  initialData: DashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case 'my-applications':
        return 'My Applications';
      case 'job-opportunities':
        return 'Job Opportunities';
      default:
        return 'Candidate Dashboard';
    }
  };

  const getBreadcrumbPage = () => {
    switch (currentView) {
      case 'my-applications':
        return 'My Applications';
      case 'job-opportunities':
        return 'Job Opportunities';
      default:
        return 'Candidate';
    }
  };

  // Handle view changes
  const handleViewChange = (view: ViewType) => {
    if (view === 'job-opportunities') {
      router.push('/job-opportunities');
    } else {
      setCurrentView(view);
    }
  };

  return (
    <>
      {/* Sidebar - only show on desktop */}
      <div className={`hidden md:block fixed left-0 top-0 h-screen transition-all duration-300 z-40 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentView={currentView}
          onViewChange={handleViewChange}
        />
      </div>

      {/* Main content with left margin for sidebar */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Sticky Header with Breadcrumb */}
          <div className="sticky top-16 z-30 bg-gradient-to-br from-[#0A0A18]/90 to-[#0D0D20]/90 backdrop-blur-xl border-b border-white/10 pb-4 pt-4 px-4 sm:px-6 lg:px-8 xl:px-12">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
                {currentView === 'dashboard' ? 'Welcome back, John Doe' : getBreadcrumbTitle()}
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
                      {getBreadcrumbPage()}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
            {currentView === 'dashboard' ? (
              <>
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
              </>
            ) : (
              <MyApplications />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
