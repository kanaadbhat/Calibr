"use server";

import AssessmentModel, { Assessment } from '@/models/assesment.model';
import JobOpportunityModel from '@/models/jobOpportunity.model';
import { connectToDatabase } from '@/utils/connectDb';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

// Create a clean type for assessment creation
export type AssessmentCreationData = Omit<Assessment, keyof Document | 'createdAt' | 'updatedAt'>;

// Simplified job data for assessment selection
export interface JobForAssessment {
  _id: string;
  title: string;
  department: string;
  position: string;
  employmentType: string;
  seniority: string;
  locationType: string;
  location: string;
  openings: number;
  createdAt: string;
  status: string;
}

// Fetch job postings for assessment selection
export async function fetchJobPostingsForAssessment(): Promise<{
  success: boolean;
  data: JobForAssessment[];
  message?: string;
}> {
  try {
    await connectToDatabase();

    // For now, fetch all jobs. Later add employerId filter
    const jobs = await JobOpportunityModel.find({})
      .select('title department position employmentType seniority locationType location openings createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const formattedJobs: JobForAssessment[] = jobs.map(job => ({
      _id: job._id.toString(),
      title: job.title,
      department: job.department,
      position: job.position,
      employmentType: job.employmentType,
      seniority: job.seniority,
      locationType: job.locationType,
      location: job.location,
      openings: job.openings,
      createdAt: (job as any).createdAt?.toISOString() || new Date().toISOString(),
      status: 'active' // Add status logic if needed
    }));

    return {
      success: true,
      data: formattedJobs
    };
  } catch (error) {
    console.error("Error fetching job postings for assessment:", error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Failed to fetch job postings"
    };
  }
}

// Create a new assessment
export async function createAssessment(assessmentData: AssessmentCreationData): Promise<{
  success: boolean;
  message: string;
  data?: Assessment;
}> {
  try {
    await connectToDatabase();

    // Convert string IDs back to ObjectIds for database storage
    const processedData = {
      ...assessmentData,
      jobOpportunity: assessmentData.jobOpportunity ? new mongoose.Types.ObjectId(assessmentData.jobOpportunity as unknown as string) : undefined,
      employer: new mongoose.Types.ObjectId(assessmentData.employer as unknown as string)
    };

    // Create a clean assessment data object, only including enabled rounds
    const cleanAssessmentData = {
      ...processedData
    };

    // Remove round configs for rounds not enabled (only aptitude is supported for now)
    if (assessmentData.toConductRounds) {
      if (!assessmentData.toConductRounds.aptitude) {
        delete cleanAssessmentData.aptitude;
      }
      // Other rounds are commented out in the model for now
      /*
      if (!assessmentData.toConductRounds.coding) {
        delete cleanAssessmentData.coding;
      }
      if (!assessmentData.toConductRounds.technicalInterview) {
        delete cleanAssessmentData.technicalInterview;
      }
      if (!assessmentData.toConductRounds.hrInterview) {
        delete cleanAssessmentData.hrInterview;
      }
      */
    }

    const newAssessment = new AssessmentModel(cleanAssessmentData);
    const savedAssessment = await newAssessment.save();

    // Convert to plain object using JSON serialization to avoid circular references
    const assessmentPlain = JSON.parse(JSON.stringify(savedAssessment));
    delete assessmentPlain.__v;
    delete assessmentPlain.createdAt;
    delete assessmentPlain.updatedAt;

    return {
      success: true,
      message: "Assessment created successfully!",
      data: assessmentPlain,
    };
  } catch (error) {
    console.error("Error creating assessment:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create assessment",
    };
  }
}

// Fetch assessments for a specific job
export async function fetchAssessmentsForJob(jobId: string): Promise<{
  success: boolean;
  data: Assessment[];
  message?: string;
}> {
  try {
    await connectToDatabase();

    const assessments = await AssessmentModel.find({ jobOpportunity: jobId })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: assessments.map(assessment => ({
        ...assessment,
        _id: assessment._id.toString()
      })) as Assessment[]
    };
  } catch (error) {
    console.error("Error fetching assessments for job:", error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Failed to fetch assessments"
    };
  }
}

// Update an existing assessment
export async function updateAssessment(
  assessmentId: string, 
  updateData: Partial<AssessmentCreationData>
): Promise<{
  success: boolean;
  message: string;
  data?: Assessment;
}> {
  try {
    await connectToDatabase();

    const updatedAssessment = await AssessmentModel.findByIdAndUpdate(
      assessmentId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAssessment) {
      return {
        success: false,
        message: "Assessment not found"
      };
    }

    // Convert to plain object
    const assessmentPlain = JSON.parse(JSON.stringify(updatedAssessment));
    delete assessmentPlain.__v;

    return {
      success: true,
      message: "Assessment updated successfully!",
      data: assessmentPlain,
    };
  } catch (error) {
    console.error("Error updating assessment:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update assessment",
    };
  }
}

// Fetch single job details for assessment creation
export async function fetchJobForAssessment(jobId: string): Promise<{
  success: boolean;
  data?: JobForAssessment;
  message?: string;
}> {
  try {
    await connectToDatabase();

    const job = await JobOpportunityModel.findById(jobId)
      .select('title department position employmentType seniority locationType location openings createdAt')
      .lean();

    if (!job) {
      return {
        success: false,
        message: "Job not found"
      };
    }

    const formattedJob: JobForAssessment = {
      _id: job._id.toString(),
      title: job.title,
      department: job.department,
      position: job.position,
      employmentType: job.employmentType,
      seniority: job.seniority,
      locationType: job.locationType,
      location: job.location,
      openings: job.openings,
      createdAt: (job as any).createdAt?.toISOString() || new Date().toISOString(),
      status: 'active'
    };

    return {
      success: true,
      data: formattedJob
    };
  } catch (error) {
    console.error("Error fetching job for assessment:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch job details"
    };
  }
}
