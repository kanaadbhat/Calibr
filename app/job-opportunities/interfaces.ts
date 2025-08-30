export interface JobOpportunity {
  id: number;
  company: string;
  logo: string;
  title: string;
  position: string;
  timePosted: string;
  location: string;
  techStack: string[];
  description?: string;
  salary?: string;
  type?: string;
  requirements?: string[];
  responsibilities?: string[];
  profileMatch?: number;
  startDate?: string;
  selectionRounds?: string[];
  benefits?: string[];
  workMode?: string;
  experience?: string;
  postedDate?: string;
  applicants?: number;
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
