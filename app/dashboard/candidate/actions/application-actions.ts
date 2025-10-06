'use server';

import { 
  safeAction, 
  createSuccessResponse,
  createErrorResponse,
  withDatabase,
  type ActionResponse 
} from '@/utils/action-helpers';
import { requireAuth } from '@/utils/auth-helpers';
import { Application } from '../types.d';
import ApplicationModel from '@/models/application.model';
import ResumeModel from '@/models/resume.model';
import AssessmentModel from '@/models/assesment.model';
import '@/models/employer.model'; 
import '@/models/jobOpportunity.model'; 
import mongoose from 'mongoose';

export async function fetchApplications(
  statusFilter?: string
): Promise<ActionResponse<Application[]>> {
  return safeAction(async () => {
    const candidateId = await requireAuth();

    return await withDatabase(async () => {
      // Build query
      const query: any = {
        candidateId: new mongoose.Types.ObjectId(candidateId)
      };

      // Add status filter if provided and not 'all'
      if (statusFilter && statusFilter !== 'all') {
        query.status = statusFilter;
      }

      // Fetch applications with populated job details
      const applications = await ApplicationModel.find(query)
        .populate({
          path: 'jobId',
          populate: {
            path: 'employer'
          }
        })
        .sort({ applicationDate: -1 })
        .lean();

      // Filter out applications where job no longer exists and transform data
      const transformedApplications = await Promise.all(
        applications
          .filter((app: any) => app.jobId) // Only include apps where job still exists
          .map(async (app: any) => {
            // Fetch assessment information for this job
            const assessmentResult = await AssessmentModel.findOne({
              jobOpportunity: app.jobId._id,
              status: { $in: ['active', 'draft'] }
            })
              .select('_id status title')
              .lean();

            return {
              _id: app._id.toString(),
              candidateId: app.candidateId.toString(),
              jobId: app.jobId._id.toString(),
              resumeId: app.resumeId?.toString(),
              applicationDate: app.applicationDate,
              status: app.status,
              createdAt: app.createdAt,
              updatedAt: app.updatedAt,
              assessment: assessmentResult ? {
                assessmentId: assessmentResult._id.toString(),
                status: assessmentResult.status,
                title: assessmentResult.title
              } : undefined,
              job: {
                _id: app.jobId._id.toString(),
                title: app.jobId.title,
                department: app.jobId.department,
                position: app.jobId.position,
                employmentType: app.jobId.employmentType,
                seniority: app.jobId.seniority,
                locationType: app.jobId.locationType,
                location: app.jobId.location,
                openings: app.jobId.openings,
                employer: {
                  _id: app.jobId.employer._id?.toString() || app.jobId.employer.toString(),
                  companyName: app.jobId.employer.companyName || `${app.jobId.employer.firstName || ''} ${app.jobId.employer.lastName || ''}`.trim() || 'Company',
                  logo: app.jobId.employer.logo || app.jobId.employer.avatar || ''
                },
                experience: app.jobId.experience,
                salaryMin: app.jobId.salaryMin,
                salaryMax: app.jobId.salaryMax,
                techStack: app.jobId.techStack || [],
                description: app.jobId.description,
                requirements: app.jobId.requirements,
                benefits: app.jobId.benefits,
                autoScreen: app.jobId.autoScreen,
                isPublic: app.jobId.isPublic,
                createdAt: app.jobId.createdAt,
                updatedAt: app.jobId.updatedAt
              }
            };
          })
      );

      return createSuccessResponse(
        'Applications fetched successfully',
        transformedApplications as Application[]
      );
    });
  });
}

export async function fetchApplicationById(
  applicationId: string
): Promise<ActionResponse<Application>> {
  return safeAction(async () => {
    const candidateId = await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return createErrorResponse('Invalid application ID');
    }

    return await withDatabase(async () => {
      // Fetch application with populated job details
      const application = await ApplicationModel.findOne({
        _id: applicationId,
        candidateId: new mongoose.Types.ObjectId(candidateId) // Ensure user can only see their own applications
      })
        .populate({
          path: 'jobId',
          populate: {
            path: 'employer'
          }
        })
        .lean();
      
      if (!application) {
        return createErrorResponse('Application not found');
      }

      // Check if job still exists
      const app = application as any;
      if (!app.jobId) {
        return createErrorResponse('Job associated with this application no longer exists');
      }

      // Transform data to match our Application type
      const transformedApplication = {
        _id: app._id.toString(),
        candidateId: app.candidateId.toString(),
        jobId: app.jobId._id.toString(),
        resumeId: app.resumeId?.toString(),
        applicationDate: app.applicationDate,
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        job: {
          _id: app.jobId._id.toString(),
          title: app.jobId.title,
          department: app.jobId.department,
          position: app.jobId.position,
          employmentType: app.jobId.employmentType,
          seniority: app.jobId.seniority,
          locationType: app.jobId.locationType,
          location: app.jobId.location,
          openings: app.jobId.openings,
          employer: {
            _id: app.jobId.employer._id?.toString() || app.jobId.employer.toString(),
            companyName: app.jobId.employer.companyName || `${app.jobId.employer.firstName || ''} ${app.jobId.employer.lastName || ''}`.trim() || 'Company',
            logo: app.jobId.employer.logo || app.jobId.employer.avatar || ''
          },
          experience: app.jobId.experience,
          salaryMin: app.jobId.salaryMin,
          salaryMax: app.jobId.salaryMax,
          techStack: app.jobId.techStack || [],
          description: app.jobId.description,
          requirements: app.jobId.requirements,
          benefits: app.jobId.benefits,
          autoScreen: app.jobId.autoScreen,
          isPublic: app.jobId.isPublic,
          createdAt: app.jobId.createdAt,
          updatedAt: app.jobId.updatedAt
        }
      };

      return createSuccessResponse(
        'Application fetched successfully',
        transformedApplication as Application
      );
    });
  });
}

export async function withdrawApplication(
  applicationId: string
): Promise<ActionResponse> {
  return safeAction(async () => {
    const candidateId = await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return createErrorResponse('Invalid application ID');
    }

    return await withDatabase(async () => {
      // Update application status to withdrawn
      // Only allow withdrawal if status is 'applied' or 'under-review'
      const application = await ApplicationModel.findOneAndUpdate(
        {
          _id: applicationId,
          candidateId: new mongoose.Types.ObjectId(candidateId),
          status: { $in: ['applied', 'under-review'] }
        },
        { 
          status: 'withdrawn',
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (!application) {
        return createErrorResponse('Application not found or cannot be withdrawn');
      }

      return createSuccessResponse('Application withdrawn successfully');
    });
  });
}

export async function getApplicationStats(): Promise<ActionResponse<{
  total: number;
  applied: number;
  underReview: number;
  shortlisted: number;
  interviewed: number;
  rejected: number;
  accepted: number;
  withdrawn: number;
}>> {
  return safeAction(async () => {
    const candidateId = await requireAuth();

    return await withDatabase(async () => {
      // Use aggregation for efficient stats calculation
      const stats = await ApplicationModel.aggregate([
        {
          $match: { candidateId: new mongoose.Types.ObjectId(candidateId) }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      // Transform aggregation results into our stats format
      const statusCounts: Record<string, number> = {};
      stats.forEach(stat => {
        statusCounts[stat._id] = stat.count;
      });

      const result = {
        total: stats.reduce((sum, stat) => sum + stat.count, 0),
        applied: statusCounts['applied'] || 0,
        underReview: statusCounts['under-review'] || 0,
        shortlisted: statusCounts['shortlisted'] || 0,
        interviewed: statusCounts['interviewed'] || 0,
        rejected: statusCounts['rejected'] || 0,
        accepted: statusCounts['accepted'] || 0,
        withdrawn: statusCounts['withdrawn'] || 0,
      };

      return createSuccessResponse('Stats fetched successfully', result);
    });
  });
}

export async function getResumeUrl(
  resumeId: string
): Promise<ActionResponse<string>> {
  return safeAction(async () => {
    const candidateId = await requireAuth();

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return createErrorResponse('Invalid resume ID');
    }

    return await withDatabase(async () => {
      const resume = await ResumeModel.findOne({
        _id: resumeId,
        candidateId: new mongoose.Types.ObjectId(candidateId)
      }).lean();

      if (!resume) {
        return createErrorResponse('Resume not found');
      }

      return createSuccessResponse('Resume URL fetched successfully', resume.s3Url);
    });
  });
}

export async function getAssessmentByJobId(
  jobId: string
): Promise<ActionResponse<{ assessmentId: string; status: string; title: string } | null>> {
  return safeAction(async () => {
    await requireAuth(); // Ensure user is authenticated

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return createErrorResponse('Invalid job ID');
    }

    return await withDatabase(async () => {
      const assessment = await AssessmentModel.findOne({
        jobOpportunity: new mongoose.Types.ObjectId(jobId),
        status: { $in: ['active', 'draft'] } // Only return active or draft assessments
      })
        .select('_id status title')
        .lean();

      if (!assessment) {
        return createSuccessResponse('No assessment found for this job', null);
      }

      return createSuccessResponse('Assessment found', {
        assessmentId: assessment._id.toString(),
        status: assessment.status,
        title: assessment.title
      });
    });
  });
}
