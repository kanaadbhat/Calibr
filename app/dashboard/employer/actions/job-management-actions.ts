"use server";

import JobOpportunityModel from '@/models/jobOpportunity.model';
import AssessmentModel from '@/models/assesment.model';
import AptitudeModel from '@/models/aptitude.model';
import ApplicationModel from '@/models/application.model';
import mongoose from 'mongoose';
import {
  safeAction,
  createSuccessResponse,
  createErrorResponse,
  withDatabase,
  type ActionResponse
} from '@/utils/action-helpers';
import { requireAuth } from '@/utils/auth-helpers';

// ========================================
// TYPES
// ========================================

export interface JobOpening {
  _id: string;
  title: string;
  department: string;
  position: string;
  employmentType: string;
  seniority: string;
  locationType: string;
  location: string;
  openings: number;
  experience?: string;
  workMode?: string;
  salaryMin?: number;
  salaryMax?: number;
  deadline?: string;
  techStack: string[];
  description?: string;
  requirements?: string;
  benefits?: string;
  startDate?: string;
  autoScreen?: boolean;
  isPublic?: boolean;
  createdAt: string;
  applicationsCount: number;
  hasAssessment: boolean;
  assessmentStatus?: string;
}

export interface JobDetailedInfo extends JobOpening {
  assessment?: {
    _id: string;
    title: string;
    description?: string;
    status: string;
    toConductRounds: {
      aptitude: boolean;
      coding: boolean;
      technicalInterview: boolean;
      hrInterview: boolean;
    };
    aptitude?: {
      _id: string;
      totalQuestions: number;
      duration: number;
      passingScore: number;
      warnings: {
        fullscreen: number;
        tabSwitch: number;
        audio: number;
      };
      scheduledDate?: string;
      startTime?: string;
      endTime?: string;
      sectionWeightage: {
        logicalReasoning: number;
        quantitative: number;
        technical: number;
        verbal: number;
      };
      candidateIds: string[];
      randomizeQuestions: boolean;
      showResultImmediately: boolean;
      allowReviewBeforeSubmit: boolean;
      negativeMarking: boolean;
      negativeMarkingPercentage?: number;
      status: string;
    };
    applicationDeadline?: string;
    assessmentStartDate?: string;
    assessmentEndDate?: string;
    sendReminders: boolean;
    publishResults: boolean;
    allowMultipleAttempts: boolean;
    maxAttempts?: number;
    instructions?: string;
    candidateInstructions?: string;
  };
}

export type JobUpdateData = Partial<Pick<JobOpening, 
  | 'description'
  | 'requirements'
  | 'benefits'
  | 'deadline'
  | 'salaryMin'
  | 'salaryMax'
  | 'isPublic'
  | 'autoScreen'
  | 'startDate'
>>;

export type AssessmentUpdateData = Partial<{
  description: string;
  applicationDeadline: string;
  assessmentStartDate: string;
  assessmentEndDate: string;
  sendReminders: boolean;
  publishResults: boolean;
  allowMultipleAttempts: boolean;
  maxAttempts: number;
  instructions: string;
  candidateInstructions: string;
}>;

// ========================================
// FETCH ALL JOBS WITH FILTER
// ========================================

export async function fetchEmployerJobs(
  statusFilter?: 'all' | 'active' | 'draft' | 'archived'
): Promise<ActionResponse<JobOpening[]>> {
  return safeAction(async () => {
    const employerId = await requireAuth();

    return await withDatabase(async () => {
      // Fetch all jobs for this employer
      const jobs = await JobOpportunityModel.find({
        employer: employerId
      }).sort({ createdAt: -1 }).lean();

      if (!jobs || jobs.length === 0) {
        return createSuccessResponse('No jobs found', []);
      }

      // Get job IDs
      const jobIds = jobs.map(job => job._id);

      // Find assessments for these jobs
      const assessments = await AssessmentModel.find({
        jobOpportunity: { $in: jobIds },
        employer: employerId
      }).lean();

      // Create a map of jobId -> assessment
      const assessmentMap = new Map();
      assessments.forEach(assessment => {
        if (assessment.jobOpportunity) {
          assessmentMap.set(assessment.jobOpportunity.toString(), assessment);
        }
      });

      // Get application counts for all jobs
      const applicationCounts = await ApplicationModel.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { $group: { _id: '$jobId', count: { $sum: 1 } } }
      ]);

      const appCountMap = new Map(
        applicationCounts.map(item => [item._id.toString(), item.count])
      );

      // Transform jobs to JobOpening format
      let jobOpenings: JobOpening[] = jobs.map(job => {
        const assessment = assessmentMap.get(job._id.toString());
        const hasAssessment = !!assessment;
        
        return {
          _id: job._id.toString(),
          title: job.title,
          department: job.department,
          position: job.position,
          employmentType: job.employmentType,
          seniority: job.seniority,
          locationType: job.locationType,
          location: job.location,
          openings: job.openings,
          experience: job.experience,
          workMode: job.workMode,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          deadline: job.deadline,
          techStack: job.techStack || [],
          description: job.description,
          requirements: job.requirements,
          benefits: job.benefits,
          startDate: job.startDate,
          autoScreen: job.autoScreen,
          isPublic: job.isPublic,
          createdAt: (job as any).createdAt?.toISOString() || new Date().toISOString(),
          applicationsCount: appCountMap.get(job._id.toString()) || 0,
          hasAssessment,
          assessmentStatus: assessment?.status,
        };
      });

      // Apply status filter based on assessment status
      if (statusFilter && statusFilter !== 'all') {
        jobOpenings = jobOpenings.filter(job => {
          if (statusFilter === 'active') {
            return job.hasAssessment && job.assessmentStatus === 'active';
          } else if (statusFilter === 'draft') {
            return !job.hasAssessment || job.assessmentStatus === 'draft';
          } else if (statusFilter === 'archived') {
            return job.hasAssessment && job.assessmentStatus === 'archived';
          }
          return true;
        });
      }

      return createSuccessResponse(
        `Found ${jobOpenings.length} jobs`,
        jobOpenings
      );
    });
  });
}

// ========================================
// FETCH DETAILED JOB INFO
// ========================================

export async function fetchJobDetails(jobId: string): Promise<ActionResponse<JobDetailedInfo>> {
  return safeAction(async () => {
    const employerId = await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return createErrorResponse('Invalid job ID');
    }

    return await withDatabase(async () => {
      // Fetch job
      const job = await JobOpportunityModel.findOne({
        _id: jobId,
        employer: employerId
      }).lean();

      if (!job) {
        return createErrorResponse('Job not found or unauthorized');
      }

      // Get applications count
      const applicationsCount = await ApplicationModel.countDocuments({
        jobId: new mongoose.Types.ObjectId(jobId)
      });

      // Fetch assessment if exists
      const assessment = await AssessmentModel.findOne({
        jobOpportunity: new mongoose.Types.ObjectId(jobId),
        employer: employerId
      }).lean();

      // Build base job info
      const jobDetail: JobDetailedInfo = {
        _id: job._id.toString(),
        title: job.title,
        department: job.department,
        position: job.position,
        employmentType: job.employmentType,
        seniority: job.seniority,
        locationType: job.locationType,
        location: job.location,
        openings: job.openings,
        experience: job.experience,
        workMode: job.workMode,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        deadline: job.deadline,
        techStack: job.techStack || [],
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        startDate: job.startDate,
        autoScreen: job.autoScreen,
        isPublic: job.isPublic,
        createdAt: (job as any).createdAt?.toISOString() || new Date().toISOString(),
        applicationsCount,
        hasAssessment: !!assessment,
      };

      // Add assessment details if exists
      if (assessment) {
        jobDetail.assessmentStatus = assessment.status;
        
        const assessmentInfo: any = {
          _id: assessment._id.toString(),
          title: assessment.title,
          description: assessment.description,
          status: assessment.status,
          toConductRounds: assessment.toConductRounds,
          applicationDeadline: assessment.applicationDeadline?.toISOString(),
          assessmentStartDate: assessment.assessmentStartDate?.toISOString(),
          assessmentEndDate: assessment.assessmentEndDate?.toISOString(),
          sendReminders: assessment.sendReminders,
          publishResults: assessment.publishResults,
          allowMultipleAttempts: assessment.allowMultipleAttempts,
          maxAttempts: assessment.maxAttempts,
          instructions: assessment.instructions,
          candidateInstructions: assessment.candidateInstructions,
        };

        // Fetch aptitude details if exists
        if (assessment.aptitudeId) {
          const aptitude = await AptitudeModel.findById(assessment.aptitudeId).lean();
          
          if (aptitude) {
            assessmentInfo.aptitude = {
              _id: aptitude._id.toString(),
              totalQuestions: aptitude.totalQuestions,
              duration: aptitude.duration,
              passingScore: aptitude.passingScore,
              warnings: aptitude.warnings,
              scheduledDate: aptitude.scheduledDate?.toISOString(),
              startTime: aptitude.startTime,
              endTime: aptitude.endTime,
              sectionWeightage: aptitude.sectionWeightage,
              candidateIds: aptitude.candidateIds.map(id => id.toString()),
              randomizeQuestions: aptitude.randomizeQuestions,
              showResultImmediately: aptitude.showResultImmediately,
              allowReviewBeforeSubmit: aptitude.allowReviewBeforeSubmit,
              negativeMarking: aptitude.negativeMarking,
              negativeMarkingPercentage: aptitude.negativeMarkingPercentage,
              status: aptitude.status,
            };
          }
        }

        jobDetail.assessment = assessmentInfo;
      }

      return createSuccessResponse('Job details fetched', jobDetail);
    });
  });
}

// ========================================
// UPDATE JOB DETAILS
// ========================================

export async function updateJobDetails(
  jobId: string,
  updates: JobUpdateData
): Promise<ActionResponse<{ updated: boolean }>> {
  return safeAction(async () => {
    const employerId = await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return createErrorResponse('Invalid job ID');
    }

    return await withDatabase(async () => {
      // Verify job ownership
      const job = await JobOpportunityModel.findOne({
        _id: jobId,
        employer: employerId
      });

      if (!job) {
        return createErrorResponse('Job not found or unauthorized');
      }

      // Validate salary range if both are provided
      if (updates.salaryMin !== undefined && updates.salaryMax !== undefined) {
        if (updates.salaryMax < updates.salaryMin) {
          return createErrorResponse('Maximum salary cannot be less than minimum salary');
        }
      }

      // Validate deadline if provided
      if (updates.deadline) {
        const deadlineDate = new Date(updates.deadline);
        if (isNaN(deadlineDate.getTime())) {
          return createErrorResponse('Deadline must be a valid date');
        }
        if (deadlineDate < new Date()) {
          return createErrorResponse('Deadline must be a future date');
        }
      }

      // Update allowed fields
      Object.keys(updates).forEach(key => {
        (job as any)[key] = (updates as any)[key];
      });

      await job.save();

      return createSuccessResponse('Job updated successfully', { updated: true });
    });
  });
}

// ========================================
// UPDATE ASSESSMENT DETAILS
// ========================================

export async function updateAssessmentDetails(
  assessmentId: string,
  updates: AssessmentUpdateData
): Promise<ActionResponse<{ updated: boolean }>> {
  return safeAction(async () => {
    const employerId = await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(assessmentId)) {
      return createErrorResponse('Invalid assessment ID');
    }

    return await withDatabase(async () => {
      // Verify assessment ownership
      const assessment = await AssessmentModel.findOne({
        _id: assessmentId,
        employer: employerId
      });

      if (!assessment) {
        return createErrorResponse('Assessment not found or unauthorized');
      }

      // Validate dates if provided
      if (updates.applicationDeadline) {
        const deadline = new Date(updates.applicationDeadline);
        if (isNaN(deadline.getTime())) {
          return createErrorResponse('Application deadline must be a valid date');
        }
      }

      if (updates.assessmentStartDate) {
        const startDate = new Date(updates.assessmentStartDate);
        if (isNaN(startDate.getTime())) {
          return createErrorResponse('Assessment start date must be a valid date');
        }
      }

      if (updates.assessmentEndDate) {
        const endDate = new Date(updates.assessmentEndDate);
        if (isNaN(endDate.getTime())) {
          return createErrorResponse('Assessment end date must be a valid date');
        }
      }

      // Validate maxAttempts if provided
      if (updates.maxAttempts !== undefined && updates.maxAttempts < 1) {
        return createErrorResponse('Max attempts must be at least 1');
      }

      // Update allowed fields
      Object.keys(updates).forEach(key => {
        (assessment as any)[key] = (updates as any)[key];
      });

      await assessment.save();

      return createSuccessResponse('Assessment updated successfully', { updated: true });
    });
  });
}
