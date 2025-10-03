"use server";

import type { Activity } from '../types';

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
export async function fetchActivities(): Promise<{
  success: boolean;
  data: Activity[];
}> {
  try {
    return { success: true, data: mockActivities };
  } catch (error) {
    console.log(error);
    return { success: false, data: [] };
  }
}
