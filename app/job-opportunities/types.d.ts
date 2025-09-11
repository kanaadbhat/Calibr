export interface JobOpportunity {
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
  candidateIds: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Assessment related data (populated from Assessment schema)
  assessments?: {
    _id: string;
    title: string;
    description?: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    toConductRounds: {
      aptitude: boolean;
      coding: boolean;
      technicalInterview: boolean;
      hrInterview: boolean;
    };
    totalCandidates: number;
    completedCandidates: number;
    passingCandidates: number;
  }[];
  
  // Frontend display properties
  company?: string;
  logo?: string;
  timePosted?: string;
  salary?: string;
  type?: string;
  profileMatch?: number;
  applicants?: number;
  selectionRounds?: string[];
  
  // Override for frontend display (when requirements/benefits are split into arrays)
  requirementsList?: string[];
  benefitsList?: string[];
}

export interface TechStackFilter {
  name: string;
  selected: boolean;
}

export interface JobFilters {
  techStack: string[];
  experience: number[];
  location: string;
}
