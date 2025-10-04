"use server";

import type { Job } from '../types';
import JobOpportunityModel, { JobOpportunity } from '@/models/jobOpportunity.model';
import { Document } from 'mongoose';
import { 
  safeAction, 
  createSuccessResponse, 
  withDatabase, 
  type ActionResponse 
} from '@/utils/action-helpers';

// Create a clean type for job creation
export type JobCreationData = Omit<JobOpportunity, keyof Document | 'createdAt' | 'updatedAt' | 'applications'>;

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

// Fetch Jobs
export async function fetchJobs(): Promise<ActionResponse<Job[]>> {
  return safeAction(async () => {
    return createSuccessResponse("Jobs fetched successfully", mockJobs);
  }, "Failed to fetch jobs");
}

// Create Job Posting
export async function createJobPosting(jobData: JobCreationData): Promise<ActionResponse<JobOpportunity>> {
  return safeAction(async () => {
    return await withDatabase(async () => {
      const newJobPosting = new JobOpportunityModel({
        ...jobData,
        deadline: jobData.deadline ? new Date(jobData.deadline) : undefined,
      });

      const savedJob = await newJobPosting.save();
      const jobPlain = JSON.parse(JSON.stringify(savedJob)) as any;
      delete jobPlain.__v;
      delete jobPlain.createdAt;
      delete jobPlain.updatedAt;

      return createSuccessResponse("Job posting created successfully!", jobPlain);
    }, "Failed to connect to database");
  }, "Failed to create job posting");
}
