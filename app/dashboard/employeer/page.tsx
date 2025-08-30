"use client"

import type React from "react"
// Dashboard content (cards, pipeline, live monitoring)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, Star, CheckCircle2, PieChart, User2, Megaphone } from "lucide-react"

function StatCard({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <Card className="bg-[#171726] border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-3xl font-semibold text-neutral-100">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-neutral-300">{label}</CardDescription>
      </CardContent>
    </Card>
  )
}

function Column({
  title,
  count,
  children,
  className,
}: {
  title: string
  count: number
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-md bg-[#171726] ${className || ""}`}>
      <div className="flex items-baseline justify-between px-4 py-3">
        <h4 className="font-semibold text-neutral-200">
          {title} <span className="text-neutral-200">({count})</span>
        </h4>
      </div>
      <div className="px-3 pb-3 space-y-3">{children}</div>
    </div>
  )
}

function CandidateCard({
  name,
  role,
  metaLeft,
  metaRight,
  score,
}: {
  name: string
  role: string
  metaLeft: string
  metaRight: string
  score: string
}) {
  return (
    <div className="rounded-md bg-[#282036]">
      <div className="px-4 py-3">
        <div className="font-semibold leading-5 text-neutral-300">{name}</div>
        <div className="text-xs text-muted-foreground text-neutral-400">{role}</div>
      </div>
      <div className="px-4 pb-3 text-xs text-neutral-400">
        <div className="flex items-center justify-between">
          <span>Score:</span>
          <span>{score}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{metaLeft}</span>
          <span>{metaRight}</span>
        </div>
      </div>
    </div>
  )
}

function CodePreview({
  title,
  badge = "LIVE",
  metrics,
}: {
  title: string
  badge?: string
  metrics: string
}) {
  return (
    <Card className="bg-[#282036] border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-neutral-300">{title}</CardTitle>
          <span className="text-xs font-medium text-red-500 border border-red-500 rounded px-1.5 py-0.5">{badge}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <pre className="rounded-md border bg-zinc-950 text-zinc-100 p-3 text-xs overflow-auto">
            {`function calculateScore(ans) {
  let score = 0;
  // Calculating
  // total score...
}`}
          </pre>
          <pre className="rounded-md border bg-zinc-950 text-zinc-100 p-3 text-xs overflow-auto">
            {`[Video Feed Preview]
Candidate is focused
No proctoring flags`}
          </pre>
        </div>
        <div className="text-xs text-neutral-300">
          <span className="font-semibold">Metrics: </span>
          {metrics}
        </div>
      </CardContent>
    </Card>
  )
}

function JobListItem({
  title,
  subtitle,
  applications,
  inInterview,
  rating,
}: {
  title: string
  subtitle: string
  applications: number
  inInterview: number
  rating: number
}) {
  return (
    <div className="rounded-md bg-[#282036] px-4 py-3">
      <div className="font-semibold text-neutral-100">{title}</div>
      <div className="text-xs text-neutral-300">{subtitle}</div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 text-neutral-300">
          <FileText className="h-4 w-4" aria-hidden="true" /> {applications} Applications
        </span>
        <span className="inline-flex items-center gap-1 text-neutral-300">
          <Users className="h-4 w-4" aria-hidden="true" /> {inInterview} in Interview
        </span>
        <span className="inline-flex items-center gap-1 text-neutral-300">
          <Star className="h-4 w-4 text-yellow-500" aria-hidden="true" />
          {rating.toFixed(1)}/5 Rating
        </span>
      </div>
    </div>
  )
}

function ActivityItem({
  icon: Icon,
  title,
  meta,
  intent = "default",
}: {
  icon: React.ElementType
  title: string
  meta: string
  intent?: "success" | "info" | "user" | "announce" | "default"
}) {
  const intentClasses =
    intent === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
      : intent === "info"
        ? "bg-blue-50 border-blue-200 text-blue-600"
        : intent === "user"
          ? "bg-slate-50 border-slate-200 text-slate-700"
          : intent === "announce"
            ? "bg-rose-50 border-rose-200 text-rose-600"
            : "bg-zinc-50 border-zinc-200 text-zinc-600"

  return (
    <li className="flex items-start gap-3 py-3">
      <div
        className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border ${intentClasses}`}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium leading-5 text-neutral-200">{title}</div>
        <div className="text-xs text-muted-foreground text-neutral-300">{meta}</div>
      </div>
    </li>
  )
}

export default function Page() {
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <section aria-label="KPI cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value="12" label="Active Job Postings" />
        <StatCard value="84" label="Candidates in Pipeline" />
        <StatCard value="7" label="Interviews Today" />
        <StatCard value="68%" label="Acceptance Rate" />
      </section>

      {/* Pipeline + Live Monitoring */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#171726] border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-neutral-100">Candidate Pipeline</CardTitle>
              <button className="text-sm text-primary underline-offset-4 hover:underline">View All</button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile horizontally scrollable columns */}
            <div className="md:hidden -mx-2 px-2 flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory">
              <Column title="Applied" count={24} className="min-w-[260px] snap-start">
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
              <Column title="Screening" count={18} className="min-w-[260px] snap-start">
                <CandidateCard
                  name="Emily Rodriguez"
                  role="UX Designer"
                  score="78%"
                  metaLeft="Status:"
                  metaRight="Completed"
                />
              </Column>
              <Column title="Interview" count={15} className="min-w-[260px] snap-start">
                <CandidateCard name="David Kim" role="DevOps Engineer" score="85%" metaLeft="In" metaRight="Progress" />
              </Column>
              <Column title="Offer" count={5} className="min-w-[260px] snap-start">
                <CandidateCard
                  name="James Wilson"
                  role="Product Manager"
                  score="94%"
                  metaLeft="Offer"
                  metaRight="Extended"
                />
              </Column>
              <Column title="Hired" count={22} className="min-w-[260px] snap-start">
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
                <CandidateCard name="David Kim" role="DevOps Engineer" score="85%" metaLeft="In" metaRight="Progress" />
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
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-neutral-100">Live Monitoring</CardTitle>
              <button className="text-sm text-primary underline-offset-4 hover:underline">View All</button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-neutral-100">Active Job Postings</CardTitle>
              <Button size="sm" className="bg-purple-500 text-white font-semibold hover:bg-purple-700">
                Create New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
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
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-neutral-100">Recent Activity</CardTitle>
              <Button size="sm" className="bg-purple-500 text-white font-semibold hover:bg-purple-700">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
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
  )
}
