"use server";

import type { Job } from '../types';
import JobOpportunityModel, { JobOpportunity } from '@/models/jobOpportunity.model';
import { connectToDatabase } from '@/utils/connectDb';
import { Document } from 'mongoose';

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
export async function fetchJobs(): Promise<{ success: boolean; data: Job[] }> {
  try {
    return { success: true, data: mockJobs };
  } catch (error) {
    console.log(error);
    return { success: false, data: [] };
  }
}

// Create Job Posting
export async function createJobPosting(jobData: JobCreationData): Promise<{ 
  success: boolean; 
  message: string; 
  data?: JobOpportunity 
}> {
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
