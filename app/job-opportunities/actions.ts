'use server';

import { connectToDatabase } from '@/utils/connectDb';
import JobOpportunityModel from '@/models/jobOpportunity.model';
import AssessmentModel from '@/models/assesment.model';
import type { JobOpportunity } from './types.d.ts';
import Candidate from '@/models/candidate.model';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function getJobOpportunities(): Promise<JobOpportunity[]> {
  try {
    await connectToDatabase();
      
    // Fetch all public job opportunities with their assessments
    const jobs = await JobOpportunityModel.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .lean();
     console.log("Fetched jobs:", jobs.length);
    // Get assessments for each job
    const jobsWithAssessments = await Promise.all(
      jobs.map(async (job) => {
        const assessments = await AssessmentModel.find({ jobOpportunity: job._id })
          .select('title description status toConductRounds totalCandidates completedCandidates passingCandidates')
          .lean();
        
        // Format the job data for frontend display
        const formattedJob: JobOpportunity = {
          ...job,
          _id: job._id.toString(),
          createdAt: (job as any).createdAt || new Date(),
          updatedAt: (job as any).updatedAt || new Date(),
          assessments: assessments.map(assessment => ({
            ...assessment,
            _id: assessment._id.toString()
          })),
          // Add frontend display properties
          company: job.department, // Using department as company for now
          logo: '/api/placeholder/60/60', // Default logo
          timePosted: getTimeAgo((job as any).createdAt || new Date()),
          salary: job.salaryMin && job.salaryMax ? `$${job.salaryMin}k - $${job.salaryMax}k` : undefined,
          type: job.employmentType,
          applicants: assessments.reduce((total, assessment) => total + (assessment.totalCandidates || 0), 0)
        };
        
        return formattedJob;
      })
    );
    
    return jobsWithAssessments;
  } catch (error) {
    console.error('Error fetching job opportunities:', error);
    return [];
  }
}

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

export async function getTechStackOptions(): Promise<string[]> {
  try {
    await connectToDatabase();
    
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
}

export async function getJobOpportunityById(id: string): Promise<JobOpportunity | null> {
  try {
    await connectToDatabase();
    
    // Fetch the specific job opportunity
    const job = await JobOpportunityModel.findById(id).lean();
    
    if (!job) return null;
    
    // Fetch assessments for this job
    const assessments = await AssessmentModel.find({ jobOpportunity: id })
      .select('title description status toConductRounds totalCandidates completedCandidates passingCandidates overallPassingCriteria')
      .lean();
    
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
    
    // Enhanced job details for the details page
    const jobDetails: JobOpportunity = {
      ...job,
      _id: job._id.toString(),
      createdAt: (job as any).createdAt || new Date(),
      updatedAt: (job as any).updatedAt || new Date(),
      assessments: assessments.map(assessment => ({
        ...assessment,
        _id: assessment._id.toString()
      })),
      // Frontend display properties
      company: job.department,
      logo: '/api/placeholder/60/60',
      timePosted: getTimeAgo((job as any).createdAt || new Date()),
      salary: job.salaryMin && job.salaryMax ? `$${job.salaryMin}k - $${job.salaryMax}k` : undefined,
      type: job.employmentType,
      profileMatch: Math.floor(Math.random() * 20) + 80, // Mock profile match 80-100%
      applicants: assessments.reduce((total, assessment) => total + (assessment.totalCandidates || 0), 0),
      selectionRounds,
      // Split requirements and benefits if they contain line breaks or bullets
      requirementsList: job.requirements ? job.requirements.split('\n').filter(req => req.trim()) : undefined,
      benefitsList: job.benefits ? job.benefits.split('\n').filter(benefit => benefit.trim()) : undefined,
    };
    
    return jobDetails;
  } catch (error) {
    console.error('Error fetching job opportunity by ID:', error);
    return null;
  }
}

export async function getResumes() {
  // Future: Replace with actual API call to get user's resumes
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  return [
    {
      id: '1',
      name: 'College Resume',
      fileName: 'college_resume.pdf',
      uploadedAt: '2024-08-15',
      size: '245 KB'
    },
    {
      id: '2', 
      name: 'Overleaf Resume',
      fileName: 'overleaf_resume.pdf',
      uploadedAt: '2024-08-20',
      size: '312 KB'
    },
    {
      id: '3',
      name: 'Professional Resume',
      fileName: 'professional_resume.pdf',
      uploadedAt: '2024-08-25',
      size: '198 KB'
    }
  ];
}

export async function applyToJob(jobId: string) {
   await connectToDatabase();
  try {
    const session = await getServerSession(authOptions);
    const candidateId = session?.user._id;
    if (!candidateId) {
      throw new Error('User not authenticated');
    }
    // Check if candidate has already applied
    const job = await JobOpportunityModel.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    const iscandidateexist = await Candidate.findById(candidateId);
    if (!iscandidateexist) {
      throw new Error('Candidate not found');
    }
    if (Array.isArray(job.candidates) && job.candidates.includes(candidateId)) {
      throw new Error('You have already applied to this job');
    }

    // Add candidate ID to the job's candidates array
    await JobOpportunityModel.findByIdAndUpdate(
      jobId,
      { $push: { candidates: candidateId } },
      { new: true }
    );
    
    // TODO: Store application details (resume, date, etc.) in a separate Application model
    // For now, we're just tracking that the candidate applied
    
    return { success: true, message: 'Application submitted successfully!' };
  } catch (error) {
    console.error('Error applying to job:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to submit application');
  }
}