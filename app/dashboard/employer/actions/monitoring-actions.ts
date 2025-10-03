"use server";

import type { CodePreview } from '../types';

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

// Fetch Live Monitoring (CodePreview)
export async function fetchLiveMonitoring(): Promise<{
  success: boolean;
  data: CodePreview[];
}> {
  try {
    return { success: true, data: mockCodePreview };
  } catch (error) {
    console.log(error);
    return { success: false, data: [] };
  }
}
