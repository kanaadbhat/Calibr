export interface Job {
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  match: string;
  skills: string;
}

export interface JobOpportunity {
  _id: string;
  title: string;
  department: string;
  position: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  seniority: 'junior' | 'mid' | 'senior' | 'lead';
  locationType: 'remote' | 'hybrid' | 'onsite';
  location: string;
  openings: number;
  employer: {
    _id: string;
    companyName: string;
    logo?: string;
  };
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  _id: string;
  candidateId: string;
  jobId: string;
  job?: JobOpportunity;
  resumeId?: string;
  applicationDate: Date;
  status: 'applied' | 'under-review' | 'shortlisted' | 'interviewed' | 'rejected' | 'accepted' | 'withdrawn';
  assessment?: {
    assessmentId: string;
    status: string;
    title: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Interview {
  id: string;
  company: string;
  type: string;
  time: string;
  status: string;
  urgent: boolean;
}

export interface Activity {
  title: string;
  description: string;
  time: string;
  icon: any;
  type: 'success' | 'info';
}

export interface Skill {
  name: string;
  level: string;
  progress: number;
}

export interface PerformanceData {
  overallScore: { 
    current: number; 
    previous: number; 
    trend: 'up' | 'down' | 'stable';
    tip: string;
  };
  completedAssessments: { 
    current: number; 
    total: number; 
    percentage: number;
    lastMonthCompleted: number;
    tip: string;
  };
  upcomingInterviews: { 
    count: number; 
    nextTime: string;
    successRate: number;
    lastMonthCount: number;
    tip: string;
  };
  skillLevel: {
    current: string;
    progress: number;
    nextLevel: string;
    improvement: number;
    tip: string;
  };
}

export interface DashboardData {
  performanceData: PerformanceData;
  interviews: Interview[];
  activities: Activity[];
  skillData: {
    skills: Skill[];
    radarData: any[];
    recommendation: string;
  };
  jobs: Job[];
}
