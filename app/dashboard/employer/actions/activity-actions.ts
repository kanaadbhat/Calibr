"use server";

import type { Activity } from '../types';
import { safeAction, createSuccessResponse, type ActionResponse } from '@/utils/action-helpers';

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

// Fetch Activities
export async function fetchActivities(): Promise<ActionResponse<Activity[]>> {
  return safeAction(async () => {
    return createSuccessResponse("Activities fetched successfully", mockActivities);
  }, "Failed to fetch activities");
}
