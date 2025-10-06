'use server';

import { 
  safeAction, 
  createSuccessResponse,
  createErrorResponse,
  withDatabase,
  type ActionResponse 
} from '@/utils/action-helpers';
import { requireAuth } from '@/utils/auth-helpers';
import JobOpportunityModel from '@/models/jobOpportunity.model';
import AssessmentModel from '@/models/assesment.model';
import ApplicationModel from '@/models/application.model';
import EmployerProfileModel from '@/models/employerProfile.model';
import type { JobOpportunity } from './types.d.ts';
import Candidate from '@/models/candidate.model';
import mongoose from 'mongoose';

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}hr ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function getJobOpportunities(): Promise<JobOpportunity[]> {
  return await withDatabase(async () => {
    try {
      const jobs = await JobOpportunityModel.find({ isPublic: true })
        .populate('employer', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .lean();
      console.log("Fetched jobs:", jobs.length);
      
      // Get all employer IDs to fetch their profiles
      const employerIds = jobs
        .map((job: any) => job.employer?._id)
        .filter(Boolean);
      
      // Fetch all employer profiles in one query
      const employerProfiles = await EmployerProfileModel.find({
        employer: { $in: employerIds }
      }).lean();
      
      // Create a map for quick lookup
      const employerProfileMap = new Map(
        employerProfiles.map((profile: any) => [
          profile.employer.toString(),
          profile
        ])
      );

      // Get all job IDs for aggregation queries
      const jobIds = jobs.map((job: any) => job._id);

      // Get application counts for all jobs in one query
      const applicationCounts = await ApplicationModel.aggregate([
        { $match: { jobId: { $in: jobIds } } },
        { 
          $group: { 
            _id: '$jobId', 
            total: { $sum: 1 },
            applied: { $sum: { $cond: [{ $eq: ['$status', 'applied'] }, 1, 0] } },
            underReview: { $sum: { $cond: [{ $eq: ['$status', 'under-review'] }, 1, 0] } },
            shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] } },
            interviewed: { $sum: { $cond: [{ $eq: ['$status', 'interviewed'] }, 1, 0] } },
            accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
          } 
        }
      ]);

      // Create application counts map
      const applicationCountsMap = new Map(
        applicationCounts.map((count: any) => [
          count._id.toString(),
          count
        ])
      );
      
      const jobsWithAssessments = await Promise.all(
        jobs.map(async (job: any) => {
          const assessments = await AssessmentModel.find({ jobOpportunity: job._id })
            .select('title description status toConductRounds totalCandidates completedCandidates passingCandidates overallPassingCriteria')
            .lean();

          const employerProfile = employerProfileMap.get(job.employer?._id?.toString());
          const applicationStats = applicationCountsMap.get(job._id.toString()) || { 
            total: 0, applied: 0, underReview: 0, shortlisted: 0, interviewed: 0, accepted: 0, rejected: 0 
          };
          
          // Format the job data for frontend display - properly serialize all data
          const formattedJob: JobOpportunity = {
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
            deadline: job.deadline ? new Date(job.deadline).toISOString() : undefined,
            techStack: job.techStack || [],
            description: job.description,
            requirements: job.requirements,
            benefits: job.benefits,
            startDate: job.startDate,
            autoScreen: job.autoScreen,
            isPublic: job.isPublic,
            applications: (job.applications || []).map((id: any) => id.toString()),
            _id: job._id.toString(),
            createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: job.updatedAt ? new Date(job.updatedAt).toISOString() : new Date().toISOString(),
            assessments: assessments.map((assessment: any) => ({
              title: assessment.title,
              description: assessment.description,
              status: assessment.status,
              toConductRounds: assessment.toConductRounds,
              totalCandidates: assessment.totalCandidates,
              completedCandidates: assessment.completedCandidates,
              passingCandidates: assessment.passingCandidates,
              overallPassingCriteria: assessment.overallPassingCriteria,
              _id: assessment._id.toString()
            })),
            // Add frontend display properties with real data
            company: employerProfile?.companyName || job.department,
            logo: employerProfile?.companyLogo || job.employer?.avatar || null,
            timePosted: getTimeAgo(job.createdAt ? new Date(job.createdAt) : new Date()),
            salary: job.salaryMin && job.salaryMax ? `$${job.salaryMin}k - $${job.salaryMax}k` : undefined,
            type: job.employmentType,
            applicants: applicationStats.total,
            // Add application statistics
            applicationStats: {
              total: applicationStats.total,
              applied: applicationStats.applied,
              underReview: applicationStats.underReview,
              shortlisted: applicationStats.shortlisted,
              interviewed: applicationStats.interviewed,
              accepted: applicationStats.accepted,
              rejected: applicationStats.rejected
            }
          };
          
          return formattedJob;
        })
      );
      
      return jobsWithAssessments;
    } catch (error) {
      console.error('Error fetching job opportunities:', error);
      return [];
    }
  });
}

export async function getTechStackOptions(): Promise<string[]> {
  return await withDatabase(async () => {
    try {
      // Get unique tech stack items from all job opportunities
      const techStacks = await JobOpportunityModel.distinct('techStack');
      
      // Flatten and deduplicate
      const uniqueTechStacks = [...new Set(techStacks.flat())].sort();
      
      return uniqueTechStacks;
    } catch (error) {
      console.error('Error fetching tech stack options:', error);
      // Fallback to default options
      return [
        'C++',
        'Java',
        'Web Development',
        'Android Development',
        'Blockchain Developer',
        'Python',
        'React',
        'Node.js',
        'Machine Learning',
        'DevOps',
        'iOS Development',
        'Data Science'
      ];
    }
  });
}

export async function getJobOpportunityById(id: string): Promise<JobOpportunity | null> {
  return await withDatabase(async () => {
    try {
      // Fetch the specific job opportunity with employer details
      const job: any = await JobOpportunityModel.findById(id)
        .populate('employer', 'firstName lastName avatar')
        .lean();
      
      if (!job) return null;

      // Fetch employer profile for company details
      const employerProfile = await EmployerProfileModel.findOne({ 
        employer: job.employer?._id 
      }).lean();
      
      // Fetch assessments for this job
      const assessments = await AssessmentModel.find({ jobOpportunity: id })
        .select('title description status toConductRounds totalCandidates completedCandidates passingCandidates overallPassingCriteria')
        .lean();

      // Get application statistics for this job
      const applicationStats = await ApplicationModel.aggregate([
        { $match: { jobId: job._id } },
        { 
          $group: { 
            _id: null,
            total: { $sum: 1 },
            applied: { $sum: { $cond: [{ $eq: ['$status', 'applied'] }, 1, 0] } },
            underReview: { $sum: { $cond: [{ $eq: ['$status', 'under-review'] }, 1, 0] } },
            shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] } },
            interviewed: { $sum: { $cond: [{ $eq: ['$status', 'interviewed'] }, 1, 0] } },
            accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
          } 
        }
      ]);

      const stats = applicationStats[0] || { 
        total: 0, applied: 0, underReview: 0, shortlisted: 0, interviewed: 0, accepted: 0, rejected: 0 
      };
      
      // Generate selection rounds based on assessments
      const selectionRounds: string[] = [];
      const hasAssessments = assessments.length > 0;
      
      if (hasAssessments) {
        const rounds = assessments[0]?.toConductRounds;
        if (rounds?.aptitude) selectionRounds.push('Aptitude Test');
        if (rounds?.coding) selectionRounds.push('Coding Challenge');
        if (rounds?.technicalInterview) selectionRounds.push('Technical Interview');
        if (rounds?.hrInterview) selectionRounds.push('HR Interview');
      } else {
        // Default rounds if no assessments
        selectionRounds.push('Initial Screening', 'Technical Interview', 'Final Interview');
      }
      
      // Enhanced job details for the details page - properly serialize all data
      const jobDetails: JobOpportunity = {
        // Serialize all basic fields
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
        deadline: job.deadline ? new Date(job.deadline).toISOString() : undefined,
        techStack: job.techStack || [],
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        startDate: job.startDate,
        autoScreen: job.autoScreen,
        isPublic: job.isPublic,
        applications: (job.applications || []).map((id: any) => id.toString()),
        _id: job._id.toString(),
        createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: job.updatedAt ? new Date(job.updatedAt).toISOString() : new Date().toISOString(),
        assessments: assessments.map((assessment: any) => ({
          title: assessment.title,
          description: assessment.description,
          status: assessment.status,
          toConductRounds: assessment.toConductRounds,
          totalCandidates: assessment.totalCandidates,
          completedCandidates: assessment.completedCandidates,
          passingCandidates: assessment.passingCandidates,
          overallPassingCriteria: assessment.overallPassingCriteria,
          _id: assessment._id.toString()
        })),
        // Frontend display properties with real data
        company: employerProfile?.companyName || job.department,
        logo: employerProfile?.companyLogo || job.employer?.avatar || null,
        timePosted: getTimeAgo(job.createdAt ? new Date(job.createdAt) : new Date()),
        salary: job.salaryMin && job.salaryMax ? `$${job.salaryMin}k - $${job.salaryMax}k` : undefined,
        type: job.employmentType,
        profileMatch: Math.floor(Math.random() * 20) + 80, // Mock profile match 80-100%
        applicants: stats.total,
        selectionRounds,
        // Application statistics
        applicationStats: {
          total: stats.total,
          applied: stats.applied,
          underReview: stats.underReview,
          shortlisted: stats.shortlisted,
          interviewed: stats.interviewed,
          accepted: stats.accepted,
          rejected: stats.rejected
        },
        // Split requirements and benefits if they contain line breaks or bullets
        requirementsList: job.requirements ? job.requirements.split('\n').filter((req: string) => req.trim()) : undefined,
        benefitsList: job.benefits ? job.benefits.split('\n').filter((benefit: string) => benefit.trim()) : undefined,
      };
      
      return jobDetails;
    } catch (error) {
      console.error('Error fetching job opportunity by ID:', error);
      return null;
    }
  });
}

export async function getResumes(candidateId?: string) {
  return await withDatabase(async () => {
    try {
      if (!candidateId) {
        throw new Error('User ID is required');
      }

      const Resume = (await import('@/models/resume.model')).default;
      
      const resumes = await Resume.find({ candidateId })
        .sort({ uploadedAt: -1 })
        .lean();
      
      return resumes.map((resume: any) => ({
        id: resume._id.toString(),
        name: resume.fileName.replace(/\.[^/.]+$/, ""), 
        fileName: resume.originalFileName,
        uploadedAt: new Date(resume.uploadedAt).toISOString().split('T')[0],
        size: formatFileSize(resume.fileSize),
        url: resume.s3Url,
        version: resume.version,
        mimeType: resume.mimeType
      }));
    } catch (error) {
      console.error('Error fetching resumes:', error);
      return [];
    }
  });
}

export async function getCandidateApplications(): Promise<ActionResponse<any[]>> {
  return safeAction(async () => {
    const candidateId = await requireAuth();

    return await withDatabase(async () => {
      // Import Application model
      const Application = (await import('@/models/application.model')).default;
      
      // Fetch all applications for the candidate
      const applications = await Application.find({ candidateId })
        .populate('jobId', 'title department location employmentType salaryMin salaryMax')
        .populate('resumeId', 'fileName originalFileName')
        .sort({ applicationDate: -1 })
        .lean();
      
      const formattedApplications = applications.map((app: any) => ({
        id: app._id.toString(),
        jobTitle: app.jobId?.title || 'Unknown Job',
        company: app.jobId?.department || 'Unknown Company',
        location: app.jobId?.location || 'Unknown Location',
        salary: app.jobId?.salaryMin && app.jobId?.salaryMax 
          ? `$${app.jobId.salaryMin}k - $${app.jobId.salaryMax}k` 
          : 'Not specified',
        employmentType: app.jobId?.employmentType || 'Unknown',
        applicationDate: new Date(app.applicationDate).toLocaleDateString(),
        status: app.status,
        resumeName: app.resumeId?.originalFileName || 'No resume attached',
        notes: app.notes
      }));

      return createSuccessResponse('Applications fetched successfully', formattedApplications);
    });
  });
}

export async function applyToJob(
  jobId: string, 
  resumeId?: string
): Promise<ActionResponse<{ applicationId: string }>> {
  return safeAction(async () => {
    const candidateId = await requireAuth();

    return await withDatabase(async () => {
      // Check if candidate exists
      const candidateExists = await Candidate.findById(candidateId);
      if (!candidateExists) {
        return createErrorResponse('Candidate not found');
      }
      
      // Check if job exists
      const job = await JobOpportunityModel.findById(jobId);
      if (!job) {
        return createErrorResponse('Job not found');
      }

      // Import Application model
      const Application = (await import('@/models/application.model')).default;
      
      // Check if candidate has already applied to this job
      const existingApplication = await Application.findOne({ 
        candidateId: candidateId,
        jobId: jobId 
      });
      
      if (existingApplication) {
        return createErrorResponse('You have already applied to this job');
      }

      // Validate resume if provided
      let resumeObjectId = null;
      if (resumeId) {
        const Resume = (await import('@/models/resume.model')).default;
        const resume = await Resume.findOne({ 
          _id: resumeId, 
          candidateId: candidateId 
        });
        
        if (!resume) {
          return createErrorResponse('Selected resume not found or does not belong to you');
        }
        resumeObjectId = new mongoose.Types.ObjectId(resumeId);
      }

      // Create new application
      const newApplication = new Application({
        candidateId: new mongoose.Types.ObjectId(candidateId),
        jobId: new mongoose.Types.ObjectId(jobId),
        resumeId: resumeObjectId,
        applicationDate: new Date(),
        status: 'applied'
      });

      const savedApplication = await newApplication.save();

      // Add application ID to the job's applications array
      await JobOpportunityModel.findByIdAndUpdate(
        jobId,
        { $push: { applications: savedApplication._id } },
        { new: true }
      );
      
      return createSuccessResponse(
        'Application submitted successfully!',
        { applicationId: (savedApplication._id as mongoose.Types.ObjectId).toString() }
      );
    });
  });
}
