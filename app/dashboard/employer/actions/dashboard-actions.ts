"use server";

import type { Stat, Activity, CandidatesByStage, CodePreview, Job } from '../types';
import { 
  safeAction, 
  createSuccessResponse, 
  type ActionResponse 
} from '@/utils/action-helpers';

// ========================================
// MOCK DATA
// ========================================

const mockStats: Stat[] = [
  { value: "12", label: "Active Job Postings", trend: "▲ 2" },
  {
    value: "84",
    label: "Candidates in Pipeline",
    trend: "▼ 5",
    trendDirection: "down",
  },
  { value: "7", label: "Interviews Today", trend: "▲ 3" },
  { value: "68%", label: "Acceptance Rate", trend: "+4%" },
];

const mockActivities: Activity[] = [
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
];

const mockCandidatesByStage: CandidatesByStage = {
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
};

const mockCodePreview: CodePreview[] = [
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
];

const mockJobs: Job[] = [
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
];

// ========================================
// DASHBOARD DATA ACTIONS
// ========================================

// Fetch Stats
export async function fetchStats(): Promise<ActionResponse<Stat[]>> {
  return safeAction(async () => {
    return createSuccessResponse("Stats fetched", mockStats);
  }, "Failed to fetch stats");
}

// Fetch Activities
export async function fetchActivities(): Promise<ActionResponse<Activity[]>> {
  return safeAction(async () => {
    return createSuccessResponse("Activities fetched", mockActivities);
  }, "Failed to fetch activities");
}

// Fetch Candidates (Pipeline)
export async function fetchCandidates(): Promise<ActionResponse<CandidatesByStage>> {
  return safeAction(async () => {
    return createSuccessResponse("Candidates fetched", mockCandidatesByStage);
  }, "Failed to fetch candidates");
}

// Fetch Live Monitoring (CodePreview)
export async function fetchLiveMonitoring(): Promise<ActionResponse<CodePreview[]>> {
  return safeAction(async () => {
    return createSuccessResponse("Live monitoring data fetched", mockCodePreview);
  }, "Failed to fetch live monitoring data");
}

// Fetch Jobs
export async function fetchJobs(): Promise<ActionResponse<Job[]>> {
  return safeAction(async () => {
    return createSuccessResponse("Jobs fetched", mockJobs);
  }, "Failed to fetch jobs");
}


