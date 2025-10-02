export interface ProfileData {
  name: string;
  tagline: string;
  summary?: string;
  workDetails: WorkExperience[];
  profileImage?: string;
  education: Education[];
  skills: string;
  projects: Project[];
  certificates: Certificate[];
  socialLinks: SocialLinks;
  resume: {
    id: string;
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }[];
}

export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  location: string;
  description: string;
  responsibilities: string[];
}

export interface Education {
  year: string;
  degree: string;
  institution: string;
}

export interface Project {
  name: string;
  description: string;
  link: string;
}

export interface Certificate {
  name: string;
  issuer: string;
  link: string;
}

export interface SocialLinks {
  linkedin: string;
  github: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: ProfileData | null;
  completionPercentage: number;
  error?: string;
}
