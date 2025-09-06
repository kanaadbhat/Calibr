"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import Link from "next/link";
import ActivityItem from "./_components/ActivityItem";
import JobListItem from "./_components/JobListItem";
import CodePreview from "./_components/CodePreview";
import CandidateCard from "./_components/CandidateCard";
import Column from "./_components/Column";
import StatCard from "./_components/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchStats,
  fetchCandidates,
  fetchLiveMonitoring,
  fetchJobs,
  fetchActivities,
} from "./actions";
import { useEffect, useState } from "react";
import { DashboardData, Stat } from "./data";

export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, candidatesRes, monitoringRes, jobsRes, activitiesRes] =
          await Promise.all([
            fetchStats(),
            fetchCandidates(),
            fetchLiveMonitoring(),
            fetchJobs(),
            fetchActivities(),
          ]);

        // Build DashboardData object
        const dashboard: DashboardData = {
          stats: statsRes.success ? statsRes.data : [],
          candidatesByStage: candidatesRes.success
            ? candidatesRes.data
            : {
                applied: [],
                screening: [],
                interview: [],
                offer: [],
                hired: [],
              },
          codePreview: monitoringRes.success ? monitoringRes.data : [],
          jobs: jobsRes.success ? jobsRes.data : [],
          activities: activitiesRes.success ? activitiesRes.data : [],
        };

        setData(dashboard);
      } catch (error) {
        console.error("❌ Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-16 grid grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-16">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-br from-[#0A0A18]/90 to-[#0D0D20]/90 backdrop-blur-xl border-b border-white/10 pb-4 pt-8 sm:pt-6 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
            Welcome back, John Doe
          </h1>
          <Breadcrumb className="mt-4">
            <BreadcrumbList className="text-white/60">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/"
                    className="flex items-center hover:text-white transition-colors">
                    <Home className="w-4 h-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/dashboard"
                    className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/40" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-semibold">
                  Employer
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* --- IMPORTANT: wrapper uses same horizontal padding as the header so left edges align --- */}
      <div className="px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* KPI row */}
        <section
          aria-label="KPI cards"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
          {data?.stats.map((stat: Stat, index: number) => (
            <StatCard {...stat} key={index} />
          ))}
        </section>

        {/* Pipeline + Live Monitoring */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-8">
          <Card className="lg:col-span-2 bg-[#171726] border-0">
            <CardHeader className="pb-2 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-neutral-100">
                  Candidate Pipeline
                </CardTitle>
                <Button className="bg-purple-500 text-white font-semibold hover:bg-purple-700">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4">
              {/* Mobile horizontally scrollable columns */}
              <div className="md:hidden -mx-2 px-2 flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory">
                {Object.entries(data?.candidatesByStage ?? {}).map(
                  ([stage, candidates]) => (
                    <Column
                      key={stage}
                      title={stage.charAt(0).toUpperCase() + stage.slice(1)} // Capitalize stage
                      count={candidates.length}
                      className="min-w-[260px] snap-start">
                      {candidates.map((candidate, index) => (
                        <CandidateCard
                          key={index}
                          name={candidate.name}
                          role={candidate.role}
                          score={candidate.score + "%"}
                          metaLeft={candidate.metaLeft}
                          metaRight={candidate.metaRight}
                        />
                      ))}
                    </Column>
                  )
                )}
              </div>

              {/* Desktop grid */}
              <div className="hidden md:grid md:grid-cols-2 gap-3">
                {Object.entries(data?.candidatesByStage ?? {}).map(
                  ([stage, candidates]) => (
                    <Column
                      key={stage}
                      title={stage.charAt(0).toUpperCase() + stage.slice(1)} // Capitalize stage
                      count={candidates.length}>
                      {candidates.map((candidate, index) => (
                        <CandidateCard
                          key={index}
                          name={candidate.name}
                          role={candidate.role}
                          score={candidate.score + "%"}
                          metaLeft={candidate.metaLeft}
                          metaRight={candidate.metaRight}
                        />
                      ))}
                    </Column>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#171726] border-0">
            <CardHeader className="pb-2 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-neutral-100">
                  Live Monitoring
                </CardTitle>
                <Button className="bg-purple-500 text-white font-semibold hover:bg-purple-700">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4">
              {data?.codePreview.map((codePreview, index) => (
                <CodePreview {...codePreview} key={index} />
              ))}
            </CardContent>
          </Card>
        </section>

        {/* Active Job Postings + Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Active Job Postings */}
          <Card className="lg:col-span-2 bg-[#171726] border-0">
            <CardHeader className="pb-2 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-neutral-100">
                  Active Job Postings
                </CardTitle>
                <Button
                  size="sm"
                  className="bg-purple-500 text-white font-semibold hover:bg-purple-700">
                  Create New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-4">
              {data?.jobs.map((job, index) => (
                <JobListItem {...job} key={index} />
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-[#171726] border-0">
            <CardHeader className="pb-2 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-neutral-100">
                  Recent Activity
                </CardTitle>
                <Button
                  size="sm"
                  className="bg-purple-500 text-white font-semibold hover:bg-purple-700">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2 px-4">
              <ul className="divide-y">
                {data?.activities.map((activity: any, index: number) => (
                  <ActivityItem {...activity} key={index} />
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
