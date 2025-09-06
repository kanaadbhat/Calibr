import { CheckCircle, Megaphone, UserPlus } from "lucide-react";

export type Stat = {
  value: string;
  label: string;
  trend: string;
  trendDirection?: "up" | "down";
};

export type Activity = {
  intent: "success" | "info" | "announce";
  title: string;
  meta: string;
  icon: "check-circle" | "user-plus" | "megaphone"; // use string identifiers
};

export type Candidate = {
  name: string;
  role: string;
  metaLeft: string;
  metaRight: string;
  score: string;
};

export type CandidatesByStage = {
  applied: Candidate[];
  screening: Candidate[];
  interview: Candidate[];
  offer: Candidate[];
  hired: Candidate[];
};

export type Job = {
  title: string;
  subtitle: string;
  applications: number;
  inInterview: number;
  rating: number;
};

export type CodePreview = {
  title: string;
  badge: string;
  metrics: string;
};

export type DashboardData = {
  stats: Stat[];
  activities: Activity[];
  candidatesByStage: CandidatesByStage;
  codePreview: CodePreview[];
  jobs: Job[];
};

export const dashboardData: DashboardData = {
  stats: [
    { value: "12", label: "Active Job Postings", trend: "▲ 2" },
    {
      value: "84",
      label: "Candidates in Pipeline",
      trend: "▼ 5",
      trendDirection: "down",
    },
    { value: "7", label: "Interviews Today", trend: "▲ 3" },
    { value: "68%", label: "Acceptance Rate", trend: "+4%" },
  ],

  activities: [
    {
      intent: "success",
      title: "Candidate John Doe accepted offer",
      meta: "2 hours ago",
      icon: "check-circle",
    },
    {
      intent: "info",
      title: "New candidate Jane Smith added to pipeline",
      meta: "5 hours ago",
      icon: "user-plus",
    },
    {
      intent: "announce",
      title: "System maintenance scheduled",
      meta: "1 day ago",
      icon: "megaphone",
    },
  ],

  candidatesByStage: {
    applied: [
      {
        name: "Alice Johnson",
        role: "Frontend Developer",
        metaLeft: "2 days",
        metaRight: "ago",
        score: "87",
      },
      {
        name: "Mark Chen",
        role: "Backend Engineer",
        metaLeft: "5 days",
        metaRight: "ago",
        score: "74",
      },
    ],
    screening: [
      {
        name: "Emily Rodriguez",
        role: "UX Designer",
        metaLeft: "Status:",
        metaRight: "Completed",
        score: "78",
      },
    ],
    interview: [
      {
        name: "David Kim",
        role: "DevOps Engineer",
        metaLeft: "In",
        metaRight: "Progress",
        score: "85",
      },
    ],
    offer: [
      {
        name: "James Wilson",
        role: "Product Manager",
        metaLeft: "Offer",
        metaRight: "Extended",
        score: "94",
      },
    ],
    hired: [
      {
        name: "Lisa Taylor",
        role: "Backend Developer",
        metaLeft: "Started",
        metaRight: "2 weeks ago",
        score: "89",
      },
    ],
  },
  codePreview: [
    {
      title: "Live Monitoring",
      badge: "LIVE",
      metrics: "No anomalies detected in last 24h",
    },
    {
      title: "Alex Morgan - Coding Assessment",
      metrics: "Code Quality: 87% | Speed: 92% | Originality: 96%",
      badge: "LIVE",
    },
  ],

  jobs: [
    {
      title: "React Developer",
      subtitle: "Frontend role, remote",
      applications: 45,
      inInterview: 8,
      rating: 4.5,
    },
    {
      title: "Data Scientist",
      subtitle: "ML/NLP focus",
      applications: 60,
      inInterview: 12,
      rating: 4.8,
    },
  ],
};
