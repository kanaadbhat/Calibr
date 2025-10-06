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
  applications?: string[]; // Array of application IDs as strings
  createdAt: string; // Serialized as ISO string
  updatedAt: string; // Serialized as ISO string
  
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
    overallPassingCriteria?: {
      minimumRoundsToPass: number;
      overallMinimumScore?: number;
      weightagePerRound: {
        aptitude?: number;
        coding?: number;
        technicalInterview?: number;
        hrInterview?: number;
      };
    };
  }[];
  
  // Frontend display properties
  company?: string;
  logo?: string | null;
  timePosted?: string;
  salary?: string;
  type?: string;
  profileMatch?: number;
  applicants?: number;
  selectionRounds?: string[];
  
  // Application statistics (from Application model)
  applicationStats?: {
    total: number;
    applied: number;
    underReview: number;
    shortlisted: number;
    interviewed: number;
    accepted: number;
    rejected: number;
  };
  
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
