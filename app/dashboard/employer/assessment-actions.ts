"use server";

import AssessmentModel, { Assessment } from '@/models/assesment.model';
import AptitudeModel, { Aptitude } from '@/models/aptitude.model';
import JobOpportunityModel from '@/models/jobOpportunity.model';
import { connectToDatabase } from '@/utils/connectDb';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

// Create a clean type for assessment creation
export type AssessmentCreationData = Omit<Assessment, keyof Document | 'createdAt' | 'updatedAt'>;

// Export Aptitude type for use in forms
export type { Aptitude };

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

// Utility to generate N unique random numbers between 1 and 31900
function generateUniqueRandomNumbers(count: number, min: number = 1, max: number = 31900): number[] {
  if (count > (max - min + 1)) {
    throw new Error(`Cannot generate ${count} unique numbers in range ${min}-${max}`);
  }
  const numbers = new Set<number>();
  while (numbers.size < count) {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(randomNum);
  }
  return Array.from(numbers);
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

    // Create a clean assessment data object
    const cleanAssessmentData = {
      ...processedData
    };

    let aptitudeId: mongoose.Types.ObjectId | undefined;

    // Handle aptitude round creation separately if enabled
    if (assessmentData.toConductRounds?.aptitude && (assessmentData as any).aptitude) {
      // Create separate Aptitude document
      const aptitudeData = {
        ...(assessmentData as any).aptitude,
        assessmentId: new mongoose.Types.ObjectId(), // Temporary ID, will be updated after assessment creation
        candidateIds: (assessmentData as any).aptitude.candidateIds || [],
        expiredQuestionIds: (assessmentData as any).aptitude.expiredQuestionIds || []
      };
      
      // Generate questionIds here
      aptitudeData.questionIds = generateUniqueRandomNumbers(aptitudeData.totalQuestions);
      
      console.log('Creating aptitude with data:', aptitudeData); // Debug log
      
      const newAptitude = new AptitudeModel(aptitudeData);
      const savedAptitude = await newAptitude.save();
      aptitudeId = savedAptitude._id as mongoose.Types.ObjectId;
      
      console.log('Saved aptitude with questionIds:', savedAptitude.questionIds); // Debug log
      
      // Store only the aptitudeId in assessment
      cleanAssessmentData.aptitudeId = aptitudeId;
    }

    // Remove the embedded aptitude object from assessment data
    if ((cleanAssessmentData as any).aptitude) {
      delete (cleanAssessmentData as any).aptitude;
    }

    // Remove round configs for rounds not enabled
    if (assessmentData.toConductRounds) {
      if (!assessmentData.toConductRounds.aptitude) {
        delete cleanAssessmentData.aptitudeId;
      }
    }

    const newAssessment = new AssessmentModel(cleanAssessmentData);
    const savedAssessment = await newAssessment.save();

    // Update aptitude document with correct assessmentId
    if (aptitudeId) {
      await AptitudeModel.findByIdAndUpdate(aptitudeId, {
        assessmentId: savedAssessment._id
      });
    }

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
      .populate('aptitudeId') // Populate the aptitude data
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

// Fetch single assessment with aptitude data
export async function fetchAssessmentById(assessmentId: string): Promise<{
  success: boolean;
  data?: Assessment;
  message?: string;
}> {
  try {
    await connectToDatabase();

    const assessment = await AssessmentModel.findById(assessmentId)
      .populate('aptitudeId')
      .lean();

    if (!assessment) {
      return {
        success: false,
        message: "Assessment not found"
      };
    }

    return {
      success: true,
      data: {
        ...assessment,
        _id: assessment._id.toString()
      } as Assessment
    };
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to fetch assessment"
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

// Create aptitude round separately
export async function createAptitudeRound(aptitudeData: Omit<Aptitude, keyof Document | 'createdAt' | 'updatedAt'>): Promise<{
  success: boolean;
  message: string;
  data?: Aptitude;
}> {
  try {
    await connectToDatabase();

    const newAptitude = new AptitudeModel(aptitudeData);
    const savedAptitude = await newAptitude.save();

    const aptitudePlain = JSON.parse(JSON.stringify(savedAptitude));
    delete aptitudePlain.__v;

    return {
      success: true,
      message: "Aptitude round created successfully!",
      data: aptitudePlain,
    };
  } catch (error) {
    console.error("Error creating aptitude round:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create aptitude round",
    };
  }
}

// Update aptitude round
export async function updateAptitudeRound(
  aptitudeId: string, 
  updateData: Partial<Omit<Aptitude, keyof Document | 'createdAt' | 'updatedAt'>>
): Promise<{
  success: boolean;
  message: string;
  data?: Aptitude;
}> {
  try {
    await connectToDatabase();

    const updatedAptitude = await AptitudeModel.findByIdAndUpdate(
      aptitudeId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAptitude) {
      return {
        success: false,
        message: "Aptitude round not found"
      };
    }

    const aptitudePlain = JSON.parse(JSON.stringify(updatedAptitude));
    delete aptitudePlain.__v;

    return {
      success: true,
      message: "Aptitude round updated successfully!",
      data: aptitudePlain,
    };
  } catch (error) {
    console.error("Error updating aptitude round:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update aptitude round",
    };
  }
}
