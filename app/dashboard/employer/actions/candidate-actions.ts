"use server";

import type { CandidatesByStage } from '../types';
import { safeAction, createSuccessResponse, type ActionResponse } from '@/utils/action-helpers';

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

// Fetch Candidates (Pipeline)
export async function fetchCandidates(): Promise<ActionResponse<CandidatesByStage>> {
  return safeAction(async () => {
    return createSuccessResponse("Candidates fetched successfully", mockCandidatesByStage);
  }, "Failed to fetch candidates");
}
