'use server';

import { connectToDatabase } from '@/utils/connectDb';
import JobOpportunityModel from '@/models/jobOpportunity.model';
import AssessmentModel from '@/models/assesment.model';
import type { JobOpportunity } from './types.d.ts';
import Candidate from '@/models/candidate.model';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export async function getJobOpportunities(): Promise<JobOpportunity[]> {
  try {
    await connectToDatabase();

    const jobs = await JobOpportunityModel.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .lean();
     console.log("Fetched jobs:", jobs.length);
    const jobsWithAssessments = await Promise.all(
      jobs.map(async (job: any) => {
        const assessments = await AssessmentModel.find({ jobOpportunity: job._id })
          .select('title description status toConductRounds totalCandidates completedCandidates passingCandidates')
          .lean();
        
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
            _id: assessment._id.toString()
          })),
          // Add frontend display properties
          company: job.department, 
          logo: null,
          timePosted: getTimeAgo(job.createdAt ? new Date(job.createdAt) : new Date()),
          salary: job.salaryMin && job.salaryMax ? `$${job.salaryMin}k - $${job.salaryMax}k` : undefined,
          type: job.employmentType,
          applicants: (job.applications || []).length
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
    const job: any = await JobOpportunityModel.findById(id).lean();
    
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
      // Frontend display properties
      company: job.department,
      logo: null, // Use Avatar fallback for company initials
      timePosted: getTimeAgo(job.createdAt ? new Date(job.createdAt) : new Date()),
      salary: job.salaryMin && job.salaryMax ? `$${job.salaryMin}k - $${job.salaryMax}k` : undefined,
      type: job.employmentType,
      profileMatch: Math.floor(Math.random() * 20) + 80, // Mock profile match 80-100%
      applicants: (job.applications || []).length,
      selectionRounds,
      // Split requirements and benefits if they contain line breaks or bullets
      requirementsList: job.requirements ? job.requirements.split('\n').filter((req: string) => req.trim()) : undefined,
      benefitsList: job.benefits ? job.benefits.split('\n').filter((benefit: string) => benefit.trim()) : undefined,
    };
    
    return jobDetails;
  } catch (error) {
    console.error('Error fetching job opportunity by ID:', error);
    return null;
  }
}

export async function getResumes(candidateId?: string) {
  try {
    await connectToDatabase();
    
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
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function getCandidateApplications() {
  try {
    await connectToDatabase();
    
    // Get the current authenticated user
    const session = await getServerSession(authOptions);
    const candidateId = session?.user._id;
    
    if (!candidateId) {
      throw new Error('User not authenticated');
    }

    // Import Application model
    const Application = (await import('@/models/application.model')).default;
    
    // Fetch all applications for the candidate
    const applications = await Application.find({ candidateId })
      .populate('jobId', 'title department location employmentType salaryMin salaryMax')
      .populate('resumeId', 'fileName originalFileName')
      .sort({ applicationDate: -1 })
      .lean();
    
    return applications.map((app: any) => ({
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
    
  } catch (error) {
    console.error('Error fetching candidate applications:', error);
    return [];
  }
}

export async function applyToJob(jobId: string, resumeId?: string) {
  await connectToDatabase();
  try {
    const session = await getServerSession(authOptions);
    const candidateId = session?.user._id;
    if (!candidateId) {
      throw new Error('User not authenticated');
    }
    
    // Check if candidate exists
    const candidateExists = await Candidate.findById(candidateId);
    if (!candidateExists) {
      throw new Error('Candidate not found');
    }
    
    // Check if job exists
    const job = await JobOpportunityModel.findById(jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    // Import Application model
    const Application = (await import('@/models/application.model')).default;
    
    // Check if candidate has already applied to this job
    const existingApplication = await Application.findOne({ 
      candidateId: candidateId,
      jobId: jobId 
    });
    
    if (existingApplication) {
      throw new Error('You have already applied to this job');
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
        throw new Error('Selected resume not found or does not belong to you');
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
    
    return { 
      success: true, 
      message: 'Application submitted successfully!',
      applicationId: (savedApplication._id as mongoose.Types.ObjectId).toString()
    };
  } catch (error) {
    console.error('Error applying to job:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to submit application');
  }
}