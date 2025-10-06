"use server";

import JobOpportunityModel, { JobOpportunity } from '@/models/jobOpportunity.model';
import { Document } from 'mongoose';
import { 
  safeAction, 
  createSuccessResponse, 
  createErrorResponse,
  withDatabase,
  logSuccess,
  type ActionResponse 
} from '@/utils/action-helpers';
import { requireAuth } from '@/utils/auth-helpers';

export type JobCreationData = Omit<JobOpportunity, keyof Document | 'createdAt' | 'updatedAt' | 'applications' | 'employer'>;
// Create Job Posting
export async function createJobPosting(jobData: JobCreationData): Promise<ActionResponse<JobOpportunity>> {
  return safeAction(async () => {
    // Get authenticated employer ID
    const employerId = await requireAuth();

    // 1. Salary range validation (salaryMax >= salaryMin)
    if (
      jobData.salaryMin !== undefined && 
      jobData.salaryMax !== undefined &&
      jobData.salaryMin !== null &&
      jobData.salaryMax !== null &&
      jobData.salaryMax < jobData.salaryMin
    ) {
      return createErrorResponse('Maximum salary cannot be less than minimum salary');
    }

    // 2. Deadline must be a future date
    if (jobData.deadline !== undefined && jobData.deadline !== null) {
      const deadlineDate = new Date(jobData.deadline);
      if (isNaN(deadlineDate.getTime())) {
        return createErrorResponse('Deadline must be a valid date');
      }
      if (deadlineDate < new Date()) {
        return createErrorResponse('Deadline must be a future date');
      }
    }

    // 3. Tech stack must have at least one item
    if (jobData.techStack && jobData.techStack.length === 0) {
      return createErrorResponse('Tech stack must contain at least one technology');
    }

    return await withDatabase(async () => {
      const newJobPosting = new JobOpportunityModel({
        ...jobData,
        employer: employerId, // Add authenticated employer ID
        deadline: jobData.deadline ? new Date(jobData.deadline) : undefined,
      });

      // Mongoose will validate: required fields, enums, min values, types, trimming
      const savedJob = await newJobPosting.save();
      const jobPlain = JSON.parse(JSON.stringify(savedJob)) as any;
      delete jobPlain.__v;
      delete jobPlain.createdAt;
      delete jobPlain.updatedAt;

      logSuccess("createJobPosting", `Job created: ${savedJob._id}`);
      return createSuccessResponse("Job created", jobPlain);
    }, "Failed to connect to database");
  }, "Failed to create job posting");
}
