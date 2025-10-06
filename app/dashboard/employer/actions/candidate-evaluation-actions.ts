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
import ApplicationModel from '@/models/application.model';
import CandidateProfileModel from '@/models/candidateProfile.model';
import CandidateModel from '@/models/candidate.model';
import mongoose from 'mongoose';

export interface JobOpportunityBasic {
  _id: string;
  title: string;
  department: string;
  position: string;
  location: string;
  employmentType: string;
}

export interface CandidateEvaluation {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  position: string;
  applicationStatus: 'applied' | 'under-review' | 'shortlisted' | 'interviewed' | 'rejected' | 'accepted' | 'withdrawn';
  rounds: {
    aptitude: 'pending' | 'shortlisted' | 'rejected' | 'completed';
    coding: 'pending' | 'shortlisted' | 'rejected' | 'completed';
    technicalInterview: 'pending' | 'shortlisted' | 'rejected' | 'completed';
    hrInterview: 'pending' | 'shortlisted' | 'rejected' | 'completed';
  };
  appliedDate: string;
  // Placeholder for scores - will be calculated from assessment results
  overallScore?: number;
  aptitudeScore?: number;
  codingScore?: number;
  technicalScore?: number;
  hrScore?: number;
}

export async function fetchEmployerJobs(): Promise<ActionResponse<JobOpportunityBasic[]>> {
  return safeAction(async () => {
    const employerId = await requireAuth();
    
    if (!employerId) {
      return createErrorResponse('User not authenticated');
    }

    return await withDatabase(async () => {
      const jobs = await JobOpportunityModel.find({
        employer: new mongoose.Types.ObjectId(employerId)
      })
        .select('_id title department position location employmentType')
        .sort({ createdAt: -1 })
        .lean();

      const formattedJobs: JobOpportunityBasic[] = jobs.map(job => ({
        _id: job._id.toString(),
        title: job.title,
        department: job.department,
        position: job.position,
        location: job.location,
        employmentType: job.employmentType
      }));

      return createSuccessResponse('Jobs fetched successfully', formattedJobs);
    });
  });
}

export async function fetchShortlistedCandidates(jobId?: string): Promise<ActionResponse<CandidateEvaluation[]>> {
  return safeAction(async () => {
    const employerId = await requireAuth();
    
    if (!employerId) {
      return createErrorResponse('User not authenticated');
    }

    return await withDatabase(async () => {
      // Build query based on jobId filter
      const query: any = {};
      
      if (jobId && jobId !== 'all') {
        query.jobId = new mongoose.Types.ObjectId(jobId);
      }

      // Fetch applications with at least one shortlisted round
      const applications = await ApplicationModel.find({
        ...query,
        $or: [
          { 'rounds.aptitude': 'shortlisted' },
          { 'rounds.coding': 'shortlisted' },
          { 'rounds.technicalInterview': 'shortlisted' },
          { 'rounds.hrInterview': 'shortlisted' },
          { 'rounds.aptitude': 'completed' },
          { 'rounds.coding': 'completed' },
          { 'rounds.technicalInterview': 'completed' },
          { 'rounds.hrInterview': 'completed' }
        ]
      })
        .populate({
          path: 'jobId',
          select: 'position employer',
          match: { employer: new mongoose.Types.ObjectId(employerId) }
        })
        .lean();

      // Filter out applications where job doesn't belong to this employer
      console.log("Applications" , applications);
      const validApplications = applications.filter(app => app.jobId);

      // Get unique candidate IDs
      const candidateIds = [...new Set(validApplications.map(app => app.candidateId))];

      // Fetch candidate profiles and core candidate docs in parallel
      const [candidateProfiles, candidateDocs] = await Promise.all([
        CandidateProfileModel.find({
          candidate: { $in: candidateIds }
        })
          .populate({
            path: 'candidate',
            select: 'email'
          })
          .lean(),
        CandidateModel.find({
          _id: { $in: candidateIds }
        })
          .select('email firstName lastName avatar')
          .lean()
      ]);

      // Create maps of candidateId to profile and to base candidate
      const profileMap = new Map(
        candidateProfiles.map(profile => [
          profile.candidate.toString(),
          profile
        ])
      );
      const candidateMap = new Map(
        candidateDocs.map((c: any) => [
          c._id.toString(),
          c
        ])
      );

      // Combine application and profile data
      const candidates: CandidateEvaluation[] = validApplications.map(app => {
        const cid = app.candidateId.toString();
        const profile = profileMap.get(cid) as any;
        const base = candidateMap.get(cid) as any;

        const fullName = profile?.name || [base?.firstName, base?.lastName].filter(Boolean).join(' ') || 'Unknown';
        const email = base?.email || (profile?.candidate as any)?.email || 'N/A';
        const avatar = profile?.profileImage || base?.avatar;

        return {
          id: cid,
          name: fullName,
          email,
          profileImage: avatar,
          position: (app.jobId as any)?.position || 'N/A',
          applicationStatus: app.status,
          rounds: {
            aptitude: app.rounds?.aptitude || 'pending',
            coding: app.rounds?.coding || 'pending',
            technicalInterview: app.rounds?.technicalInterview || 'pending',
            hrInterview: app.rounds?.hrInterview || 'pending'
          },
          appliedDate: app.applicationDate.toISOString(),
          // TODO: Calculate scores from assessment results
          overallScore: undefined,
          aptitudeScore: undefined,
          codingScore: undefined,
          technicalScore: undefined,
          hrScore: undefined
        };
      });

      return createSuccessResponse('Candidates fetched successfully', candidates);
    });
  });
}
