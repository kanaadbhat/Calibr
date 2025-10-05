'use server';

import { 
  safeAction, 
  createSuccessResponse, 
  type ActionResponse 
} from '@/utils/action-helpers';
import { Job, Interview, Activity, Skill, PerformanceData } from '../types.d';

// ========================================
// MOCK DATA
// ========================================

const mockPerformanceData: PerformanceData = {
  overallScore: {
    current: 78,
    previous: 72,
    trend: 'up',
    tip: "Great improvement! Keep taking assessments to boost your score further."
  },
  completedAssessments: { 
    current: 12, 
    total: 15, 
    percentage: 80,
    lastMonthCompleted: 8,
    tip: "You've completed 4 more assessments than last month. Excellent progress!"
  },
  upcomingInterviews: { 
    count: 3, 
    nextTime: 'Aug 27 2:00 PM',
    successRate: 85,
    lastMonthCount: 2,
    tip: "Your interview success rate has improved by 10% this month."
  },
  skillLevel: {
    current: 'Advanced',
    progress: 78,
    nextLevel: 'Expert',
    improvement: 12,
    tip: "22% more to reach Expert level. Focus on advanced JavaScript concepts."
  }
};

const mockInterviews: Interview[] = [
  {
    id: '1',
    company: 'TechCorp Inc.',
    type: 'Technical Interview',
    time: 'Aug 27, 2:00 PM - 3:00 PM',
    status: 'Join Now',
    urgent: true
  },
  {
    id: '2',
    company: 'StartupXYZ',
    type: 'HR Round',
    time: 'Aug 28, 10:00 AM',
    status: 'Scheduled',
    urgent: false
  },
  {
    id: '3',
    company: 'Enterprise Co.',
    type: 'Final Round',
    time: 'Aug 30, 3:00 PM',
    status: 'Scheduled',
    urgent: false
  }
];

const mockActivities: Activity[] = [
  {
    title: 'JavaScript Assessment Completed',
    description: 'Scored 85% - Excellent performance',
    time: 'Aug 27, 12:30 PM',
    icon: null,
    type: 'success'
  },
  {
    title: 'Interview Scheduled',
    description: 'TechCorp Inc. - Technical Round',
    time: 'Aug 26, 4:15 PM',
    icon: null,
    type: 'info'
  },
  {
    title: 'Application Submitted',
    description: 'Senior Frontend Developer at StartupXYZ',
    time: 'Aug 25, 2:00 PM',
    icon: null,
    type: 'info'
  }
];

const mockSkills: Skill[] = [
  { name: 'JavaScript', level: 'Advanced (85%)', progress: 85 },
  { name: 'React', level: 'Advanced (82%)', progress: 82 },
  { name: 'TypeScript', level: 'Intermediate (70%)', progress: 70 },
  { name: 'Node.js', level: 'Intermediate (65%)', progress: 65 },
  { name: 'Python', level: 'Beginner (45%)', progress: 45 }
];

const mockRadarData = [
  { skill: 'JavaScript', value: 85 },
  { skill: 'React', value: 82 },
  { skill: 'TypeScript', value: 70 },
  { skill: 'Node.js', value: 65 },
  { skill: 'Python', value: 45 }
];

const mockJobs: Job[] = [
  {
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$120k - $150k',
    type: 'Full-time • Remote friendly',
    match: '92% Match',
    skills: 'React, JavaScript, Node.js, TypeScript'
  },
  {
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    salary: '$100k - $130k',
    type: 'Full-time • Remote',
    match: '88% Match',
    skills: 'React, Node.js, MongoDB, AWS'
  }
];

// ========================================
// PERFORMANCE DATA ACTIONS
// ========================================

export async function fetchPerformanceData(): Promise<ActionResponse<PerformanceData>> {
  return safeAction(async () => {
    // Future: Replace with actual database call
    return createSuccessResponse('Performance data fetched successfully', mockPerformanceData);
  }, 'Failed to fetch performance data');
}

export async function updatePerformanceData(updates: Partial<PerformanceData>): Promise<ActionResponse> {
  return safeAction(async () => {
    // Future: Update performance data in database
    console.log('Updating performance data:', updates);
    return createSuccessResponse('Performance data updated successfully');
  }, 'Failed to update performance data');
}

// ========================================
// INTERVIEW ACTIONS
// ========================================

export async function fetchUpcomingInterviews(): Promise<ActionResponse<Interview[]>> {
  return safeAction(async () => {
    // Future: Replace with actual database call
    return createSuccessResponse('Interviews fetched successfully', mockInterviews);
  }, 'Failed to fetch interviews');
}

export async function joinInterview(interviewId: string): Promise<ActionResponse<{ meetingLink: string }>> {
  return safeAction(async () => {
    // Future: Generate meeting link or join interview
    console.log('Joining interview:', interviewId);
    const meetingLink = 'https://meet.example.com/interview-link';
    return createSuccessResponse('Interview link generated', { meetingLink });
  }, 'Failed to join interview');
}

export async function rescheduleInterview(interviewId: string, newTime: string): Promise<ActionResponse> {
  return safeAction(async () => {
    // Future: Reschedule interview in database
    console.log('Rescheduling interview:', interviewId, 'to', newTime);
    return createSuccessResponse('Interview rescheduled successfully');
  }, 'Failed to reschedule interview');
}

// ========================================
// ACTIVITY ACTIONS
// ========================================

export async function fetchRecentActivity(): Promise<ActionResponse<Activity[]>> {
  return safeAction(async () => {
    // Future: Replace with actual database call
    return createSuccessResponse('Activities fetched successfully', mockActivities);
  }, 'Failed to fetch activities');
}

export async function markActivityAsRead(activityId: string): Promise<ActionResponse> {
  return safeAction(async () => {
    // Future: Mark activity as read in database
    console.log('Marking activity as read:', activityId);
    return createSuccessResponse('Activity marked as read');
  }, 'Failed to mark activity as read');
}

// ========================================
// SKILL ACTIONS
// ========================================

export async function fetchSkillAnalysis(): Promise<ActionResponse<{ skills: Skill[], radarData: any[], recommendation: string }>> {
  return safeAction(async () => {
    // Future: Replace with actual database call
    const recommendation = 'Focus on improving Python skills to reach Advanced level.';
    return createSuccessResponse('Skill analysis fetched successfully', {
      skills: mockSkills,
      radarData: mockRadarData,
      recommendation
    });
  }, 'Failed to fetch skill analysis');
}

export async function updateSkillProgress(skillName: string, progress: number): Promise<ActionResponse> {
  return safeAction(async () => {
    // Future: Update skill progress in database
    console.log('Updating skill progress:', skillName, progress);
    return createSuccessResponse('Skill progress updated successfully');
  }, 'Failed to update skill progress');
}

// ========================================
// JOB ACTIONS
// ========================================

export async function fetchJobRecommendations(): Promise<ActionResponse<Job[]>> {
  return safeAction(async () => {
    // Future: Replace with actual database call
    return createSuccessResponse('Job recommendations fetched successfully', mockJobs);
  }, 'Failed to fetch job recommendations');
}

export async function quickApply(jobId: string): Promise<ActionResponse> {
  return safeAction(async () => {
    // Future: Submit quick application to database
    console.log('Quick applying to job:', jobId);
    return createSuccessResponse('Application submitted successfully!');
  }, 'Failed to submit application');
}

export async function saveJob(jobId: string): Promise<ActionResponse> {
  return safeAction(async () => {
    // Future: Save job to user's saved list in database
    console.log('Saving job:', jobId);
    return createSuccessResponse('Job saved successfully');
  }, 'Failed to save job');
}

export async function fetchJobDetails(jobId: string): Promise<ActionResponse<Job & { description: string; requirements: string[] }>> {
  return safeAction(async () => {
    // Future: Fetch detailed job information from database
    console.log('Fetching job details:', jobId);
    const jobDetails = {
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      salary: '$120k - $150k',
      type: 'Full-time • Remote friendly',
      match: '92% Match',
      skills: 'React, JavaScript, Node.js, TypeScript',
      description: 'We are looking for a skilled Frontend Developer to join our growing team...',
      requirements: [
        '5+ years React experience',
        'TypeScript proficiency',
        'Strong understanding of web performance',
        'Experience with state management libraries'
      ]
    };
    return createSuccessResponse('Job details fetched successfully', jobDetails);
  }, 'Failed to fetch job details');
}

