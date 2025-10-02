"use server";
import type {
  Stat,
  Activity,
  CandidatesByStage,
  CodePreview,
  Job,
  DashboardData
} from './types';

import JobOpportunityModel, { JobOpportunity } from '@/models/jobOpportunity.model';
import { connectToDatabase } from '@/utils/connectDb';
import { Document } from 'mongoose';

// Create a clean type for job creation
export type JobCreationData = Omit<JobOpportunity, keyof Document | 'createdAt' | 'updatedAt' | 'applications'>;

 const dashboardData: DashboardData = {
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

// Fetch Stats
export async function fetchStats(): Promise<{
  success: boolean;
  data: Stat[];
}> {
  try {
    return { success: true, data: dashboardData.stats };
  } catch (error) {
    console.log(error);
    return { success: false, data: [] };
  }
}

// Fetch Activities
export async function fetchActivities(): Promise<{
  success: boolean;
  data: Activity[];
}> {
  try {
    return { success: true, data: dashboardData.activities };
  } catch (error) {
    console.log(error);
    return { success: false, data: [] };
  }
}

// Fetch Candidates (Pipeline)
export async function fetchCandidates(): Promise<{
  success: boolean;
  data: CandidatesByStage;
}> {
  try {
    return { success: true, data: dashboardData.candidatesByStage };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: { applied: [], screening: [], interview: [], offer: [], hired: [] },
    };
  }
}

// Fetch Live Monitoring (CodePreview)
export async function fetchLiveMonitoring(): Promise<{
  success: boolean;
  data: CodePreview[];
}> {
  try {
    return { success: true, data: dashboardData.codePreview };
  } catch (error) {
    console.log(error);
    return { success: false, data: [] };
  }
}

// Fetch Jobs
export async function fetchJobs(): Promise<{ success: boolean; data: Job[] }> {
  try {
    return { success: true, data: dashboardData.jobs };
  } catch (error) {
    console.log(error);
    return { success: false, data: [] };
  }
}

// Create Job Posting
export async function createJobPosting(jobData: JobCreationData): Promise<{ success: boolean; message: string; data?: JobOpportunity }> {
  try {
    await connectToDatabase();

    const newJobPosting = new JobOpportunityModel({
      ...jobData,
      deadline: jobData.deadline ? new Date(jobData.deadline) : undefined,
    });

    const savedJob = await newJobPosting.save();
    const jobPlain = JSON.parse(JSON.stringify(savedJob)) as any;
    delete jobPlain.__v;
    delete jobPlain.createdAt;
    delete jobPlain.updatedAt;

    return {
      success: true,
      message: "Job posting created successfully!",
      data: jobPlain,
    };
  } catch (error) {
    console.error("Error creating job posting:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create job posting",
    };
  }
}
