"use server";

import { dashboardData } from "./data";
import type {
  Stat,
  Activity,
  CandidatesByStage,
  CodePreview,
  Job,
} from "./data";

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
