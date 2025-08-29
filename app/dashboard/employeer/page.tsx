import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription>{label}</CardDescription>
      </CardContent>
    </Card>
  );
}

function Column({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border bg-background">
      <div className="flex items-baseline justify-between px-4 py-3">
        <h4 className="font-semibold">
          {title} <span className="text-muted-foreground">({count})</span>
        </h4>
      </div>
      <div className="px-3 pb-3 space-y-3">{children}</div>
    </div>
  );
}

function CandidateCard({
  name,
  role,
  metaLeft,
  metaRight,
  score,
}: {
  name: string;
  role: string;
  metaLeft: string;
  metaRight: string;
  score: string;
}) {
  return (
    <div className="rounded-md border bg-card">
      <div className="px-4 py-3">
        <div className="font-semibold leading-5">{name}</div>
        <div className="text-xs text-muted-foreground">{role}</div>
      </div>
      <div className="px-4 pb-3 text-xs text-muted-foreground">
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
  );
}

function CodePreview({
  title,
  badge = "LIVE",
  metrics,
}: {
  title: string;
  badge?: string;
  metrics: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <span className="text-xs font-medium rounded border px-1.5 py-0.5">
            {badge}
          </span>
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
        <div className="text-xs">
          <span className="font-semibold">Metrics: </span>
          {metrics}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  return (
    <div className="space-y-6">
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
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Candidate Pipeline</CardTitle>
              <button className="text-sm text-primary underline-offset-4 hover:underline">
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-4">
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

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Live Monitoring</CardTitle>
              <button className="text-sm text-primary underline-offset-4 hover:underline">
                View All
              </button>
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
    </div>
  );
}
