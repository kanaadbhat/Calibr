"use server";

import type { Stat } from '../types';

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
export async function fetchStats(): Promise<{
  success: boolean;
  data: Stat[];
}> {
  try {
    return { success: true, data: mockStats };
  } catch (error) {
    console.log(error);
    return { success: false, data: [] };
  }
}
