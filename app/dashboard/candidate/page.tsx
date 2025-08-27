import PerformanceOverview from './_components/PerformanceOverview';
import UpcomingInterviews from './_components/UpcomingInterviews';
import RecentActivity from './_components/RecentActivity';
import SkillAnalysis from './_components/SkillAnalysis';
import JobRecommendations from './_components/JobRecommendations';
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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Sticky Header with Breadcrumb */}
      <div className="sticky top-0 z-30 bg-gradient-to-br from-[#0A0A18]/90 to-[#0D0D20]/90 backdrop-blur-xl border-b border-white/10 pb-6 pt-6">
        <div className="px-2">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, John Doe</h1>
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

      {/* Performance Overview - Full Width */}
      <PerformanceOverview />

      {/* Main Dashboard Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <UpcomingInterviews />
        <RecentActivity />
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SkillAnalysis />
        <JobRecommendations />
      </div>
    </div>
  );
}
