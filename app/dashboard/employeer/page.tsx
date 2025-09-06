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
import { CheckCircle2, PieChart, User2, Megaphone, Home } from "lucide-react";
import Link from "next/link";
import ActivityItem from "./_components/ActivityItem";
import JobListItem from "./_components/JobListItem";
import CodePreview from "./_components/CodePreview";
import CandidateCard from "./_components/CandidateCard";
import Column from "./_components/Column";
import StatCard from "./_components/StatCard";

export default function Page() {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-16">
      <div className="sticky top-0 z-30 bg-gradient-to-br from-[#0A0A18]/90 to-[#0D0D20]/90 backdrop-blur-xl border-b border-white/10 pb-4 sm:pb-6 pt-4 sm:pt-6 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
            Welcome back, John Doe
          </h1>
          <Breadcrumb>
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

      {/* KPI row */}
      <section
        aria-label="KPI cards"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value="12" label="Active Job Postings" />
        <StatCard value="84" label="Candidates in Pipeline" />
        <StatCard value="7" label="Interviews Today" />
        <StatCard value="68%" label="Acceptance Rate" />
      </section>

      {/* Pipeline + Live Monitoring */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#171726] border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-neutral-100">
                Candidate Pipeline
              </CardTitle>
              <Button className="bg-purple-500 text-white font-semibold hover:bg-purple-700">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            {/* Mobile horizontally scrollable columns */}
            <div className="md:hidden -mx-2 px-2 flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory">
              <Column
                title="Applied"
                count={24}
                className="min-w-[260px] snap-start">
                <CandidateCard
                  name="Sarah Johnson"
                  role="Frontend Developer"
                  score="87%"
                  metaLeft="2 days"
                  metaRight="ago"
                />
                <CandidateCard
                  name="Michael Chen"
                  role="Full Stack Engineer"
                  score="92%"
                  metaLeft="1 day"
                  metaRight="ago"
                />
              </Column>
              <Column
                title="Screening"
                count={18}
                className="min-w-[260px] snap-start">
                <CandidateCard
                  name="Emily Rodriguez"
                  role="UX Designer"
                  score="78%"
                  metaLeft="Status:"
                  metaRight="Completed"
                />
              </Column>
              <Column
                title="Interview"
                count={15}
                className="min-w-[260px] snap-start">
                <CandidateCard
                  name="David Kim"
                  role="DevOps Engineer"
                  score="85%"
                  metaLeft="In"
                  metaRight="Progress"
                />
              </Column>
              <Column
                title="Offer"
                count={5}
                className="min-w-[260px] snap-start">
                <CandidateCard
                  name="James Wilson"
                  role="Product Manager"
                  score="94%"
                  metaLeft="Offer"
                  metaRight="Extended"
                />
              </Column>
              <Column
                title="Hired"
                count={22}
                className="min-w-[260px] snap-start">
                <CandidateCard
                  name="Lisa Taylor"
                  role="Backend Developer"
                  score="89%"
                  metaLeft="Started"
                  metaRight="2 weeks ago"
                />
              </Column>
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-2 gap-4">
              <Column title="Applied" count={24}>
                <CandidateCard
                  name="Sarah Johnson"
                  role="Frontend Developer"
                  score="87%"
                  metaLeft="2 days"
                  metaRight="ago"
                />
                <CandidateCard
                  name="Michael Chen"
                  role="Full Stack Engineer"
                  score="92%"
                  metaLeft="1 day"
                  metaRight="ago"
                />
              </Column>
              <Column title="Screening" count={18}>
                <CandidateCard
                  name="Emily Rodriguez"
                  role="UX Designer"
                  score="78%"
                  metaLeft="Status:"
                  metaRight="Completed"
                />
              </Column>
              <Column title="Interview" count={15}>
                <CandidateCard
                  name="David Kim"
                  role="DevOps Engineer"
                  score="85%"
                  metaLeft="In"
                  metaRight="Progress"
                />
              </Column>
              <Column title="Offer" count={5}>
                <CandidateCard
                  name="James Wilson"
                  role="Product Manager"
                  score="94%"
                  metaLeft="Offer"
                  metaRight="Extended"
                />
              </Column>
              <Column title="Hired" count={22}>
                <CandidateCard
                  name="Lisa Taylor"
                  role="Backend Developer"
                  score="89%"
                  metaLeft="Started"
                  metaRight="2 weeks ago"
                />
              </Column>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#171726] border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-neutral-100">
                Live Monitoring
              </CardTitle>
              <Button className="bg-purple-500 text-white font-semibold hover:bg-purple-700">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6">
            <CodePreview
              title="Alex Morgan - Coding Assessment"
              metrics="Code Quality: 87% | Speed: 92% | Originality: 96%"
            />
            <CodePreview
              title="Maria Garcia - Technical Interview"
              metrics="Technical Accuracy: 91% | Communication: 88% | Problem Solving: 94%"
            />
          </CardContent>
        </Card>
      </section>

      {/* Active Job Postings + Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Job Postings */}
        <Card className="lg:col-span-2 bg-[#171726] border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-neutral-100">
                Active Job Postings
              </CardTitle>
              <Button
                size="sm"
                className="bg-purple-500 text-white font-semibold hover:bg-purple-700">
                Create New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-6">
            <JobListItem
              title="Senior Frontend Developer"
              subtitle="React, TypeScript, GraphQL • Remote"
              applications={24}
              inInterview={8}
              rating={4.8}
            />
            <JobListItem
              title="DevOps Engineer"
              subtitle="AWS, Kubernetes, Docker • Hybrid"
              applications={18}
              inInterview={6}
              rating={4.6}
            />
            <JobListItem
              title="Product Manager"
              subtitle="Agile, UX, Strategy • On-site"
              applications={32}
              inInterview={12}
              rating={4.9}
            />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-[#171726] border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-neutral-100">
                Recent Activity
              </CardTitle>
              <Button
                size="sm"
                className="bg-purple-500 text-white font-semibold hover:bg-purple-700">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-3 px-6">
            <ul className="divide-y">
              <ActivityItem
                icon={CheckCircle2}
                intent="success"
                title="New application received from Robert Brown"
                meta="10 minutes ago • Frontend Developer role"
              />
              <ActivityItem
                icon={CheckCircle2}
                intent="success"
                title="Technical interview completed by Sophia Williams"
                meta="45 minutes ago • Score: 92%"
              />
              <ActivityItem
                icon={PieChart}
                intent="info"
                title="Monthly hiring report generated"
                meta="2 hours ago • 28% increase in applications"
              />
              <ActivityItem
                icon={User2}
                intent="user"
                title="Team member Sarah assigned to review candidates"
                meta="3 hours ago • 12 candidates to review"
              />
              <ActivityItem
                icon={Megaphone}
                intent="announce"
                title="New job posting published: Data Scientist"
                meta="5 hours ago • Already 8 applications"
              />
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
