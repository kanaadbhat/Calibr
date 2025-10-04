"use server";

import type { Stat } from '../types';
import { safeAction, createSuccessResponse, type ActionResponse } from '@/utils/action-helpers';

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

// Fetch Stats
export async function fetchStats(): Promise<ActionResponse<Stat[]>> {
  return safeAction(async () => {
    return createSuccessResponse("Stats fetched successfully", mockStats);
  }, "Failed to fetch stats");
}
